/**
 * schedule controller
 */

import { factories } from '@strapi/strapi'
import { ScheduleService } from '../services/schedule';

//export default factories.createCoreController('api::schedule.schedule');

export default factories.createCoreController('api::schedule.schedule', ({ strapi }) => ({
    async getDaySchedule(ctx) {
        const sales = new ScheduleService();
        return sales.getDaySchedule(ctx);
    },
}));
