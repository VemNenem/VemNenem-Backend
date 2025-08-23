/**
 * client router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::client.client');

module.exports = {

    routes: [
        {
            method: "POST",
            path: "/createClient",
            handler: "client.createClient",
        },
        {
            method: "GET",
            path: "/getMyData",
            handler: "client.getMyData",
        },
        {
            method: "PUT",
            path: "/updateClient",
            handler: "client.updateClient",
        },
        {
            method: "GET",
            path: "/getHome",
            handler: "client.getHome",
        },
    ]
}