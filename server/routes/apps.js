const { Hono } = require("hono");
const { authenticate } = require("../middlewares/auth");
const { listApps, getApp, getAppLogo, getAppGalleryImage } = require("../controllers/source");
const path = require("path");

const app = new Hono();

app.get("/:source/:slug/logo", async (c) => {
    const { source, slug } = c.req.param();
    const logoPath = getAppLogo(source, slug);
    if (!logoPath) return c.json({ code: 404, message: "Logo not found" }, 404);

    const file = Bun.file(logoPath);
    return new Response(file, {
        headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" },
    });
});

app.get("/:source/:slug/gallery/:filename", async (c) => {
    const { source, slug, filename } = c.req.param();
    const imagePath = getAppGalleryImage(source, slug, filename);
    if (!imagePath) return c.json({ code: 404, message: "Image not found" }, 404);

    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";

    const file = Bun.file(imagePath);
    return new Response(file, {
        headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=3600" },
    });
});

app.get("/", authenticate, async (c) => {
    try {
        const { page, limit, search, category, type, source } = c.req.query();
        const result = await listApps({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 24,
            search,
            category,
            type,
            source,
        });
        return c.json(result);
    } catch (err) {
        return c.json({ code: 500, message: err.message }, 500);
    }
});

app.get("/:source/:slug", authenticate, async (c) => {
    try {
        const { source, slug } = c.req.param();
        const appData = await getApp(source, slug);
        if (!appData) return c.json({ code: 404, message: "App not found" }, 404);
        return c.json(appData);
    } catch (err) {
        return c.json({ code: 500, message: err.message }, 500);
    }
});

module.exports = app;
