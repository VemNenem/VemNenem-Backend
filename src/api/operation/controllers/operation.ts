/**
 * operation controller
 */

import { factories } from '@strapi/strapi'
import { ClientService } from '../services/clientService';
import { ListService } from '../services/listService';

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
    async createList(ctx) {
        const sales = new ListService();
        return sales.createList(ctx);
    },
    async createTopic(ctx) {
        const sales = new ListService();
        return sales.createTopic(ctx);
    },
}));
