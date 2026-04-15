const { Hono } = require("hono");
const { authenticate } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/permission");
const { validateUrlValidation, sourceUpdateValidation } = require("../validations/source");
const {
    listSources,
    createSource,
    updateSource,
    deleteSource,
    syncSource,
    validateSourceUrl,
} = require("../controllers/source");

const app = new Hono();

app.use("*", authenticate, isAdmin);

app.get("/", async (c) => {
    try {
        const sources = await listSources();
        return c.json(sources);
    } catch (err) {
        return c.json({ code: 500, message: err.message }, 500);
    }
});

app.post("/validate", async (c) => {
    try {
        const body = await c.req.json();
        const { error } = validateUrlValidation.validate(body);
        if (error) return c.json({ code: 400, message: error.details[0].message }, 400);

        const result = await validateSourceUrl(body.url);
        return c.json({ valid: true, name: result.name, appCount: result.apps.length });
    } catch (err) {
        return c.json({ valid: false, error: err.message });
    }
});

app.post("/", async (c) => {
    try {
        const body = await c.req.json();
        const { error } = validateUrlValidation.validate(body);
        if (error) return c.json({ code: 400, message: error.details[0].message }, 400);

        const source = await createSource(body.url);
        syncSource(source.name).catch(() => {});
        return c.json({ message: "Source created", name: source.name }, 201);
    } catch (err) {
        return c.json({ code: 400, message: err.message }, 400);
    }
});

app.patch("/:name", async (c) => {
    try {
        const { name } = c.req.param();
        const body = await c.req.json();
        const { error } = sourceUpdateValidation.validate(body);
        if (error) return c.json({ code: 400, message: error.details[0].message }, 400);

        const source = await updateSource(name, body);
        return c.json({ message: "Source updated", source });
    } catch (err) {
        return c.json({ code: 400, message: err.message }, 400);
    }
});

app.delete("/:name", async (c) => {
    try {
        const { name } = c.req.param();
        await deleteSource(name);
        return c.json({ message: "Source deleted" });
    } catch (err) {
        return c.json({ code: 400, message: err.message }, 400);
    }
});

app.post("/:name/sync", async (c) => {
    try {
        const { name } = c.req.param();
        const result = await syncSource(name);
        if (!result.success) return c.json({ code: 500, message: result.error }, 500);
        return c.json({ message: "Source synced" });
    } catch (err) {
        return c.json({ code: 500, message: err.message }, 500);
    }
});

module.exports = app;
