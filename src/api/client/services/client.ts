/**
 * client service
 */

import { CreateClientDTO } from "../dto/createClientDTO";

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::client.client');



const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
const bcrypt = require('bcryptjs');
class ClientService {
    // metodo para criar um novo cliente no sistema
    async createClient(ctx) {
        // inicia uma transacao no banco de dados para garantir integridade
        return await strapi.db.transaction(async (trx) => {
            try {
                // extrai os dados do corpo da requisicao
                const {
                    name,
                    probableDateOfDelivery,
                    babyGender,
                    fatherName,
                    babyName,
                    email,
                    password
                }: CreateClientDTO = ctx.request.body;


                // verifica se o email ja esta cadastrado no banco
                const users = await strapi.documents("plugin::users-permissions.user").findMany({
                    filters: {
                        email: email
                    }
                })

                // se encontrar algum usuario com esse email, retorna erro
                if (users.length > 0) {
                    throw new ApplicationError("E-mail já cadastrado")
                }

                // cria um novo usuario no sistema de permissoes do strapi
                const user = await strapi.documents("plugin::users-permissions.user").create({
                    data: {
                        username: email.toLowerCase(),
                        email: email.toLowerCase(),
                        provider: 'local',
                        blocked: false,
                        confirmed: true,
                        password: password,
                        role: 1, // role 1 representa usuario comum
                    }
                })

                // cria o registro do cliente vinculado ao usuario criado
                const client = await strapi.documents('api::client.client').create({
                    data: {
                        name: name,
                        probableDateOfDelivery: probableDateOfDelivery,
                        babyGender: babyGender,
                        fatherName: fatherName,
                        babyName: babyName,
                        user: user,
                        acceptTermDate: new Date(), // data de aceitacao dos termos
                        acceptTerm: true,
                        acceptPrivacyPoliciesDate: new Date(), // data de aceitacao da politica de privacidade
                        acceptPrivacyPolicies: true
                    }, populate: ['user']
                })

                // retorna o cliente criado com os dados do usuario
                return client
            } catch (error) {
                // se o erro for do tipo application error, repassa a mensagem original
                if (error instanceof ApplicationError) {
                    throw new ApplicationError(error.message);
                }
                console.log(error)
                // caso contrario retorna uma mensagem generica
                throw new ApplicationError("Ocorreu um erro, tente novamente")
            }
        })
    }

    // metodo para buscar os dados do cliente logado
    async getMyData(ctx) {
        try {
            // pega o id do usuario autenticado
            const { documentId: documentId } = ctx.state.user;

            // busca o usuario no banco incluindo o relacionamento com cliente
            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: documentId, populate: ['client']
            })

            // se nao encontrar o usuario ou o cliente vinculado, retorna erro
            if (!user || !user.client) {
                throw new ApplicationError("Usuário não encontrado")
            }
            // busca os dados completos do cliente
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



    // metodo para atualizar os dados do cliente logado
    async updateClient(ctx) {
        // inicia transacao no banco
        return await strapi.db.transaction(async (trx) => {
            try {
                // pega o id do usuario autenticado
                const { documentId: documentId } = ctx.state.user;
                // extrai os novos dados do corpo da requisicao
                const {
                    name,
                    probableDateOfDelivery,
                    babyGender,
                    fatherName,
                    babyName,
                }: CreateClientDTO = ctx.request.body;
                // busca o usuario e seu cliente vinculado
                const user = await strapi.documents('plugin::users-permissions.user').findOne({
                    documentId: documentId, populate: ['client']
                })

                if (!user || !user.client) {
                    throw new ApplicationError("Usuário não encontrado")
                }

                // atualiza os dados do cliente no banco
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

    // metodo para buscar dados da tela inicial do cliente
    async getHome(ctx) {
        try {
            // pega o id do usuario autenticado
            const { documentId } = ctx.state.user;

            // busca o usuario com seu cliente vinculado
            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId,
                populate: ['client']
            });

            if (!user || !user.client) {
                throw new ApplicationError("Usuário não encontrado");
            }

            // busca os dados completos do cliente
            const client = await strapi.documents('api::client.client').findOne({
                documentId: user.client.documentId,
                populate: ['user']
            });

            // pega a data provavel do parto
            const probableDateOfDelivery = new Date(client.probableDateOfDelivery);

            // calcula a data estimada da concepcao subtraindo 280 dias da data do parto
            const conceptionDate = new Date(probableDateOfDelivery);
            conceptionDate.setDate(conceptionDate.getDate() - 280);

            const today = new Date();

            // calcula quantas semanas de gravidez ja se passaram
            const diffMs = today.getTime() - conceptionDate.getTime();
            const weeksPregnant = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

            // calcula quanto tempo falta ate o parto em semanas e dias
            const remainingMs = probableDateOfDelivery.getTime() - today.getTime();
            const remainingWeeks = Math.floor(remainingMs / (1000 * 60 * 60 * 24 * 7));
            const remainingDays = Math.floor(
                (remainingMs % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24)
            );


            const now = new Date();

            // pega yyyy-mm-dd da data local (SEM timezone)
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');

            const todayString = `${year}-${month}-${day}`;

            // busca os agendamentos do cliente para o dia atual
            const schedule = await strapi.documents('api::schedule.schedule').findMany({
                filters: {
                    client: {
                        documentId: user.client.documentId
                    },
                    date: todayString
                }
            });

            // monta o objeto de resposta com todas as informacoes
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

    // metodo para criar um usuario master no sistema
    async createMaster(ctx) {
        // inicia transacao no banco
        return await strapi.db.transaction(async (trx) => {
            try {
                // extrai os dados do corpo da requisicao
                const {
                    name,
                    email,
                    password
                }: CreateClientDTO = ctx.request.body;

                // verifica se o email ja esta cadastrado
                const users = await strapi.documents("plugin::users-permissions.user").findMany({
                    filters: {
                        email: email
                    }
                })

                if (users.length > 0) {
                    throw new ApplicationError("E-mail já cadastrado")
                }

                // cria um novo usuario master com role 3
                const user = await strapi.documents("plugin::users-permissions.user").create({
                    data: {
                        username: name,
                        email: email.toLowerCase(),
                        provider: 'local',
                        blocked: false,
                        confirmed: true,
                        password: password,
                        role: 3, // role 3 representa usuario master
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

    // metodo para listar todos os usuarios masters com paginacao
    async listMasters(ctx) {
        try {
            // extrai parametros de paginacao da query
            const { page, pageSize } = ctx.request.query
            const currentPage = page ? parseInt(page.toString(), 10) : 1;
            const perPage = pageSize ? parseInt(pageSize.toString(), 10) : 10;
            const startIndex = (currentPage - 1) * perPage;
            // busca usuarios com role 3 (masters) aplicando paginacao e ordenacao
            const users = await strapi.documents("plugin::users-permissions.user").findMany({
                filters: {
                    role: { id: 3 }
                },
                start: startIndex,
                limit: perPage,
                sort: [{ username: 'asc' }]
            })
            // conta o total de masters para calcular paginacao
            const total = await strapi.documents("plugin::users-permissions.user").count({
                filters: {
                    role: { id: 3 }
                }
            })
            const totalPages = Math.ceil(total / perPage);

            // retorna usuarios e informacoes de paginacao
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


    // metodo para deletar um usuario master (apenas masters podem deletar outros masters)
    async deleteMaster(ctx) {
        // inicia transacao no banco
        return await strapi.db.transaction(async (trx) => {
            try {
                // pega o id do usuario autenticado
                const { documentId: documentId } = ctx.state.user;
                // pega o id do usuario a ser deletado da query
                const { userDocumentId } = ctx.request.query

                // verifica se o usuario logado e master
                const user = await strapi.documents("plugin::users-permissions.user").findOne({
                    documentId: documentId,
                    populate: ['role']
                })

                if (!user.role || user.role.id !== 3) {
                    throw new ApplicationError("Usuário não tem permissão")
                }
                // busca o usuario que sera deletado
                const deleteuser = await strapi.documents("plugin::users-permissions.user").findOne({
                    documentId: userDocumentId,
                    populate: ['role']
                })

                // verifica se o usuario a ser deletado e master
                if (!deleteuser.role || deleteuser.role.id !== 3) {
                    throw new ApplicationError("Usuário nao pode ser excluido")
                }

                // deleta o usuario master
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

    // metodo para listar usuarios comuns (clients) para o painel master
    async listUsersInMaster(ctx) {
        try {
            // extrai parametros de paginacao da query
            const { page, pageSize } = ctx.request.query
            const currentPage = page ? parseInt(page.toString(), 10) : 1;
            const perPage = pageSize ? parseInt(pageSize.toString(), 10) : 10;
            const startIndex = (currentPage - 1) * perPage;
            // busca usuarios com role 1 (clientes) aplicando paginacao
            const users = await strapi.documents("plugin::users-permissions.user").findMany({
                filters: {
                    role: { id: 1 }
                },
                populate: ['client'],
                start: startIndex,
                limit: perPage,
                sort: [{ username: 'asc' }]
            })
            // conta o total de clientes para calcular paginacao
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

    // metodo para um master deletar um usuario cliente e todos seus dados relacionados
    async deleteUserInMaster(ctx) {
        // inicia transacao no banco
        return await strapi.db.transaction(async (trx) => {
            try {
                // pega o id do usuario master autenticado
                const { documentId: documentId } = ctx.state.user;
                // pega o id do usuario a ser deletado da query
                const { userDocumentId } = ctx.request.query

                // verifica se o usuario logado e master
                const user = await strapi.documents("plugin::users-permissions.user").findOne({
                    documentId: documentId,
                    populate: ['role']
                })

                if (!user.role || user.role.id !== 3) {
                    throw new ApplicationError("Usuário não tem permissão")
                }
                // busca o usuario que sera deletado incluindo seu cliente
                const deleteuser = await strapi.documents("plugin::users-permissions.user").findOne({
                    documentId: userDocumentId,
                    populate: ['role', 'client']
                })

                // verifica se o usuario e cliente comum e tem dados de cliente
                if (!deleteuser.role || deleteuser.role.id !== 1 || !deleteuser.client) {
                    throw new ApplicationError("Usuário não pode ser excluido")
                }

                // busca o cliente com todas as suas listas, topicos e agendamentos
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

                // deleta todos os topicos de todas as listas do cliente
                if (client.lists.length > 0) {
                    for (const list of client.lists) {
                        if (list.topics.length > 0) {
                            for (const topic of list.topics) {
                                await strapi.documents("api::topic.topic").delete({
                                    documentId: topic.documentId
                                })
                            }
                        }
                        // deleta cada lista apos deletar seus topicos
                        await strapi.documents("api::list.list").delete({
                            documentId: list.documentId
                        })
                    }
                }

                // deleta todos os agendamentos do cliente
                if (client.schedules.length > 0) {
                    for (const schedule of client.schedules) {
                        await strapi.documents("api::schedule.schedule").delete({
                            documentId: schedule.documentId
                        })
                    }
                }

                // deleta o registro do cliente
                await strapi.documents("api::client.client").delete({
                    documentId: client.documentId
                })

                // finalmente deleta o usuario
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

    // metodo para master bloquear ou desbloquear um usuario cliente
    async blockAndUnblockUser(ctx) {
        try {
            // pega o id do usuario master autenticado
            const { documentId: documentId } = ctx.state.user;
            // pega o id do usuario a ser bloqueado da query
            const { userDocumentId } = ctx.request.query
            // pega o status de bloqueio do corpo da requisicao
            const { blocked } = ctx.request.body
            // verifica se o usuario logado e master
            const user = await strapi.documents("plugin::users-permissions.user").findOne({
                documentId: documentId,
                populate: ['role']
            })

            if (!user.role || user.role.id !== 3) {
                throw new ApplicationError("Usuário não tem permissão")
            }

            // busca o usuario que sera bloqueado
            const blockuser = await strapi.documents("plugin::users-permissions.user").findOne({
                documentId: userDocumentId,
                populate: ['role']
            })

            // verifica se o usuario e cliente comum
            if (!blockuser.role || blockuser.role.id !== 1) {
                throw new ApplicationError("Usuário não pode ser bloqueado")
            }

            // atualiza o status de bloqueio do usuario
            await strapi.documents("plugin::users-permissions.user").update({
                documentId: blockuser.documentId,
                data: {
                    blocked: blocked
                }
            })
            // retorna mensagem apropriada dependendo da acao
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

    // metodo para o cliente deletar sua propria conta e todos seus dados
    async deleteMyClient(ctx) {
        // inicia transacao no banco
        return await strapi.db.transaction(async (trx) => {
            try {
                // pega o id do usuario autenticado
                const { documentId: documentId } = ctx.state.user;

                // busca o usuario com seu cliente vinculado
                const user = await strapi.documents("plugin::users-permissions.user").findOne({
                    documentId: documentId,
                    populate: ['client']
                })

                if (!user || !user.client) {
                    throw new ApplicationError("Usuário não encontrado")
                }

                // busca o cliente com todas as suas listas, topicos e agendamentos
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

                // deleta todos os topicos de todas as listas
                if (client.lists.length > 0) {
                    for (const list of client.lists) {
                        if (list.topics.length > 0) {
                            for (const topic of list.topics) {
                                await strapi.documents("api::topic.topic").delete({
                                    documentId: topic.documentId
                                })
                            }
                        }
                        // deleta cada lista
                        await strapi.documents("api::list.list").delete({
                            documentId: list.documentId
                        })
                    }
                }

                // deleta todos os agendamentos
                if (client.schedules.length > 0) {
                    for (const schedule of client.schedules) {
                        await strapi.documents("api::schedule.schedule").delete({
                            documentId: schedule.documentId
                        })
                    }
                }

                // deleta o registro do cliente
                await strapi.documents("api::client.client").delete({
                    documentId: client.documentId
                })

                // deleta o usuario
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

    // metodo para recuperacao de senha esquecida
    async forgotPassword(ctx) {
        // inicia transacao no banco
        return await strapi.db.transaction(async (trx) => {
            try {
                const crypto = require('crypto')
                // pega o email do corpo da requisicao
                const { email } = ctx.request.body

                // busca usuarios com esse email
                const users = await strapi.documents('plugin::users-permissions.user').findMany({
                    filters: {
                        email: email
                    }
                })
                if (users.length === 0) {
                    throw new ApplicationError("Usuário não encontrado com esse e-mail")
                }

                // busca o usuario completo com cliente e role
                const user = await strapi.documents('plugin::users-permissions.user').findOne({
                    documentId: users[0].documentId, populate: ['client', 'role',]
                })

                let name = ''

                // tenta obter o nome do cliente ou usa o username
                if (user.client) {
                    name = user.client.name ? user.client.name : user.username
                } else {
                    throw new ApplicationError("Usuário com esse e-mail não encontrado")
                }


                if (name === '' || !name) {
                    name = user.username
                }

                // funcao para gerar codigo aleatorio de 6 caracteres
                function gerarCodigoAleatorio() {
                    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    let codigo = '';

                    for (let i = 0; i < 6; i++) {
                        const indice = Math.floor(Math.random() * caracteres.length);
                        codigo += caracteres[indice];
                    }

                    return codigo;
                }

                // gera o codigo de recuperacao
                const code = gerarCodigoAleatorio()
                // salva o codigo no campo resetPasswordToken do usuario
                const userCode = await strapi.documents('plugin::users-permissions.user').update({
                    documentId: user.documentId,
                    data: {
                        resetPasswordToken: code,
                    }
                })

                let message = '';

                // monta o corpo do email em html
                message = `
                        <div>
                    <p>Olá, ${name}!👋</p>
                    
                    <p>Recebemos uma solicitação para redefinir a sua senha. 
                    Para criar uma nova senha e recuperar o acesso à sua conta, por favor utilize o código abaixo para redefinir sua senha no aplicativo: </p>
                    
                    <p>${code}</p>
                    
                    <p>Se você não solicitou essa alteração, pode ignorar este e-mail. Sua conta 
                    permanecerá segura.</p>
                    
                    
                    <p>Caso tenha qualquer dúvida ou precise de ajuda, entre em contato com a gente. </p>
                    
                </div>`

                // envia o email com o codigo de recuperacao
                // envia o email com o codigo de recuperacao
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

    // metodo para redefinir a senha usando o codigo recebido por email
    async resetPassword(ctx) {
        // inicia transacao no banco
        return await strapi.db.transaction(async (trx) => {
            try {
                // pega o token de recuperacao, senha nova e confirmacao da senha
                const { resetPasswordToken, password, confirmPassword } = ctx.request.body

                // busca usuarios com esse token de recuperacao
                const users = await strapi.documents('plugin::users-permissions.user').findMany({
                    filters: {
                        resetPasswordToken: resetPasswordToken
                    }
                })
                if (users.length === 0) {
                    throw new ApplicationError("Código de redefinição inválido")
                }

                // busca o usuario completo
                const user = await strapi.documents('plugin::users-permissions.user').findOne({
                    documentId: users[0].documentId, populate: ['client', 'role',]
                })

                // verifica se a senha nova e diferente da senha antiga
                const mesmaSenha = await bcrypt.compare(password, user.password);

                if (mesmaSenha) {
                    throw new ApplicationError("A senha nova deve ser diferente da antiga");
                }

                // verifica se a senha e a confirmacao sao iguais
                if (password !== confirmPassword) {
                    throw new ApplicationError("As senhas devem ser iguais")
                }

                // atualiza a senha e remove o token de recuperacao
                const userCode = await strapi.documents('plugin::users-permissions.user').update({
                    documentId: user.documentId,
                    data: {
                        password: password,
                        resetPasswordToken: null
                    }
                })


                return "Senha redefinida com sucesso"

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