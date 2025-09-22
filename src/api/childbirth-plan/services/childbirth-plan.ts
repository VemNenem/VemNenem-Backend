/**
 * childbirth-plan service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::childbirth-plan.childbirth-plan');


const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
class ChildbirthPlanService {

    async listChildbirthPlan(ctx) {
        try {
            const { documentId: userDocumentId } = ctx.state.user;

            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: userDocumentId,
                populate: ['client']
            });

            if (!user || !user.client) {
                throw new ApplicationError("Usuário não encontrado");
            }

            const client = await strapi.documents('api::client.client').findOne({
                documentId: user.client.documentId
            });

            // Busca todos os planos de parto com os relacionamentos
            const allChildbirthPlan = await strapi.documents('api::childbirth-plan.childbirth-plan').findMany({
                populate: ['clients'],
                sort: [{ type: 'desc' }], // aqui assume que seu campo de relação chama "clients"
            });

            const childbirthPlans = allChildbirthPlan.map((childbirthPlan) => {
                const isRelated = childbirthPlan.clients?.some(
                    (relatedClient) => relatedClient.documentId.toString() === client.documentId.toString()
                );

                return {
                    documentId: childbirthPlan.documentId,
                    name: childbirthPlan.name,
                    type: childbirthPlan.type,
                    clientSelect: isRelated
                };
            });

            // Mapa da ordem desejada
            const typeOrder = {
                "Trabalho de Parto": 1,
                "Parto": 2,
                "Após o Parto": 3,
                "Cuidados com o Recém-nascido": 4,
                "Cesária": 5
            };

            // Ordena conforme o mapa acima
            childbirthPlans.sort((a, b) => {
                return typeOrder[a.type] - typeOrder[b.type];
            });

            return childbirthPlans;
        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error);
            throw new ApplicationError("Ocorreu um erro, tente novamente");
        }
    }

    async selectOrUnselectChildbirthPlan(ctx) {
        try {
            const { planDocumentId } = ctx.request.query;
            const { documentId: userDocumentId } = ctx.state.user;
            const { type } = ctx.request.body;

            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: userDocumentId,
                populate: ['client']
            });

            if (!user || !user.client) {
                throw new ApplicationError("Usuário não encontrado");
            }

            const client = await strapi.documents('api::client.client').findOne({
                documentId: user.client.documentId
            });

            if (type === "unselect") {
                const up = await strapi.documents('api::childbirth-plan.childbirth-plan').update({
                    documentId: planDocumentId,
                    data: {
                        clients: {
                            disconnect: [{ documentId: client.documentId }]

                        }
                    },
                    populate: ['clients']
                })
                return up
            } else if (type === "select") {
                const up = await strapi.documents('api::childbirth-plan.childbirth-plan').update({
                    documentId: planDocumentId,
                    data: {
                        clients: {
                            connect: [{ documentId: client.documentId }]

                        }
                    },
                    populate: ['clients']
                })
                return up
            } else {
                throw new ApplicationError("Não selecionou nenhuma opção")
            }


        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error);
            throw new ApplicationError("Ocorreu um erro, tente novamente");
        }
    }

    async postChildbirthPlan(ctx) {
        const { childPlans } = ctx.request.body;
        for (const field of childPlans) {
            const plan = await strapi.documents('api::childbirth-plan.childbirth-plan').create({
                data: { name: field.name, type: field.type }
            });
        }
    }



    async pdfChildbirthPlan(ctx) {
        try {
            const fs = require('fs');
            const path = require('path');
            const PDFDocument = require('pdfkit');
            const { documentId: userDocumentId } = ctx.state.user;
            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: userDocumentId,
                populate: ['client'],
            });
            if (!user || !user.client) {
                throw new ApplicationError("Usuário não encontrado");
            }
            const client = await strapi.documents('api::client.client').findOne({
                documentId: user.client.documentId,
            });

            // Busca todos os planos de parto com os relacionamentos
            const allChildbirthPlan = await strapi.documents('api::childbirth-plan.childbirth-plan').findMany({
                populate: ['clients'],
            });

            const childbirthPlans = allChildbirthPlan.map((childbirthPlan) => {
                const isRelated = childbirthPlan.clients?.some(
                    (relatedClient) => relatedClient.documentId.toString() === client.documentId.toString()
                );
                return {
                    documentId: childbirthPlan.documentId,
                    name: childbirthPlan.name,
                    type: childbirthPlan.type,
                    clientSelect: isRelated,
                };
            });

            // Mapa da ordem desejada
            const typeOrder = {
                "Trabalho de Parto": 1,
                "Parto": 2,
                "Após o Parto": 3,
                "Cuidados com o Recém-nascido": 4,
                "Cesária": 5,
            };

            // Ordena conforme o mapa acima
            childbirthPlans.sort((a, b) => {
                return typeOrder[a.type] - typeOrder[b.type];
            });

            // Agrupa por type
            const groupedPlans = childbirthPlans.reduce((acc, plan) => {
                if (!acc[plan.type]) {
                    acc[plan.type] = [];
                }
                acc[plan.type].push(plan);
                return acc;
            }, {});

            // Prepara o filename
            const clientName = client.name ? client.name.replace(/\s+/g, '_') : 'cliente_desconhecido';
            const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD


            // Gera o PDF e salva no disco
            const doc = new PDFDocument();

            // Cabeçalho do PDF
            doc.fontSize(20).text('Plano de Parto', { align: 'center' });
            doc.moveDown(1);
            doc.fontSize(12).text(`Cliente: ${client.name || 'Não especificado'}`, { align: 'left' });
            doc.moveDown(2);

            // Itera pelos tipos na ordem
            Object.keys(typeOrder).forEach((type) => {
                if (groupedPlans[type]) {
                    doc.fontSize(16).text(type, { underline: true });
                    doc.moveDown(0.5);

                    groupedPlans[type].forEach((plan) => {
                        const check = plan.clientSelect ? '✓' : '□';
                        doc.fontSize(12).text(`${check} ${plan.name}`);
                        doc.moveDown(0.5);
                    });

                    doc.moveDown(1); // Espaço entre seções
                }
            });

            doc.end();
            const filename = `${clientName}-planoDeParto-${timestamp}.pdf`;
            const filePath = "./public/" + filename;
            doc.pipe(fs.createWriteStream(filePath));

            return filename

        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error);
            throw new ApplicationError("Ocorreu um erro, tente novamente");
        }
    }


} export { ChildbirthPlanService }