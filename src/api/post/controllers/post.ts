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
}));