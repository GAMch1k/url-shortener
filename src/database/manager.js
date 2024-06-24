require('dotenv').config();
const crypto = require("crypto");
const lodash = require("lodash");

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

var logger = log4js.getLogger("mongo");

const { MongoClient } = require("mongodb");


class DBConnector {
    constructor() {
        this.client = new MongoClient(process.env.MONGO_URI)
        this.db = this.client.db(process.env.MONGO_DB)
        this.coll = this.db.collection(process.env.MONGO_COLLECTION)
    }


    async findOne(query = {}) {
        return await this.coll.findOne(query);
    }


    async insertOne(query) {
        if (lodash.isEmpty(query)) { return ;}
        return await this.coll.insertOne(query);
    }


    async close() {
        await this.client.close();
    }
}


async function testConnection() {
    try {
        const db = new DBConnector();
        await db.findOne();
        await db.close();
        logger.info("Connection to MongoDB estabilished")
    } catch (err) {
        logger.fatal("Connection to MongoDB failed", err)
        process.exit(-1);
    }
    
}


async function idExist(id) {
    const db = new DBConnector();
    const res = await db.findOne({"id": id});
    await db.close();

    return !lodash.isEmpty(res);
}


async function newLink(link) {
    const db = new DBConnector();
    let id = crypto.randomBytes(8).toString("hex");

    while (true) {
        if (!await idExist(id)) { break }
        id = crypto.randomBytes(8).toString("hex");
    }

    await db.insertOne({
        "id": id, 
        "link": link,
    });

    await db.close();

    return id;
}

async function getLink(id) {
    const db = new DBConnector();
    const res = await db.findOne({"id": id});
    await db.close();

    if (lodash.isEmpty(res)) {
        return -1;
    }

    return res.link;
}



module.exports = {
    testConnection,
    newLink,
    getLink,

}