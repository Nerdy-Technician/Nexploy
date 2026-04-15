const { Hono } = require("hono");
const { deploymentCreateValidation, deploymentUpdateValidation } = require("../validations/deployment");
const {
    listDeployments, getDeployment, createDeployment, updateDeployment,
    deleteDeployment, buildDeployment, getBuildLog, checkForUpdates,
} = require("../controllers/deployment");
const { authenticate } = require("../middlewares/auth");
const { validateSchema } = require("../utils/schema");

const app = new Hono();

app.get("/", authenticate, async (c) => {
    const serverId = c.req.query("serverId") ? parseInt(c.req.query("serverId"), 10) : null;
    return c.json(await listDeployments(serverId));
});

app.post("/", authenticate, async (c) => {
    const body = await c.req.json();
    const error = validateSchema(deploymentCreateValidation, body);
    if (error) return c.json({ message: error }, 400);

    const result = await createDeployment(body);
    if (result?.code) return c.json(result, result.code === 602 ? 400 : 409);
    return c.json(result, 201);
});

app.get("/:id", authenticate, async (c) => {
    const id = parseInt(c.req.param("id"), 10);
    const result = await getDeployment(id);
    if (result?.code) return c.json(result, 404);
    return c.json(result);
});

app.patch("/:id", authenticate, async (c) => {
    const id = parseInt(c.req.param("id"), 10);
    const body = await c.req.json();
    const error = validateSchema(deploymentUpdateValidation, body);
    if (error) return c.json({ message: error }, 400);

    const result = await updateDeployment(id, body);
    if (result?.code) return c.json(result, 404);
    return c.json(result);
});

app.delete("/:id", authenticate, async (c) => {
    const id = parseInt(c.req.param("id"), 10);
    const result = await deleteDeployment(id);
    if (result?.code) return c.json(result, result.code === 601 ? 404 : 400);
    return c.json(result);
});

app.post("/:id/build", authenticate, async (c) => {
    const id = parseInt(c.req.param("id"), 10);
    const result = await buildDeployment(id);
    if (result?.code) return c.json(result, result.code === 601 ? 404 : 400);
    return c.json(result);
});

app.get("/:id/log", authenticate, async (c) => {
    const id = parseInt(c.req.param("id"), 10);
    const result = await getBuildLog(id);
    if (result?.code) return c.json(result, 404);
    return c.json(result);
});

app.get("/:id/updates", authenticate, async (c) => {
    const id = parseInt(c.req.param("id"), 10);
    const result = await checkForUpdates(id);
    if (result?.code) return c.json(result, result.code === 601 ? 404 : 400);
    return c.json(result);
});

module.exports = app;
