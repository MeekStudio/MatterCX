const { ShortText } = require("@MeekStudio/DataTypesCX");
const { Schema, SchemaError } = require("../Schema");
const {QEditions} = require("../Queries")

class Edition {
    #schema;
    #draft;
    #final;

    #buildSchema(model){
        const metaSchema = new Schema({
            name: {type: ShortText, required: true},
        });

        return new Schema({
            id: {type: ShortText, required: true},
            meta: {schema: metaSchema, required: true},
            final: {schema: model.schema, required: true},
            draft: {schema: model.schema, required: true},
        })
    }

    constructor({document, model} = {}){
        this.#schema = this.#buildSchema(model);

        const {valid, errors, sanitised} = this.#schema.validateDoc(document);

        if(!valid){
            throw new SchemaError(errors)
        }

        this.id = sanitised.id;
        this.meta = sanitised.meta;
        this.#draft = sanitised.draft;
        this.#final = sanitised.final;

    }

    get draft(){
        return this.#draft;
    }

    get final(){
        return this.#final;
    }

    updateDraft(draftFrag){
        const promise = new Promise((resolve, reject) => {
            const validateFragment = {
                draft: {
                    ...draftFrag
                }
            }

            const {
                valid,
                errors,
                sanitised
            } = this.#schema.validatePartial(validateFragment);

            if(!valid){
                reject(new SchemaError(errors))
            }

            const filter = {id: this.id}
            const docFrag = {
                $set: sanitised
            }

            QEditions.updateOne(filter, docFrag)
            .then(result => {
                this.#draft = sanitised.draft;
                resolve(this.#draft)
            })
            .catch(reject)
        });

        return promise;

    }

    async approveDraft(){
        const promise = new Promise((resolve, reject) => {
            const validateFragment = {
                final: {
                    ...this.#draft
                }
            }

            const {
                valid,
                errors,
                sanitised
            } = this.#schema.validatePartial(validateFragment);

            if(!valid){
                reject(new SchemaError(errors))
            }

            const filter = {id: this.id}
            const docFrag = {
                $set: sanitised
            }

            QEditions.updateOne(filter, docFrag)
            .then(result => {
                this.#final = sanitised.final;
                resolve(this.#final)
            })
            .catch(reject)
        })

        return promise
       

    }

    static async open({edition, model} = {}){

        const editionDocument = await QEditions.findOne({id: edition});

        if(!editionDocument){
            return new Error("ERROR_OPENING_EDITION")
        }


        return new Edition({
            document: editionDocument,
            model
        })

    }
}

module.exports = {Edition}