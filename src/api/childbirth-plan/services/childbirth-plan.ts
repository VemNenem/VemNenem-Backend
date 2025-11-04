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
            //acaha o user
            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: userDocumentId,
                populate: ['client']
            });

            //verificacao se tem user e user tem client

            if (!user || !user.client) {
                throw new ApplicationError("Usuário não encontrado");
            }

            //pegar o cliente
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


    //metodo para selecionar ou desselecionar um plano de parto
    async selectOrUnselectChildbirthPlan(ctx) {
        try {
            const { planDocumentId } = ctx.request.query;
            const { documentId: userDocumentId } = ctx.state.user;
            const { type } = ctx.request.body;

            //acahr o user
            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: userDocumentId,
                populate: ['client']
            });

            //verificacao se tem user e user tem client
            if (!user || !user.client) {
                throw new ApplicationError("Usuário não encontrado");
            }

            //pegar o cliente
            const client = await strapi.documents('api::client.client').findOne({
                documentId: user.client.documentId
            });


            //se o type for de dessselecionar
            if (type === "unselect") {
                //updadte desconectando o client
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
                //se o type for de selecionar
            } else if (type === "select") {
                //updadte conectando o client
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


    //metodo para criar os planos de parto caso o banco seja perdido
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

            // Cores
            const primaryColor = '#27d3d6';
            const backgroundColor = '#f9f9f9';
            const textColor = '#333333';

            // Gera o PDF e salva no disco
            const doc = new PDFDocument({ margin: 50 });

            // Função para adicionar rodapé
            const addFooter = () => {
                const bottom = doc.page.height - 50;
                doc.fillColor('#999999')
                    .fontSize(10)
                    .text(
                        `Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
                        50,
                        bottom,
                        { align: 'center', lineBreak: false }
                    );
            };

            // Função para criar uma nova página com rodapé na anterior
            const createNewPage = () => {
                addFooter(); // Adiciona rodapé na página atual antes de criar nova
                doc.addPage();
            };

            // Fundo colorido para o cabeçalho
            doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);

            // Cabeçalho do PDF
            doc.fillColor('#ffffff')
                .fontSize(28)
                .font('Helvetica-Bold')
                .text('Plano de Parto', 50, 35, { align: 'center' });

            doc.fillColor('#ffffff')
                .fontSize(14)
                .font('Helvetica')
                .text(`Cliente: ${client.name || 'Não especificado'}`, 50, 75, { align: 'center' });

            // Função para desenhar checkbox
            const drawCheckbox = (x, y, checked) => {
                const size = 12;

                // Salva o estado atual
                doc.save();

                // Borda do checkbox
                doc.roundedRect(x, y, size, size, 2)
                    .lineWidth(1.5)
                    .strokeColor(primaryColor)
                    .stroke();

                // Se marcado, desenha o check
                if (checked) {
                    // Preenche o fundo do checkbox
                    doc.roundedRect(x + 2, y + 2, size - 4, size - 4, 1)
                        .fillColor(primaryColor)
                        .fill();

                    // Desenha o símbolo de check (✓)
                    doc.fillColor('#ffffff')
                        .fontSize(10)
                        .font('Helvetica-Bold')
                        .text('✓', x + 2, y, {
                            width: size,
                            align: 'center'
                        });
                }

                // Restaura o estado
                doc.restore();
            };

            // Itera pelos tipos na ordem
            let yPosition = 150;

            Object.keys(typeOrder).forEach((type) => {
                if (groupedPlans[type]) {
                    // Verifica se precisa de nova página para o título da seção
                    if (yPosition > doc.page.height - 150) {
                        createNewPage();
                        yPosition = 50;
                    }

                    // Título da seção com fundo
                    doc.rect(50, yPosition, doc.page.width - 100, 35)
                        .fill(backgroundColor);

                    doc.fillColor(primaryColor)
                        .fontSize(18)
                        .font('Helvetica-Bold')
                        .text(type, 60, yPosition + 10);

                    yPosition += 45;

                    groupedPlans[type].forEach((plan) => {
                        // Verifica se precisa de nova página
                        if (yPosition > doc.page.height - 100) {
                            createNewPage();
                            yPosition = 50;
                        }

                        // Desenha checkbox
                        drawCheckbox(60, yPosition, plan.clientSelect);

                        // Texto do item
                        doc.fillColor(textColor)
                            .fontSize(12)
                            .font('Helvetica')
                            .text(plan.name, 80, yPosition, {
                                width: doc.page.width - 130,
                                lineGap: 2
                            });

                        yPosition += 25;
                    });

                    yPosition += 15; // Espaço entre seções
                }
            });

            // Adiciona rodapé na última página
            addFooter();

            doc.end();
            const filename = `${clientName}-planoDeParto-${timestamp}.pdf`;
            const filePath = "./public/" + filename;
            doc.pipe(fs.createWriteStream(filePath));

            return filename;

        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error);
            throw new ApplicationError("Ocorreu um erro, tente novamente");
        }
    }
} export { ChildbirthPlanService }