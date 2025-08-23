/**
 * schedule service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::schedule.schedule');

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
class ScheduleService {
    async getDaySchedule(ctx) {
        try {
            const { documentId: documentId } = ctx.state.user;
            const { day } = ctx.request.query;
            console.log(day)
            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: documentId, populate: ['client']
            })

            if (!user || !user.client) {
                throw new ApplicationError("Usuário não encontrado")
            }

            const startOfDay = new Date(`${day}T00:00:00.000Z`);
            const endOfDay = new Date(`${day}T23:59:59.999Z`);

            const schedule = await strapi.documents('api::schedule.schedule').findMany({
                filters: {
                    client: {
                        documentId: user.client.documentId
                    },
                    date: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                }
            })

            return schedule
        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error)
            throw new ApplicationError("Ocorreu um erro, tente novamente")
        }
    }
} export { ScheduleService }
