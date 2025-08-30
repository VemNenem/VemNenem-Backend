/**
 * childbirth-plan service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::childbirth-plan.childbirth-plan');


const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
class ChildbirthPlanService {


} export { ChildbirthPlanService }