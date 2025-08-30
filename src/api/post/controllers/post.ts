/**
 * post controller
 */

import { factories } from '@strapi/strapi'
import { PostService } from '../services/post';

//export default factories.createCoreController('api::post.post');

export default factories.createCoreController('api::post.post', ({ strapi }) => ({
    async listPostsInClient(ctx) {
        const sales = new PostService();
        return sales.listPostsInClient(ctx);
    },
    async getPostsInClient(ctx) {
        const sales = new PostService();
        return sales.getPostsInClient(ctx);
    },
    async listPostsInMaster(ctx) {
        const sales = new PostService();
        return sales.listPostsInMaster(ctx);
    },
    async deletePostInMaster(ctx) {
        const sales = new PostService();
        return sales.deletePostInMaster(ctx);
    },
    async createPost(ctx) {
        const sales = new PostService();
        return sales.createPost(ctx);
    },
}));