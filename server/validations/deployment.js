const Joi = require("joi");

module.exports.deploymentCreateValidation = Joi.object({
    serverId: Joi.number().integer().positive().required(),
    name: Joi.string().min(1).max(100).pattern(/^[a-zA-Z0-9_-]+$/).required(),
    repoUrl: Joi.string().uri({ allowRelative: false }).required(),
    branch: Joi.string().min(1).max(200).default("main"),
    dockerfilePath: Joi.string().min(1).max(500).default("Dockerfile"),
    buildContext: Joi.string().min(1).max(500).default("."),
    composeContent: Joi.string().max(1048576).allow("", null),
    autoBuild: Joi.boolean().default(false),
    autoBuildInterval: Joi.number().integer().min(60).max(86400).default(300),
    gitCredentialId: Joi.number().integer().positive().allow(null),
});

module.exports.deploymentUpdateValidation = Joi.object({
    branch: Joi.string().min(1).max(200),
    dockerfilePath: Joi.string().min(1).max(500),
    buildContext: Joi.string().min(1).max(500),
    composeContent: Joi.string().max(1048576).allow("", null),
    autoBuild: Joi.boolean(),
    autoBuildInterval: Joi.number().integer().min(60).max(86400),
    gitCredentialId: Joi.number().integer().positive().allow(null),
}).min(1);
