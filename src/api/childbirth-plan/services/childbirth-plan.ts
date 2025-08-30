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
                populate: ['clients'] // aqui assume que seu campo de relação chama "clients"
            });

            const childbirthPlans = allChildbirthPlan.map((childbirthPlan) => {
                const isRelated = childbirthPlan.clients?.some(
                    (relatedClient) => relatedClient.documentId === client.documentId
                );

                return {
                    documentId: childbirthPlan.documentId,
                    name: childbirthPlan.name,
                    type: childbirthPlan.type,
                    clientSelect: isRelated
                };
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

    async postChildbirthPlan(ctx) {
        const { childPlans } = ctx.request.body;
        for (const field of childPlans) {
            const plan = await strapi.documents('api::childbirth-plan.childbirth-plan').create({
                data: { name: field.name, type: field.type }
            });
        }
    }


} export { ChildbirthPlanService }