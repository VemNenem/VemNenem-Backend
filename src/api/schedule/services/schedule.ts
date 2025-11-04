/**
 * schedule service
 */

import { factories } from '@strapi/strapi';
import { CreateScheduleDTO } from '../dto/createScheduleDTO';

export default factories.createCoreService('api::schedule.schedule');

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
class ScheduleService {
    // metodo para buscar agendamentos de um dia especifico
    async getDaySchedule(ctx) {
        try {
            // pega o id do usuario autenticado
            const { documentId: documentId } = ctx.state.user;
            // pega o dia da query
            const { day } = ctx.request.query;
            console.log(day)
            // busca o usuario com seu cliente vinculado
            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: documentId, populate: ['client']
            })

            if (!user || !user.client) {
                throw new ApplicationError("Usuário não encontrado")
            }

            // define o inicio e fim do dia para buscar agendamentos
            const startOfDay = new Date(`${day}T00:00:00.000Z`);
            const endOfDay = new Date(`${day}T23:59:59.999Z`);

            // busca todos os agendamentos do cliente nesse dia
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

    // metodo para buscar dias do mes que tem agendamentos
    async getMonthSchedule(ctx) {
        try {
            // pega o id do usuario autenticado
            const { documentId } = ctx.state.user;
            // pega o mes no formato yyyy-mm da query
            const { month } = ctx.request.query;
            // month vem no formato "YYYY-MM" (ex: "2025-09")

            if (!month) {
                throw new ApplicationError("Mês não informado. Use o formato YYYY-MM.");
            }

            // busca o usuario com seu cliente vinculado
            const user = await strapi.documents("plugin::users-permissions.user").findOne({
                documentId,
                populate: ["client"],
            });

            if (!user || !user.client) {
                throw new ApplicationError("Usuário não encontrado");
            }

            // calcula intervalo do mes com 4 dias antes e depois
            const [year, monthNum] = month.split("-").map(Number);

            const firstDay = new Date(Date.UTC(year, monthNum - 1, 1)); // inicio do mes
            const lastDay = new Date(Date.UTC(year, monthNum, 0)); // ultimo dia do mes

            // adiciona os 4 dias antes e depois
            const startRange = new Date(firstDay);
            startRange.setUTCDate(firstDay.getUTCDate() - 4);

            const endRange = new Date(lastDay);
            endRange.setUTCDate(lastDay.getUTCDate() + 4);

            // busca todos os agendamentos do cliente nesse range
            const schedules = await strapi.documents("api::schedule.schedule").findMany({
                filters: {
                    client: { documentId: user.client.documentId },
                    date: {
                        $gte: startRange,
                        $lte: endRange,
                    },
                },
            });

            // transforma os agendamentos em set de datas
            const scheduledDates = new Set(
                schedules.map((s) => {
                    const d = new Date(s.date);
                    return d.toISOString().split("T")[0]; // yyyy-mm-dd
                })
            );

            // monta resposta com todos os dias do range indicando se tem agendamento
            const result: Record<string, boolean> = {};
            let current = new Date(startRange);

            while (current <= endRange) {
                const iso = current.toISOString().split("T")[0]; // yyyy-mm-dd
                const formatted = `${String(current.getUTCDate()).padStart(2, "0")}/${String(
                    current.getUTCMonth() + 1
                ).padStart(2, "0")}/${current.getUTCFullYear()}`;

                result[formatted] = scheduledDates.has(iso);
                current.setUTCDate(current.getUTCDate() + 1); // avanca 1 dia
            }

            return result;
        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error);
            throw new ApplicationError("Ocorreu um erro, tente novamente");
        }
    }

    // metodo para criar um novo agendamento
    async createSchedule(ctx) {
        // inicia transacao no banco
        return await strapi.db.transaction(async (trx) => {
            try {
                // pega o id do usuario autenticado
                const { documentId: documentId } = ctx.state.user;
                // extrai dados do agendamento do corpo da requisicao
                const { name, description, date, time }: CreateScheduleDTO = ctx.request.body;

                // busca o usuario com seu cliente vinculado
                const user = await strapi.documents('plugin::users-permissions.user').findOne({
                    documentId: documentId, populate: ['client']
                })

                if (!user || !user.client) {
                    throw new ApplicationError("Usuário não encontrado")
                }

                // busca os dados do cliente
                const client = await strapi.documents('api::client.client').findOne({
                    documentId: user.client.documentId
                })

                // verifica se ja existe um agendamento nesse horario
                const existingSchedule = await strapi.documents('api::schedule.schedule').findFirst({
                    filters: {
                        client: { documentId: client.documentId },
                        date: date,
                        time: time,
                    },
                });

                if (existingSchedule) {
                    throw new ApplicationError("Já existe um agendamento neste dia e horário.");
                }

                // cria o novo agendamento
                const schedule = await strapi.documents('api::schedule.schedule').create({
                    data: {
                        name: name,
                        description: description,
                        date: date,
                        time: time,
                        client: client.documentId
                    },
                    populate: ['client']
                })

                return schedule
            } catch (error) {
                if (error instanceof ApplicationError) {
                    throw new ApplicationError(error.message);
                }
                console.log(error)
                throw new ApplicationError("Ocorreu um erro, tente novamente")
            }
        })
    }


    // atualiza os dados de um agendamento
    async updateSchedule(ctx) {
        return await strapi.db.transaction(async (trx) => {
            try {
                // pega o id do usuario e do agendamento
                const { documentId: documentId } = ctx.state.user;
                const { scheduleDocumentId } = ctx.request.query;
                // pega os dados da requisicao
                const { name, description, date, time }: CreateScheduleDTO = ctx.request.body;

                // busca o usuario com seu cliente vinculado
                const user = await strapi.documents('plugin::users-permissions.user').findOne({
                    documentId: documentId, populate: ['client']
                })

                if (!user || !user.client) {
                    throw new ApplicationError("Usuário não encontrado")
                }

                // busca o agendamento
                const schedule = await strapi.documents('api::schedule.schedule').findOne({
                    documentId: scheduleDocumentId
                })

                if (!schedule) {
                    throw new ApplicationError("Agendamento não encontrado")
                }

                // busca os dados do cliente
                const client = await strapi.documents('api::client.client').findOne({
                    documentId: user.client.documentId
                })

                // verifica se ja existe outro agendamento nesse horario
                const existingSchedule = await strapi.documents('api::schedule.schedule').findFirst({
                    filters: {
                        client: { documentId: client.documentId },
                        date: date,
                        time: time,
                        documentId: { $not: schedule.documentId }
                    },
                });

                if (existingSchedule) {
                    throw new ApplicationError("Já existe um agendamento neste dia e horário.");
                }

                // atualiza o agendamento
                const up = await strapi.documents('api::schedule.schedule').update({
                    documentId: schedule.documentId,
                    data: {
                        name: name,
                        description: description,
                        date: date,
                        time: time,
                    },
                    populate: ['client']
                })

                return up
            } catch (error) {
                if (error instanceof ApplicationError) {
                    throw new ApplicationError(error.message);
                }
                console.log(error)
                throw new ApplicationError("Ocorreu um erro, tente novamente")
            }
        })
    }

    // deleta um agendamento
    async deleteSchedule(ctx) {
        return await strapi.db.transaction(async (trx) => {
            try {
                // pega o id do usuario e do agendamento
                const { documentId: documentId } = ctx.state.user;
                const { scheduleDocumentId } = ctx.request.query;

                // busca o usuario com seu cliente vinculado
                const user = await strapi.documents('plugin::users-permissions.user').findOne({
                    documentId: documentId, populate: ['client']
                })

                if (!user || !user.client) {
                    throw new ApplicationError("Usuário não encontrado")
                }

                // busca o agendamento
                const schedule = await strapi.documents('api::schedule.schedule').findOne({
                    documentId: scheduleDocumentId
                })

                if (!schedule) {
                    throw new ApplicationError("Agendamento não encontrado")
                }

                // busca os dados do cliente
                const client = await strapi.documents('api::client.client').findOne({
                    documentId: user.client.documentId
                })

                // deleta o agendamento
                const deleteSchedule = await strapi.documents('api::schedule.schedule').delete({
                    documentId: schedule.documentId,
                })

                return "Excluido com sucesso"
            } catch (error) {
                if (error instanceof ApplicationError) {
                    throw new ApplicationError(error.message);
                }
                console.log(error)
                throw new ApplicationError("Ocorreu um erro, tente novamente")
            }
        })
    }

} export { ScheduleService }
