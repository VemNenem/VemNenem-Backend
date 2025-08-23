/**
 * operation router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::operation.operation');

module.exports = {

    routes: [
        {
            method: "POST",
            path: "/createList",
            handler: "operation.createList",
        },
        {
            method: "POST",
            path: "/createTopic",
            handler: "operation.createTopic",
        },
    ]
}