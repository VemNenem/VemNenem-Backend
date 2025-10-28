/**
 * client controller
 */

import { factories } from '@strapi/strapi'
import { ClientService } from '../services/client';

// export default factories.createCoreController('api::client.client');

export default factories.createCoreController('api::client.client', ({ strapi }) => ({
    async createClient(ctx) {
        const sales = new ClientService();
        return sales.createClient(ctx);
    },
    async getMyData(ctx) {
        const sales = new ClientService();
        return sales.getMyData(ctx);
    },
    async updateClient(ctx) {
        const sales = new ClientService();
        return sales.updateClient(ctx);
    },
    async getHome(ctx) {
        const sales = new ClientService();
        return sales.getHome(ctx);
    },
    async createMaster(ctx) {
        const sales = new ClientService();
        return sales.createMaster(ctx);
    },
    async listMasters(ctx) {
        const sales = new ClientService();
        return sales.listMasters(ctx);
    },
    async deleteMaster(ctx) {
        const sales = new ClientService();
        return sales.deleteMaster(ctx);
    },
    async listUsersInMaster(ctx) {
        const sales = new ClientService();
        return sales.listUsersInMaster(ctx);
    },
    async deleteUserInMaster(ctx) {
        const sales = new ClientService();
        return sales.deleteUserInMaster(ctx);
    },
    async blockAndUnblockUser(ctx) {
        const sales = new ClientService();
        return sales.blockAndUnblockUser(ctx);
    },
    async deleteMyClient(ctx) {
        const sales = new ClientService();
        return sales.deleteMyClient(ctx);
    },
    async forgotPassword(ctx) {
        const sales = new ClientService();
        return sales.forgotPassword(ctx);
    },
    async resetPassword(ctx) {
        const sales = new ClientService();
        return sales.resetPassword(ctx);
    },
}))