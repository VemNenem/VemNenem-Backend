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
        {
            method: "GET",
            path: "/listPostsInMaster",
            handler: "post.listPostsInMaster",
        },
        {
            method: "DELETE",
            path: "/deletePostInMaster",
            handler: "post.deletePostInMaster",
        },
        {
            method: "POST",
            path: "/createPost",
            handler: "post.createPost",
        },
    ]
}