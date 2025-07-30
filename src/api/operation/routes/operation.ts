/**
 * operation router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::operation.operation');

module.exports = {

    routes: [
        {
            method: "POST",
            path: "/createClient",
            handler: "operation.createClient",
        },
        {
            method: "GET",
            path: "/getMyData",
            handler: "operation.getMyData",
        },
        {
            method: "PUT",
            path: "/updateClient",
            handler: "operation.updateClient",
        },
    ]
}