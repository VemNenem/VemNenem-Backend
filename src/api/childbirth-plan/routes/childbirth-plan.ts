/**
 * childbirth-plan router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::childbirth-plan.childbirth-plan');


module.exports = {

    routes: [
        {
            method: "GET",
            path: "/listChildbirthPlan",
            handler: "childbirth-plan.listChildbirthPlan",
        },
        {
            method: "PATCH",
            path: "/selectOrUnselectChildbirthPlan",
            handler: "childbirth-plan.selectOrUnselectChildbirthPlan",
        },
        {
            method: "GET",
            path: "/pdfChildbirthPlan",
            handler: "childbirth-plan.pdfChildbirthPlan",
        },
    ]
}