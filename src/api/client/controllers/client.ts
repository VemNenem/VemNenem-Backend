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
}))