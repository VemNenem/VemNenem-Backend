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
        {
            method: "GET",
            path: "/listList",
            handler: "list.listList",
        },
        {
            method: "GET",
            path: "/listTopic",
            handler: "list.listTopic",
        },
        {
            method: "PUT",
            path: "/updateList",
            handler: "list.updateList",
        },
        {
            method: "PUT",
            path: "/updateTopic",
            handler: "list.updateTopic",
        },
    ]
}
