const {QModels} = require("../Queries")
const { Schema } = require("../Schema");


class Model {
    constructor({id, schema} = {}){
        this.id = id;
        const parsedSchema = Schema.parse(schema);
        this.schema = new Schema(parsedSchema)
    }

    static async exists(id){
        const count = await QModels.countDocuments({id: id});

        return (count > 0)
    }

    validateDoc(document){
        const {valid, errors, sanitised} = this.schema.validateDoc(document);

        return {valid, errors, sanitised};
    }

    static async create({id, schema} = {}){

        const exists = await Model.exists(id);

        if(exists){
            return new Error(`ALREADY_EXISTS`)
        }

        const promise = new Promise((resolve, reject) => {

            const serialisedSchema = JSON.stringify(Schema.serialise(schema));

            QModels.insertOne({
                id,
                schema: serialisedSchema
            })
            .then(result => {
                resolve(result);
            })
            .catch(error => {
                reject(error);
            })

        });
        
        return promise;

    }

    static async open(id) {
        const promise = new Promise((resolve, reject) => {
            QModels.findOne({id: id})
                .then(result => {
                    resolve(new Model(result))
                })
                .catch(reject)
        })

        return promise
    }
}

module.exports = { Model }