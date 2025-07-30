
const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
class ClientService {
    async createContract(ctx) {
        try {
            const { name } = ctx.request.body;



        } catch (error) {
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.log(error)
            throw new ApplicationError("Ocorreu um erro, tente novamente")
        }
    }



} export { ClientService };