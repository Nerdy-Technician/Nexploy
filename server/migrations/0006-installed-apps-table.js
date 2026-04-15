const { DataTypes } = require("sequelize");

module.exports = {
    async up(queryInterface) {
        const tableNames = await queryInterface.showAllTables();

        if (!tableNames.includes("installed_apps")) {
            await queryInterface.createTable("installed_apps", {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                    allowNull: false,
                },
                slug: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                source: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                serverId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                stackId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                version: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                type: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: "docker",
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                category: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                updateAvailable: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                parentSlug: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                installedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
            });

            await queryInterface.addIndex("installed_apps", ["serverId"]);
            await queryInterface.addIndex("installed_apps", ["slug", "source", "serverId"], { unique: true });
        }
    },
};
