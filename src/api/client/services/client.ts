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



} export { ClientService };