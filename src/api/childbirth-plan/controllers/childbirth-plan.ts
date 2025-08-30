/**
 * childbirth-plan controller
 */

import { factories } from '@strapi/strapi'
import { ChildbirthPlanService } from '../services/childbirth-plan';

//export default factories.createCoreController('api::childbirth-plan.childbirth-plan');


export default factories.createCoreController('api::childbirth-plan.childbirth-plan', ({ strapi }) => ({
    async listChildbirthPlan(ctx) {
        const sales = new ChildbirthPlanService();
        return sales.listChildbirthPlan(ctx);
    },
}));