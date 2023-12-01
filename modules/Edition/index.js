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
        const docFrag = {
            draft: {
                ...draftFrag
            }
        }

        const {
            valid,
            errors,
            sanitised
        } = this.#schema.validatePartial(docFrag);

        if(valid){
            console.log("SAVE TO MONGO", sanitised);
            // resultAfterUpdate = collection.findOneAndUpdate(filter, update, { returnDocument: 'after' });
            // returnDocument contains the updated document, so I can ...
            // this.#draft = resultAfterUpdate.value
            
        } else {
            throw new SchemaError(errors)
        }
    }

    approveDraft(){
        // Validate Draft as Final
        const docFrag = {
            final: {
                ...this.#draft
            }
        }

        const {
            valid,
            errors,
            sanitised
        } = this.#schema.validatePartial(docFrag);

        if(valid){
            console.log("SAVE TO MONGO", sanitised);
            // resultAfterUpdate = collection.findOneAndUpdate(filter, update, { returnDocument: 'after' });
            // returnDocument contains the updated document, so I can ...
            // this.#final = resultAfterUpdate.value

            
        } else {
            throw new SchemaError(errors)
        }

        return this.#final

    }

    

    

    static async open({edition, model} = {}){

        console.log("OPEN", {edition, model});

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