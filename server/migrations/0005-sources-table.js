const { DataTypes } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const tableNames = await queryInterface.showAllTables();

        if (!tableNames.includes("sources")) {
            await queryInterface.createTable("sources", {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                    allowNull: false,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                url: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                enabled: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
                isDefault: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                lastSyncStatus: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                lastSyncVersion: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                appCount: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
            });
        }
    },
};
