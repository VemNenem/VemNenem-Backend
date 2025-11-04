/**
 * post service
 */

import { factories } from '@strapi/strapi';
import { CreatePostBodyDTO, CreatePostFilesDTO } from '../dto/createPostDTO';

export default factories.createCoreService('api::post.post');

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
class PostService {
    // metodo para listar todos os posts para o cliente
    async listPostsInClient(ctx) {
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

            // busca todos os posts com suas imagens ordenados por data de criacao
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

    // metodo para buscar um post especifico para o cliente
    async getPostsInClient(ctx) {
        try {
            // pega o id do usuario autenticado
            const { documentId: documentId } = ctx.state.user;
            // pega o id do post da query
            const { postDocumentId } = ctx.request.query; const user = await strapi.documents('plugin::users-permissions.user').findOne({
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

    // metodo para listar posts no painel master com paginacao
    async listPostsInMaster(ctx) {
        try {
            // pega o id do usuario autenticado
            const { documentId: documentId } = ctx.state.user;
            // extrai parametros de paginacao da query
            const { page, pageSize } = ctx.request.query
            const currentPage = page ? parseInt(page.toString(), 10) : 1;
            const perPage = pageSize ? parseInt(pageSize.toString(), 10) : 10;
            const startIndex = (currentPage - 1) * perPage;
            // busca o usuario
            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: documentId
            })

            if (!user) {
                throw new ApplicationError("Usuário não encontrado")
            }

            // busca posts com paginacao e ordenacao por data
            const posts = await strapi.documents('api::post.post').findMany({
                populate: ['image'],
                start: startIndex,
                limit: perPage,
                sort: [{ createdAt: 'desc' }],
            })
            // conta o total de posts para calcular paginacao
            const total = await strapi.documents('api::post.post').count({});
            const totalPages = Math.ceil(total / perPage);

            // retorna posts e informacoes de paginacao
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

    // metodo para master deletar um post
    async deletePostInMaster(ctx) {
        try {
            // pega o id do usuario autenticado
            const { documentId: documentId } = ctx.state.user;
            // pega o id do post da query
            const { postDocumentId } = ctx.request.query
            // busca o usuario
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

    // metodo para criar um novo post com imagem
    async createPost(ctx) {
        // inicia transacao no banco
        return await strapi.db.transaction(async (trx) => {
            try {
                // pega o id do usuario autenticado
                const { documentId: documentId } = ctx.state.user;
                // extrai dados do corpo da requisicao
                const body: CreatePostBodyDTO = ctx.request.body;
                // extrai arquivos enviados
                const files: CreatePostFilesDTO = ctx.request.files || {};

                const { title, text, author } = body;
                const { image } = files;

                console.log("BODY:", body);
                console.log("FILES:", files);

                // busca o usuario
                const user = await strapi.documents('plugin::users-permissions.user').findOne({
                    documentId: documentId
                })

                if (!user) {
                    throw new ApplicationError("Usuário não encontrado")
                }

                // cria o post com titulo, texto e autor
                const post = await strapi.documents('api::post.post').create({
                    data: {
                        title: title,
                        text: text,
                        author: author
                    }
                })

                // se foi enviada uma imagem, faz o upload dela
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

                // retorna o post criado com sua imagem
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