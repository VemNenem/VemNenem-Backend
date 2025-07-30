/**
 * operation controller
 */

import { factories } from '@strapi/strapi'
import { ClientService } from '../services/clientService';

export default factories.createCoreController('api::operation.operation', ({ strapi }) => ({
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
}));
