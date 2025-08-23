/**
 * operation controller
 */

import { factories } from '@strapi/strapi'
import { ListService } from '../services/listService';

export default factories.createCoreController('api::operation.operation', ({ strapi }) => ({
    async createList(ctx) {
        const sales = new ListService();
        return sales.createList(ctx);
    },
    async createTopic(ctx) {
        const sales = new ListService();
        return sales.createTopic(ctx);
    },
}));
