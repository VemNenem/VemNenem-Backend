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
    async createSchedule(ctx) {
        const sales = new ScheduleService();
        return sales.createSchedule(ctx);
    },
    async updateSchedule(ctx) {
        const sales = new ScheduleService();
        return sales.updateSchedule(ctx);
    },
    async deleteSchedule(ctx) {
        const sales = new ScheduleService();
        return sales.deleteSchedule(ctx);
    },
    async getMonthSchedule(ctx) {
        const sales = new ScheduleService();
        return sales.getMonthSchedule(ctx);
    },
}));
