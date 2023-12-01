const { Query } = require("@MeekStudio/QueryCX");

const account = process.env.SESSION_USER_ID;
const database = process.env.MATTERCX_DATABASE;

const modelcollection = `${account}-models`;
const editionscollection = `${account}-editions`;
const mattercollection = `${account}-matter`;

const QModels = new Query({
    database,
    collection: modelcollection
});

const QEditions = new Query({
    database,
    collection: editionscollection
});

const QMatter = new Query({
    database,
    collection: mattercollection
});

module.exports = {QModels, QEditions, QMatter}