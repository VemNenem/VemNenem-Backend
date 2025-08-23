/**
 * list service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::list.list');


import { CreateListDTO, CreateTopicDTO } from "../dto/createListDTO";

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
class ListService {
    async createList(ctx) {
        return await strapi.db.transaction(async (trx) => {
            try {
                const {
                    name,
                }: CreateListDTO = ctx.request.body;
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

    async createTopic(ctx) {
        return await strapi.db.transaction(async (trx) => {
            try {
                const {
                    name,
                    listDocumentId
                }: CreateTopicDTO = ctx.request.body;
                const { documentId: documentId } = ctx.state.user;

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

    async listList(ctx) {
        try {
            const { documentId: documentId } = ctx.state.user;

            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: documentId, populate: ['client']
            })

            if (!user || !user.client) {
                throw new ApplicationError("Usuário não encontrado")
            }

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

    async listTopic(ctx) {
        try {
            const { listDocumentId } = ctx.request.query;
            const { documentId: documentId } = ctx.state.user;

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

    async updateList(ctx) {
        return await strapi.db.transaction(async (trx) => {
            try {
                const { documentId: documentId } = ctx.state.user;
                const { listDocumentId } = ctx.request.query;
                const {
                    name
                }: CreateListDTO = ctx.request.body;

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
                    throw new ApplicationError("Já existe uma lista com esse nome")
                }

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


    async updateTopic(ctx) {
        return await strapi.db.transaction(async (trx) => {
            try {
                const { documentId: documentId } = ctx.state.user;
                const { topicDocumentId } = ctx.request.query;
                const {
                    name
                }: CreateTopicDTO = ctx.request.body;

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







} export { ListService };