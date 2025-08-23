/**
 * term service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::term.term');


const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
class TermService {
    async acceptTerms(ctx) {
        try {
            const { documentId: documentId } = ctx.state.user;
            const { type } = ctx.request.query
            const user = await strapi.documents("plugin::users-permissions.user").findOne({
                documentId: documentId,
                populate: ['client']
            })

            if (!user.client) {
                throw new ApplicationError("Usuário não encontrado")
            }

            const client = await strapi.documents("api::client.client").findOne({
                documentId: user.client.documentId
            })

            let term = null

            if (type === "privacy") {
                const terms = await strapi.documents('api::term.term').findMany({
                    filters: {
                        name: "Política de Privacidade"
                    }
                })

                if (terms.length === 0) {
                    throw new ApplicationError("Política de Privacidade não encontrado")
                }
                term = terms[0]
            } else {
                const terms = await strapi.documents('api::term.term').findMany({
                    filters: {
                        name: "Termo de Uso"
                    }
                })

                if (terms.length === 0) {
                    throw new ApplicationError("Termo de Uso não encontrado")
                }
                term = terms[0]
            }


            if (!term) {
                throw new ApplicationError("Termos não encontrados")
            }

            if (term.name === "Política de Privacidade") {
                await strapi.documents('api::client.client').update({
                    documentId: client.documentId,
                    data: {
                        acceptPrivacyPolicies: true,
                        acceptPrivacyPolicyDate: new Date()
                    }
                });
            } else {
                await strapi.documents('api::client.client').update({
                    documentId: client.documentId,
                    data: {
                        acceptTerm: true,
                        acceptUseTermDate: new Date()
                    }
                });
            }
            return "Termo aceito"
        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error)
            throw new ApplicationError("Ocorreu um erro, tente novamente")
        }
    }
    async updateTerms(ctx) {
        try {
            const { type } = ctx.request.query
            const { description } = ctx.request.body
            if (!description || description.trim() === "") {
                throw new ApplicationError("A descrição não pode estar vazia.");
            }
            let term = null
            if (type === "privacy") {
                const terms = await strapi.documents('api::term.term').findMany({
                    filters: {
                        name: "Política de Privacidade"
                    }
                })

                if (terms.length === 0) {
                    throw new ApplicationError("Política de Privacidade não encontrado")
                }
                term = terms[0]
            } else {
                const terms = await strapi.documents('api::term.term').findMany({
                    filters: {
                        name: "Termo de Uso"
                    }
                })

                if (terms.length === 0) {
                    throw new ApplicationError("Termo de Uso não encontrado")
                }
                term = terms[0]
            }


            if (!term) {
                throw new ApplicationError("Termos não encontrados")
            }
            const termDocumentId = term.documentId

            await strapi.documents('api::term.term').update({
                documentId: termDocumentId,
                data: {
                    description: description
                }
            });
            if (term.name === "Política de Privacidade") {
                await strapi.db.query("api::client.client").updateMany({
                    where: {
                        acceptPrivacyPolicies: true,
                    },
                    data: {
                        acceptPrivacyPolicies: false,
                    },
                });
            } else {
                await strapi.db.query("api::client.client").updateMany({
                    where: {
                        acceptTerm: true,
                    },
                    data: {
                        acceptTerm: false,
                    },
                });
            }

            return "Termo atualizado"
        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error)
            throw new ApplicationError("Ocorreu um erro, tente novamente")
        }
    }

    async listTerms(ctx) {
        try {
            const { type } = ctx.request.query
            let term = null

            if (type === "privacy") {
                const terms = await strapi.documents('api::term.term').findMany({
                    filters: {
                        name: "Política de Privacidade"
                    }
                })

                if (terms.length === 0) {
                    throw new ApplicationError("Política de Privacidade não encontrado")
                }
                term = terms[0]
            } else {
                const terms = await strapi.documents('api::term.term').findMany({
                    filters: {
                        name: "Termo de Uso"
                    }
                })

                if (terms.length === 0) {
                    throw new ApplicationError("Termo de Uso não encontrado")
                }
                term = terms[0]
            }


            if (!term) {
                throw new ApplicationError("Termos não encontrados")
            }

            return term
        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error)
            throw new ApplicationError("Ocorreu um erro, tente novamente")
        }
    }
} export { TermService }