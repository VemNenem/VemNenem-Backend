/**
 * post service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::post.post');

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
class PostService {
    async listPostsInClient(ctx) {
        try {
            const { documentId: documentId } = ctx.state.user;

            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: documentId, populate: ['client']
            })

            if (!user || !user.client) {
                throw new ApplicationError("Usuário não encontrado")
            }

            const posts = await strapi.documents('api::post.post').findMany({
                populate: ['image'],
                sort: [{ createdAt: 'desc' }],
            })

            return posts
        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error)
            throw new ApplicationError("Ocorreu um erro, tente novamente")
        }
    }
} export { PostService }