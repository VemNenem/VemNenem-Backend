/**
 * list service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::list.list');


import { CreateListDTO, CreateTopicDTO } from "../dto/createListDTO";

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
class ListService {
    // metodo para criar uma nova lista para o cliente
    async createList(ctx) {
        // inicia transacao no banco de dados
        return await strapi.db.transaction(async (trx) => {
            try {
                // extrai o nome da lista do corpo da requisicao
                const {
                    name,
                }: CreateListDTO = ctx.request.body;
                // pega o id do usuario autenticado
                const { documentId: documentId } = ctx.state.user;

                const user = await strapi.documents('plugin::users-permissions.user').findOne({
                    documentId: documentId, populate: ['client']
                })

                if (!user || !user.client) {
                    throw new ApplicationError("Usuário não encontrado")
                }

                const client = await strapi.documents('api::client.client').findOne({
                    documentId: user.client.documentId
                })

                const lists = await strapi.documents('api::list.list').findMany({
                    filters: {
                        client: {
                            documentId: client.documentId
                        },
                        name: name
                    }
                })

                if (lists.length > 0) {
                    throw new ApplicationError("Já existe uma lista com esse nome")
                }

                const list = await strapi.documents('api::list.list').create({
                    data: {
                        name: name,
                        client: client
                    }
                })

                return list
            } catch (error) {
                if (error instanceof ApplicationError) {
                    throw new ApplicationError(error.message);
                }
                console.log(error)
                throw new ApplicationError("Ocorreu um erro, tente novamente")
            }
        })
    }

    // metodo para criar um topico dentro de uma lista
    async createTopic(ctx) {
        // inicia transacao no banco
        return await strapi.db.transaction(async (trx) => {
            try {
                // extrai o nome do topico e o id da lista
                const {
                    name,
                    listDocumentId
                }: CreateTopicDTO = ctx.request.body;
                // pega o id do usuario autenticado
                const { documentId: documentId } = ctx.state.user;

                // busca o usuario com seu cliente vinculado
                const user = await strapi.documents('plugin::users-permissions.user').findOne({
                    documentId: documentId, populate: ['client']
                })

                if (!user || !user.client) {
                    throw new ApplicationError("Usuário não encontrado")
                }

                // busca a lista a ser atualizada
                const list = await strapi.documents('api::list.list').findOne({
                    documentId: listDocumentId
                })

                if (!list) {
                    throw new ApplicationError("Lista não encontrada")
                }

                const topics = await strapi.documents('api::topic.topic').findMany({
                    filters: {
                        list: {
                            documentId: list.documentId
                        },
                        name: name
                    }
                })

                if (topics.length > 0) {
                    throw new ApplicationError("Já existe um tópico com esse nome nessa lista")
                }

                const topic = await strapi.documents('api::topic.topic').create({
                    data: {
                        name: name,
                        list: list
                    }
                })

                return topic
            } catch (error) {
                if (error instanceof ApplicationError) {
                    throw new ApplicationError(error.message);
                }
                console.log(error)
                throw new ApplicationError("Ocorreu um erro, tente novamente")
            }
        })
    }

    // metodo para listar todas as listas do cliente
    async listList(ctx) {
        try {
            // pega o id do usuario autenticado
            const { documentId: documentId } = ctx.state.user;

            // busca o usuario com seu cliente vinculado
            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: documentId, populate: ['client']
            })

            if (!user || !user.client) {
                throw new ApplicationError("Usuário não encontrado")
            }

            // busca todas as listas do cliente
            const list = await strapi.documents('api::list.list').findMany({
                filters: {
                    client: {
                        documentId: user.client.documentId
                    }
                }
            })

            return list
        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error)
            throw new ApplicationError("Ocorreu um erro, tente novamente")
        }
    }

    // metodo para listar todos os topicos de uma lista especifica
    async listTopic(ctx) {
        try {
            // pega o id da lista da query
            const { listDocumentId } = ctx.request.query;
            // pega o id do usuario autenticado
            const { documentId: documentId } = ctx.state.user;

            // busca o usuario com seu cliente vinculado
            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: documentId, populate: ['client']
            })

            if (!user || !user.client) {
                throw new ApplicationError("Usuário não encontrado")
            }

            const list = await strapi.documents('api::list.list').findOne({
                documentId: listDocumentId
            })

            if (!list) {
                throw new ApplicationError("Lista não encontrada")
            }

            const topics = await strapi.documents('api::topic.topic').findMany({
                filters: {
                    list: {
                        documentId: list.documentId
                    }
                }
            })

            return topics
        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error)
            throw new ApplicationError("Ocorreu um erro, tente novamente")
        }
    }

    // metodo para atualizar o nome de uma lista
    async updateList(ctx) {
        // inicia transacao no banco
        return await strapi.db.transaction(async (trx) => {
            try {
                // pega o id do usuario autenticado
                const { documentId: documentId } = ctx.state.user;
                // pega o id da lista da query
                const { listDocumentId } = ctx.request.query;
                // extrai o novo nome do corpo da requisicao
                const {
                    name
                }: CreateListDTO = ctx.request.body;

                // busca o usuario com seu cliente vinculado
                const user = await strapi.documents('plugin::users-permissions.user').findOne({
                    documentId: documentId, populate: ['client']
                })

                if (!user || !user.client) {
                    throw new ApplicationError("Usuário não encontrado")
                }

                const list = await strapi.documents('api::list.list').findOne({
                    documentId: listDocumentId
                })

                if (!list) {
                    throw new ApplicationError("Lista não encontrada")
                }

                // verifica se ja existe outra lista com o novo nome
                const lists = await strapi.documents('api::list.list').findMany({
                    filters: {
                        client: {
                            documentId: user.client.documentId
                        },
                        name: name,
                        documentId: {
                            $ne: list.documentId
                        }
                    }
                })

                if (lists.length > 0) {
                    throw new ApplicationError("Já existe uma lista com esse nome")
                }

                // atualiza o nome da lista
                const up = await strapi.documents('api::list.list').update({
                    documentId: list.documentId,
                    data: {
                        name: name
                    }
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

    // metodo para atualizar o nome de um topico
    async updateTopic(ctx) {
        // inicia transacao no banco
        return await strapi.db.transaction(async (trx) => {
            try {
                // pega o id do usuario autenticado
                const { documentId: documentId } = ctx.state.user;
                // pega o id do topico da query
                const { topicDocumentId } = ctx.request.query;
                // extrai o novo nome do corpo da requisicao
                const {
                    name
                }: CreateTopicDTO = ctx.request.body;

                // busca o usuario com seu cliente vinculado
                const user = await strapi.documents('plugin::users-permissions.user').findOne({
                    documentId: documentId, populate: ['client']
                })

                if (!user || !user.client) {
                    throw new ApplicationError("Usuário não encontrado")
                }

                const topic = await strapi.documents('api::topic.topic').findOne({
                    documentId: topicDocumentId, populate: ['list']
                })

                if (!topic) {
                    throw new ApplicationError("Tópico não encontrado")
                }

                const topics = await strapi.documents('api::topic.topic').findMany({
                    filters: {
                        list: {
                            documentId: topic.list.documentId
                        },
                        name: name,
                        documentId: {
                            $ne: topic.documentId
                        }
                    }
                })

                if (topics.length > 0) {
                    throw new ApplicationError("Já existe um tópico com esse nome")
                }

                const up = await strapi.documents('api::topic.topic').update({
                    documentId: topic.documentId,
                    data: {
                        name: name
                    }
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

    // metodo para deletar uma lista e todos seus topicos
    async deleteList(ctx) {
        // inicia transacao no banco
        return await strapi.db.transaction(async (trx) => {
            try {
                // pega o id do usuario autenticado
                const { documentId: documentId } = ctx.state.user;
                // pega o id da lista da query
                const { listDocumentId } = ctx.request.query;

                // busca o usuario com seu cliente vinculado
                const user = await strapi.documents('plugin::users-permissions.user').findOne({
                    documentId: documentId, populate: ['client']
                })

                if (!user || !user.client) {
                    throw new ApplicationError("Usuário não encontrado")
                }

                const list = await strapi.documents('api::list.list').findOne({
                    documentId: listDocumentId, populate: ['topics']
                })

                if (!list) {
                    throw new ApplicationError("Lista não encontrada")
                }

                if (list.topics.length > 0) {
                    for (const topic of list.topics) {
                        await strapi.documents('api::topic.topic').delete({
                            documentId: topic.documentId
                        })
                    }
                }

                await strapi.documents('api::list.list').delete({
                    documentId: list.documentId
                })

                return "Deletado com Sucesso"
            } catch (error) {
                if (error instanceof ApplicationError) {
                    throw new ApplicationError(error.message);
                }
                console.log(error)
                throw new ApplicationError("Ocorreu um erro, tente novamente")
            }
        })
    }

    // metodo para deletar um topico especifico
    async deleteTopic(ctx) {
        // inicia transacao no banco
        return await strapi.db.transaction(async (trx) => {
            try {
                // pega o id do usuario autenticado
                const { documentId: documentId } = ctx.state.user;
                // pega o id do topico da query
                const { topicDocumentId } = ctx.request.query;

                // busca o usuario com seu cliente vinculado
                const user = await strapi.documents('plugin::users-permissions.user').findOne({
                    documentId: documentId, populate: ['client']
                })

                if (!user || !user.client) {
                    throw new ApplicationError("Usuário não encontrado")
                }

                const topic = await strapi.documents('api::topic.topic').findOne({
                    documentId: topicDocumentId, populate: ['list']
                })

                if (!topic) {
                    throw new ApplicationError("Tópico não encontrado")
                }

                // deleta o topico
                await strapi.documents('api::topic.topic').delete({
                    documentId: topic.documentId,
                })

                return "Deletado com sucesso"

            } catch (error) {
                if (error instanceof ApplicationError) {
                    throw new ApplicationError(error.message);
                }
                console.log(error)
                throw new ApplicationError("Ocorreu um erro, tente novamente")
            }
        })
    }






} export { ListService };