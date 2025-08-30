/**
 * post service
 */

import { factories } from '@strapi/strapi';
import { CreatePostBodyDTO, CreatePostFilesDTO } from '../dto/createPostDTO';

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

    async getPostsInClient(ctx) {
        try {
            const { documentId: documentId } = ctx.state.user;
            const { postDocumentId } = ctx.request.query;

            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: documentId, populate: ['client']
            })

            if (!user || !user.client) {
                throw new ApplicationError("Usuário não encontrado")
            }

            const post = await strapi.documents('api::post.post').findOne({
                documentId: postDocumentId, populate: ['image']
            })

            if (!post) {
                throw new ApplicationError("Post não encontrado")
            }

            return post
        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error)
            throw new ApplicationError("Ocorreu um erro, tente novamente")
        }
    }

    async listPostsInMaster(ctx) {
        try {
            const { documentId: documentId } = ctx.state.user;
            const { page, pageSize } = ctx.request.query
            const currentPage = page ? parseInt(page.toString(), 10) : 1;
            const perPage = pageSize ? parseInt(pageSize.toString(), 10) : 10;
            const startIndex = (currentPage - 1) * perPage;
            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: documentId
            })

            if (!user) {
                throw new ApplicationError("Usuário não encontrado")
            }

            const posts = await strapi.documents('api::post.post').findMany({
                populate: ['image'],
                start: startIndex,
                limit: perPage,
                sort: [{ createdAt: 'desc' }],
            })
            const total = await strapi.documents('api::post.post').count({});
            const totalPages = Math.ceil(total / perPage);

            return {
                posts: posts,
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

    async deletePostInMaster(ctx) {
        try {
            const { documentId: documentId } = ctx.state.user;
            const { postDocumentId } = ctx.request.query
            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: documentId
            })

            if (!user) {
                throw new ApplicationError("Usuário não encontrado")
            }

            const post = await strapi.documents('api::post.post').findOne({
                documentId: postDocumentId,
                populate: ['image']
            })

            if (!post) {
                throw new ApplicationError("Post não encontrado")
            }

            if (post.image) {
                await strapi.documents('plugin::upload.file').delete({
                    documentId: post.image.documentId
                })
            }

            await strapi.documents('api::post.post').delete({
                documentId: post.documentId
            })

            return "Post excluido com sucesso"
        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error)
            throw new ApplicationError("Ocorreu um erro, tente novamente")
        }
    }


    async createPost(ctx) {
        return await strapi.db.transaction(async (trx) => {
            try {
                const { documentId: documentId } = ctx.state.user;
                const body: CreatePostBodyDTO = ctx.request.body;
                const files: CreatePostFilesDTO = ctx.request.files || {};

                const { title, text, author } = body;
                const { image } = files;

                console.log("BODY:", body);
                console.log("FILES:", files);

                const user = await strapi.documents('plugin::users-permissions.user').findOne({
                    documentId: documentId
                })

                if (!user) {
                    throw new ApplicationError("Usuário não encontrado")
                }

                const post = await strapi.documents('api::post.post').create({
                    data: {
                        title: title,
                        text: text,
                        author: author
                    }
                })

                if (image) {
                    console.log(image)
                    const upload = await strapi.plugins["upload"].services.upload.upload({
                        files: image,
                        data: {
                            ref: "api::post.post",
                            refId: post.id,
                            field: "image",
                        },
                    });
                    console.log(upload)
                    if (!upload) {
                        throw new ApplicationError('Falha no upload da imagem.');
                    }
                }

                return await strapi.documents('api::post.post').findOne({
                    documentId: post.documentId,
                    populate: ['image']
                })
            } catch (error) {
                if (error instanceof ApplicationError) {
                    throw new ApplicationError(error.message);
                }
                console.log(error)
                throw new ApplicationError("Ocorreu um erro, tente novamente")
            }
        })
    }
} export { PostService }