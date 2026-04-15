const Sequelize = require("sequelize");
const db = require("../utils/database");

module.exports = db.define("deployments", {
    serverId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    stackId: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    repoUrl: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    branch: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "main",
    },
    dockerfilePath: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Dockerfile",
    },
    buildContext: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ".",
    },
    imageName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    composeContent: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    autoBuild: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    autoBuildInterval: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 300,
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "pending",
    },
    lastBuildStatus: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    lastBuildLog: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    lastBuildAt: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    lastCommitHash: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    lastCommitMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    gitCredentialId: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    port: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
}, { freezeTableName: true });
