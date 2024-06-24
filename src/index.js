require('dotenv').config();
const express = require('express');
const db = require("./database/manager");
const log4js = require("log4js");

log4js.configure({
    appenders: {
        'console': { type: 'console' },
        'file': { type: 'fileSync', filename: 'logs/logs.log' }
    },
    categories: {
        default: { appenders: ['file', 'console'], level: log4js.levels.ALL },
    }
});


var logger = log4js.getLogger("http");

const app = express();

app.get('/', async (req, res) => {
    res.send(process.env.HOSTNAME);
});

app.get('/sl/*', async (req, res) => {
    const id = req.path.split("/").pop();
    logger.debug(id);

    const link = await db.getLink(id);

    if (link == -1) { return res.sendStatus(404) }

    await res.redirect(link);
});

app.post('/new', async (req, res) => {
    if (!req.query?.link) { return res.sendStatus(400)}

    const link = req.query.link;
    await logger.debug(link)

    const id = await db.newLink(link);

    res.statusCode = 202;

    await res.send({
        "id": id,
        "link": `${process.env.HOSTNAME}/sl/${id}`,
    });
});

app.listen(process.env.PORT, async () => {
    await db.testConnection();
    logger.info("App listening on port", process.env.PORT);
});


logger.info("Running on host", process.env.HOSTNAME)
