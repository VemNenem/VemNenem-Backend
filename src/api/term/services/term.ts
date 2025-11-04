/**
 * term service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::term.term');


const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
class TermService {
    // aceita os termos de uso ou politica de privacidade
    async acceptTerms(ctx) {
        try {
            // pega o id do usuario e o tipo de termo
            const { documentId: documentId } = ctx.state.user;
            const { type } = ctx.request.query
            // busca o usuario com seu cliente vinculado
            const user = await strapi.documents("plugin::users-permissions.user").findOne({
                documentId: documentId,
                populate: ['client']
            })

            if (!user.client) {
                throw new ApplicationError("Usuário não encontrado")
            }

            // busca os dados do cliente
            const client = await strapi.documents("api::client.client").findOne({
                documentId: user.client.documentId
            })

            let term = null

            // verifica qual tipo de termo esta sendo aceito
            if (type === "privacy") {
                // busca a politica de privacidade
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
                // busca o termo de uso
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

            // atualiza o cliente marcando o termo como aceito
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
    // atualiza a descricao dos termos e desmarca aceite de todos os clientes
    async updateTerms(ctx) {
        try {
            // pega o tipo de termo e a nova descricao
            const { type } = ctx.request.query
            const { description } = ctx.request.body
            if (!description || description.trim() === "") {
                throw new ApplicationError("A descrição não pode estar vazia.");
            }
            let term = null
            // verifica qual tipo de termo esta sendo atualizado
            if (type === "privacy") {
                // busca a politica de privacidade
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
                // busca o termo de uso
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

            // atualiza a descricao do termo
            await strapi.documents('api::term.term').update({
                documentId: termDocumentId,
                data: {
                    description: description
                }
            });
            // desmarca o aceite de todos os clientes para forcar nova aceitacao
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

    // lista os termos de uso ou politica de privacidade
    async listTerms(ctx) {
        try {
            // pega o tipo de termo a ser listado
            const { type } = ctx.request.query
            let term = null

            // verifica qual tipo de termo esta sendo buscado
            if (type === "privacy") {
                // busca a politica de privacidade
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
                // busca o termo de uso
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