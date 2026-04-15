const Joi = require("joi");

module.exports.appInstallValidation = Joi.object({
    serverId: Joi.number().integer().positive().required(),
});
