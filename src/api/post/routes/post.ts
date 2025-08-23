/**
 * post router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::post.post');

module.exports = {

    routes: [
        {
            method: "GET",
            path: "/listPostsInClient",
            handler: "post.listPostsInClient",
        },
        {
            method: "GET",
            path: "/getPostsInClient",
            handler: "post.getPostsInClient",
        },
    ]
}