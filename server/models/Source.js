const Sequelize = require("sequelize");
const db = require("../utils/database");

module.exports = db.define("sources", {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    isDefault: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    lastSyncStatus: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    lastSyncVersion: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    appCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
});
