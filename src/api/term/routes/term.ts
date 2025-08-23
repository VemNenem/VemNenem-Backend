/**
 * term router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::term.term');


module.exports = {

    routes: [
        {
            method: "PATCH",
            path: "/acceptTerms",
            handler: "term.acceptTerms",
        },
        {
            method: "PUT",
            path: "/updateTerms",
            handler: "term.updateTerms",
        },
    ]
}