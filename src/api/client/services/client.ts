/**
 * client service
 */

import { CreateClientDTO } from "../dto/createClientDTO";

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::client.client');



const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
class ClientService {
    async createClient(ctx) {
        return await strapi.db.transaction(async (trx) => {
            try {
                const {
                    name,
                    probableDateOfDelivery,
                    babyGender,
                    fatherName,
                    babyName,
                    email,
                    password
                }: CreateClientDTO = ctx.request.body;

                const users = await strapi.documents("plugin::users-permissions.user").findMany({
                    filters: {
                        email: email
                    }
                })

                if (users.length > 0) {
                    throw new ApplicationError("E-mail já cadastrado")
                }

                const user = await strapi.documents("plugin::users-permissions.user").create({
                    data: {
                        username: email.toLowerCase(),
                        email: email.toLowerCase(),
                        provider: 'local',
                        blocked: false,
                        confirmed: true,
                        password: password,
                        role: 1,
                    }
                })

                const client = await strapi.documents('api::client.client').create({
                    data: {
                        name: name,
                        probableDateOfDelivery: probableDateOfDelivery,
                        babyGender: babyGender,
                        fatherName: fatherName,
                        babyName: babyName,
                        user: user,
                        acceptTermDate: new Date(),
                        acceptTerm: true,
                        acceptPrivacyPoliciesDate: new Date(),
                        acceptPrivacyPolicies: true
                    }, populate: ['user']
                })

                return client
            } catch (error) {
                if (error instanceof ApplicationError) {
                    throw new ApplicationError(error.message);
                }
                console.log(error)
                throw new ApplicationError("Ocorreu um erro, tente novamente")
            }
        })
    }

    async getMyData(ctx) {
        try {
            const { documentId: documentId } = ctx.state.user;

            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: documentId, populate: ['client']
            })

            if (!user || !user.client) {
                throw new ApplicationError("Usuário não encontrado")
            }
            const client = await strapi.documents('api::client.client').findOne({
                documentId: user.client.documentId, populate: ['user']
            })

            return client
        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error)
            throw new ApplicationError("Ocorreu um erro, tente novamente")
        }
    }

    async updateClient(ctx) {
        return await strapi.db.transaction(async (trx) => {
            try {
                const { documentId: documentId } = ctx.state.user;
                const {
                    name,
                    probableDateOfDelivery,
                    babyGender,
                    fatherName,
                    babyName,
                }: CreateClientDTO = ctx.request.body;
                const user = await strapi.documents('plugin::users-permissions.user').findOne({
                    documentId: documentId, populate: ['client']
                })

                if (!user || !user.client) {
                    throw new ApplicationError("Usuário não encontrado")
                }

                const upclient = await strapi.documents('api::client.client').update({
                    documentId: user.client.documentId,
                    data: {
                        name: name,
                        probableDateOfDelivery: probableDateOfDelivery,
                        babyGender: babyGender,
                        fatherName: fatherName,
                        babyName: babyName
                    }, populate: ['user']
                })

                return upclient
            } catch (error) {
                if (error instanceof ApplicationError) {
                    throw new ApplicationError(error.message);
                }
                console.log(error)
                throw new ApplicationError("Ocorreu um erro, tente novamente")
            }
        })
    }

    async getHome(ctx) {
        try {
            const { documentId } = ctx.state.user;

            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId,
                populate: ['client']
            });

            if (!user || !user.client) {
                throw new ApplicationError("Usuário não encontrado");
            }

            const client = await strapi.documents('api::client.client').findOne({
                documentId: user.client.documentId,
                populate: ['user']
            });

            const probableDateOfDelivery = new Date(client.probableDateOfDelivery);

            // Data estimada da concepção = DPP - 280 dias (40 semanas)
            const conceptionDate = new Date(probableDateOfDelivery);
            conceptionDate.setDate(conceptionDate.getDate() - 280);

            const today = new Date();

            // Semanas de gravidez até agora
            const diffMs = today.getTime() - conceptionDate.getTime();
            const weeksPregnant = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

            // Quanto falta até o parto
            const remainingMs = probableDateOfDelivery.getTime() - today.getTime();
            const remainingWeeks = Math.floor(remainingMs / (1000 * 60 * 60 * 24 * 7));
            const remainingDays = Math.floor(
                (remainingMs % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24)
            );

            // Intervalo do dia atual
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

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
            });

            const data = {
                currentWeek: weeksPregnant,
                remaining: {
                    weeks: remainingWeeks,
                    days: remainingDays
                },
                schedule
            };

            return data;
        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error);
            throw new ApplicationError("Ocorreu um erro, tente novamente");
        }
    }


    async createMaster(ctx) {
        return await strapi.db.transaction(async (trx) => {
            try {
                const {
                    name,
                    email,
                    password
                }: CreateClientDTO = ctx.request.body;

                const users = await strapi.documents("plugin::users-permissions.user").findMany({
                    filters: {
                        email: email
                    }
                })

                if (users.length > 0) {
                    throw new ApplicationError("E-mail já cadastrado")
                }

                const user = await strapi.documents("plugin::users-permissions.user").create({
                    data: {
                        username: name,
                        email: email.toLowerCase(),
                        provider: 'local',
                        blocked: false,
                        confirmed: true,
                        password: password,
                        role: 3,
                    }
                })


                return user
            } catch (error) {
                if (error instanceof ApplicationError) {
                    throw new ApplicationError(error.message);
                }
                console.log(error)
                throw new ApplicationError("Ocorreu um erro, tente novamente")
            }
        })
    }

    async listMasters(ctx) {
        try {

            const { page, pageSize } = ctx.request.query
            const currentPage = page ? parseInt(page.toString(), 10) : 1;
            const perPage = pageSize ? parseInt(pageSize.toString(), 10) : 10;
            const startIndex = (currentPage - 1) * perPage;
            const users = await strapi.documents("plugin::users-permissions.user").findMany({
                filters: {
                    role: { id: 3 }
                },
                start: startIndex,
                limit: perPage,
                sort: [{ username: 'asc' }]
            })
            const total = await strapi.documents("plugin::users-permissions.user").count({
                filters: {
                    role: { id: 3 }
                }
            })
            const totalPages = Math.ceil(total / perPage);

            return {
                users: users,
                pagination: {
                    total,
                    totalPages,
                    currentPage,
                    pageSize: perPage
                }
            };
        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error)
            throw new ApplicationError("Ocorreu um erro, tente novamente")
        }
    }

    async deleteMaster(ctx) {
        return await strapi.db.transaction(async (trx) => {
            try {
                const { documentId: documentId } = ctx.state.user;
                const { userDocumentId } = ctx.request.query

                const user = await strapi.documents("plugin::users-permissions.user").findOne({
                    documentId: documentId,
                    populate: ['role']
                })

                if (!user.role || user.role.id !== 3) {
                    throw new ApplicationError("Usuário não tem permissão")
                }
                const deleteuser = await strapi.documents("plugin::users-permissions.user").findOne({
                    documentId: userDocumentId,
                    populate: ['role']
                })

                if (!deleteuser.role || deleteuser.role.id !== 3) {
                    throw new ApplicationError("Usuário nao pode ser excluido")
                }

                await strapi.documents("plugin::users-permissions.user").delete({
                    documentId: deleteuser.documentId
                })

                return "Usuário excluido com sucesso"
            } catch (error) {
                if (error instanceof ApplicationError) {
                    throw new ApplicationError(error.message);
                }
                console.log(error)
                throw new ApplicationError("Ocorreu um erro, tente novamente")
            }
        })
    }

    async listUsersInMaster(ctx) {
        try {

            const { page, pageSize } = ctx.request.query
            const currentPage = page ? parseInt(page.toString(), 10) : 1;
            const perPage = pageSize ? parseInt(pageSize.toString(), 10) : 10;
            const startIndex = (currentPage - 1) * perPage;
            const users = await strapi.documents("plugin::users-permissions.user").findMany({
                filters: {
                    role: { id: 1 }
                },
                start: startIndex,
                limit: perPage,
                sort: [{ username: 'asc' }]
            })
            const total = await strapi.documents("plugin::users-permissions.user").count({
                filters: {
                    role: { id: 1 }
                }
            })
            const totalPages = Math.ceil(total / perPage);

            return {
                users: users,
                pagination: {
                    total,
                    totalPages,
                    currentPage,
                    pageSize: perPage
                }
            };
        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error)
            throw new ApplicationError("Ocorreu um erro, tente novamente")
        }
    }

    async deleteUserInMaster(ctx) {
        return await strapi.db.transaction(async (trx) => {
            try {
                const { documentId: documentId } = ctx.state.user;
                const { userDocumentId } = ctx.request.query

                const user = await strapi.documents("plugin::users-permissions.user").findOne({
                    documentId: documentId,
                    populate: ['role']
                })

                if (!user.role || user.role.id !== 3) {
                    throw new ApplicationError("Usuário não tem permissão")
                }
                const deleteuser = await strapi.documents("plugin::users-permissions.user").findOne({
                    documentId: userDocumentId,
                    populate: ['role', 'client']
                })

                if (!deleteuser.role || deleteuser.role.id !== 1 || !deleteuser.client) {
                    throw new ApplicationError("Usuário não pode ser excluido")
                }

                const client = await strapi.documents("api::client.client").findOne({
                    documentId: deleteuser.client.documentId,
                    populate: {
                        lists: {
                            populate: {
                                topics: true
                            }
                        },
                        schedules: true
                    }
                })

                if (client.lists.length > 0) {
                    for (const list of client.lists) {
                        if (list.topics.length > 0) {
                            for (const topic of list.topics) {
                                await strapi.documents("api::topic.topic").delete({
                                    documentId: topic.documentId
                                })
                            }
                        }
                        await strapi.documents("api::list.list").delete({
                            documentId: list.documentId
                        })
                    }
                }

                if (client.schedules.length > 0) {
                    for (const schedule of client.schedules) {
                        await strapi.documents("api::schedule.schedule").delete({
                            documentId: schedule.documentId
                        })
                    }
                }

                await strapi.documents("api::client.client").delete({
                    documentId: client.documentId
                })


                await strapi.documents("plugin::users-permissions.user").delete({
                    documentId: deleteuser.documentId
                })

                return "Usuário excluido com sucesso"
            } catch (error) {
                if (error instanceof ApplicationError) {
                    throw new ApplicationError(error.message);
                }
                console.log(error)
                throw new ApplicationError("Ocorreu um erro, tente novamente")
            }
        })
    }

    async blockAndUnblockUser(ctx) {
        try {
            const { documentId: documentId } = ctx.state.user;
            const { userDocumentId } = ctx.request.query
            const { blocked } = ctx.request.body
            const user = await strapi.documents("plugin::users-permissions.user").findOne({
                documentId: documentId,
                populate: ['role']
            })

            if (!user.role || user.role.id !== 3) {
                throw new ApplicationError("Usuário não tem permissão")
            }

            const blockuser = await strapi.documents("plugin::users-permissions.user").findOne({
                documentId: userDocumentId,
                populate: ['role']
            })

            if (!blockuser.role || blockuser.role.id !== 1) {
                throw new ApplicationError("Usuário não pode ser bloqueado")
            }

            await strapi.documents("plugin::users-permissions.user").update({
                documentId: blockuser.documentId,
                data: {
                    blocked: blocked
                }
            })
            if (blocked === false) {
                return "Usuário desbloqueado com sucesso"
            } else {
                return "Usuário bloqueado com sucesso"
            }

        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error)
            throw new ApplicationError("Ocorreu um erro, tente novamente")
        }
    }

    async deleteMyClient(ctx) {
        return await strapi.db.transaction(async (trx) => {
            try {
                const { documentId: documentId } = ctx.state.user;

                const user = await strapi.documents("plugin::users-permissions.user").findOne({
                    documentId: documentId,
                    populate: ['client']
                })

                if (!user || !user.client) {
                    throw new ApplicationError("Usuário não encontrado")
                }


                const client = await strapi.documents("api::client.client").findOne({
                    documentId: user.client.documentId,
                    populate: {
                        lists: {
                            populate: {
                                topics: true
                            }
                        },
                        schedules: true
                    }
                })

                if (client.lists.length > 0) {
                    for (const list of client.lists) {
                        if (list.topics.length > 0) {
                            for (const topic of list.topics) {
                                await strapi.documents("api::topic.topic").delete({
                                    documentId: topic.documentId
                                })
                            }
                        }
                        await strapi.documents("api::list.list").delete({
                            documentId: list.documentId
                        })
                    }
                }

                if (client.schedules.length > 0) {
                    for (const schedule of client.schedules) {
                        await strapi.documents("api::schedule.schedule").delete({
                            documentId: schedule.documentId
                        })
                    }
                }


                await strapi.documents("api::client.client").delete({
                    documentId: client.documentId
                })


                await strapi.documents("plugin::users-permissions.user").delete({
                    documentId: user.documentId
                })

                return "Usuário excluido com sucesso"
            } catch (error) {
                if (error instanceof ApplicationError) {
                    throw new ApplicationError(error.message);
                }
                console.log(error)
                throw new ApplicationError("Ocorreu um erro, tente novamente")
            }
        })
    }

    async forgotPassword(ctx) {
        return await strapi.db.transaction(async (trx) => {
            try {
                const crypto = require('crypto')
                const { email } = ctx.request.body

                const users = await strapi.documents('plugin::users-permissions.user').findMany({
                    filters: {
                        email: email
                    }
                })
                if (users.length === 0) {
                    throw new ApplicationError("Usuário não encontrado com esse e-mail")
                }

                const user = await strapi.documents('plugin::users-permissions.user').findOne({
                    documentId: users[0].documentId, populate: ['client', 'role',]
                })

                let name = ''

                if (user.client) {
                    name = user.client.name ? user.client.name : user.username
                } else {
                    throw new ApplicationError("Usuário com esse e-mail não encontrado")
                }


                if (name === '' || !name) {
                    name = user.username
                }


                const resetPasswordToken = crypto.randomBytes(64).toString('hex');
                const userCode = await strapi.documents('plugin::users-permissions.user').update({
                    documentId: user.documentId,
                    data: {
                        resetPasswordToken: resetPasswordToken,
                        // resetCodeExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000)
                    }
                })

                let message = '';


                message = `
             <div>
        <p>Olá,  ${name}!👋</p>
        
        <p>Recebemos uma solicitação para redefinir a sua senha. 
        Para criar uma nova senha e recuperar o acesso à sua conta, clique no 
        botão abaixo: </p>
        
          <p><a href="">Redefinir Senha</a></p>
        
        <p>Se você não solicitou essa alteração, pode ignorar este e-mail. Sua conta 
        permanecerá segura.</p>
        
        
        <p>Caso tenha qualquer dúvida ou precise de ajuda, entre em contato com a gente./p>
        
    </div>`

                await strapi.plugins['email'].services.email.send({
                    to: user.email,
                    from: process.env.SMTP_USERNAME,
                    subject: 'Redefinição de senha – Vem Nenem',
                    text: message,
                })

                return "E-mail enviado com sucesso"

            } catch (error) {
                if (error instanceof ApplicationError) {
                    throw new ApplicationError(error.message);
                }
                console.log(error)
                throw new ApplicationError("E-mail de redefinição falhou, tente novamente ")
            }
        })
    }



} export { ClientService };