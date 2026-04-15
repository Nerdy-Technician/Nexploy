const Joi = require("joi");

module.exports.validateUrlValidation = Joi.object({
    url: Joi.string().uri().required(),
});

module.exports.sourceUpdateValidation = Joi.object({
    url: Joi.string().uri(),
    enabled: Joi.boolean(),
}).or("url", "enabled");
