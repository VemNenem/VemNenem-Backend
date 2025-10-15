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
        {
            method: "POST",
            path: "/createMaster",
            handler: "client.createMaster",
        },
        {
            method: "GET",
            path: "/listMasters",
            handler: "client.listMasters",
        },
        {
            method: "DELETE",
            path: "/deleteMaster",
            handler: "client.deleteMaster",
        },
        {
            method: "GET",
            path: "/listUsersInMaster",
            handler: "client.listUsersInMaster",
        },
        {
            method: "DELETE",
            path: "/deleteUserInMaster",
            handler: "client.deleteUserInMaster",
        },
        {
            method: "PATCH",
            path: "/blockAndUnblockUser",
            handler: "client.blockAndUnblockUser",
        },
        {
            method: "DELETE",
            path: "/deleteMyClient",
            handler: "client.deleteMyClient",
        },
        {
            method: "POST",
            path: "/forgotPassword",
            handler: "client.forgotPassword",
        },
    ]
}