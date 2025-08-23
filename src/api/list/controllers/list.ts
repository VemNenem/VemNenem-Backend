/**
 * list controller
 */

import { factories } from '@strapi/strapi'
import { ListService } from '../services/list';

//export default factories.createCoreController('api::list.list');


export default factories.createCoreController('api::list.list', ({ strapi }) => ({
    async createList(ctx) {
        const sales = new ListService();
        return sales.createList(ctx);
    },
    async createTopic(ctx) {
        const sales = new ListService();
        return sales.createTopic(ctx);
    },
    async listList(ctx) {
        const sales = new ListService();
        return sales.listList(ctx);
    },
    async listTopic(ctx) {
        const sales = new ListService();
        return sales.listTopic(ctx);
    },
}));