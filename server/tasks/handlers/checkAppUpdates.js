const InstalledApp = require("../../models/InstalledApp");
const Source = require("../../models/Source");
const logger = require("../../utils/logger");
const fs = require("fs");
const path = require("path");
const yaml = require("yaml");

const SOURCES_DIR = path.join(process.cwd(), "data", "sources");

const checkAppUpdatesHandler = async () => {
    const installedApps = await InstalledApp.findAll();
    if (!installedApps.length) return;

    const sources = await Source.findAll({ where: { enabled: true } });
    const sourceMap = new Map(sources.map(s => [s.name, s]));

    let updatesFound = 0;

    for (const app of installedApps) {
        if (!sourceMap.has(app.source)) continue;

        const firstLetter = app.slug.charAt(0).toLowerCase();
        const manifestPath = path.join(SOURCES_DIR, app.source, firstLetter, app.slug, "manifest.yml");
        const altManifestPath = path.join(SOURCES_DIR, app.source, firstLetter, app.slug, "manifest.yaml");

        const mPath = fs.existsSync(manifestPath) ? manifestPath
            : fs.existsSync(altManifestPath) ? altManifestPath
            : null;

        if (!mPath) {
            if (app.updateAvailable) {
                await InstalledApp.update({ updateAvailable: null }, { where: { id: app.id } });
            }
            continue;
        }

        try {
            const manifest = yaml.parse(fs.readFileSync(mPath, "utf-8"));
            if (manifest.version && manifest.version !== app.version) {
                if (app.updateAvailable !== manifest.version) {
                    await InstalledApp.update(
                        { updateAvailable: manifest.version },
                        { where: { id: app.id } }
                    );
                    updatesFound++;
                }
            } else if (app.updateAvailable) {
                await InstalledApp.update({ updateAvailable: null }, { where: { id: app.id } });
            }
        } catch (err) {
            logger.warn(`Failed to check update for ${app.slug}`, { error: err.message });
        }
    }

    if (updatesFound > 0) {
        logger.info(`Found ${updatesFound} app update(s) available`);
    }
};

module.exports = checkAppUpdatesHandler;
