/**
 * term controller
 */

import { factories } from '@strapi/strapi'
import { TermService } from '../services/term';

//export default factories.createCoreController('api::term.term');

export default factories.createCoreController('api::term.term', ({ strapi }) => ({
    async acceptTerms(ctx) {
        const sales = new TermService();
        return sales.acceptTerms(ctx);
    },
    async updateTerms(ctx) {
        const sales = new TermService();
        return sales.updateTerms(ctx);
    },
}));