/**
 * list router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::list.list');

module.exports = {

    routes: [
        {
            method: "POST",
            path: "/createList",
            handler: "list.createList",
        },
        {
            method: "POST",
            path: "/createTopic",
            handler: "list.createTopic",
        },
    ]
}
