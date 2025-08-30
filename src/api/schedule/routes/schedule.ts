/**
 * schedule router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::schedule.schedule');

module.exports = {

    routes: [
        {
            method: "GET",
            path: "/getDaySchedule",
            handler: "schedule.getDaySchedule",
        },
        {
            method: "POST",
            path: "/createSchedule",
            handler: "schedule.createSchedule",
        },
        {
            method: "PUT",
            path: "/updateSchedule",
            handler: "schedule.updateSchedule",
        },
        {
            method: "DELETE",
            path: "/deleteSchedule",
            handler: "schedule.deleteSchedule",
        },
        {
            method: "GET",
            path: "/getMonthSchedule",
            handler: "schedule.getMonthSchedule",
        },
    ]
}