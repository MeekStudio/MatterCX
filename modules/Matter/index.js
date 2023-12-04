const { ShortText, Stamp, Squid } = require("@MeekStudio/DataTypesCX");
const { Schema, SchemaError } = require("../Schema");
const { QMatter } = require("../Queries")
const { Model } = require("../Model")
const { Edition } = require("../Edition")

class Matter {

    static #metaSchema = new Schema({
        name: {type: ShortText, required: true},
        model: {type: ShortText, required: true},
        created: {type: Stamp, required: true, default: Date.now()},
        author: {type: ShortText, required: true},
        defaultSlot: {type: ShortText, required: true, default: "production"}
    });
    
    static #slotsSchema = new Schema({
        name: {type: ShortText, required: true},
        edition: {type: ShortText},
    });

    
    static #schema = new Schema({
        id: {type: Squid, required: true},
        meta: {schema: this.#metaSchema, required: true},
        slots: [{schema: this.#slotsSchema}],
        editions: [{type: ShortText}],
    });

    static validateDoc({id, meta, slots, editions}){
        return this.#schema.validateDoc({id, meta, slots, editions});
    }

    static async exists(name, model){
        const count = await QMatter.countDocuments({
            "meta.name": name,
            "meta.model": model,
        });

        return (count > 0)
    }

    constructor({id, meta, slots, editions, modelInstance} = {}){
        const {valid, errors, sanitised} = Matter.validateDoc({id, meta, slots, editions});

        if(!valid){
            throw new SchemaError(errors);
        }

        this.id = sanitised.id;
        this.meta = sanitised.meta;
        this.slots = sanitised.slots;
        this.editions = sanitised.editions || [];
        this.model = modelInstance;
    }

    static async create({model, author, name = `New ${model}`} = {}){
        // Work out how to do groups of Promises.
        const matterExists = await Matter.exists(name, model); 

        if(matterExists){
            return new Error(`MATTER_ALREADY_EXISTS (${model}/${name})`) 
        }

        const modelExists = await Model.exists(model); 

        if(!modelExists){
            return new Error("MODEL_DOESNT_EXIST") 
        }

        const promise = new Promise((resolve, reject) => {
            const document = {
                id: Squid.generate(),
                meta: {
                    name,
                    model,
                    author,
                    defaultSlot: "default"
                },
                slots: [{
                    name: "default",
                }],
                editions: [],
            }
    
            const {
                valid,
                errors,
                sanitised
            } = Matter.validateDoc(document);
    
            if(!valid){
                reject(new SchemaError(errors))
            }

            QMatter.insertOne(sanitised)
                .then(resolve)
                .catch(reject)

        });

        return promise;
    }

    createEdition({document, name = "New Edition", id = Squid.generate()} = {}){
        // Chek if Edition Exists
        const {valid, errors, sanitised} = this.model.validateDoc(document);
        
        if(!valid){
            throw new SchemaError(errors)
        }

        const promise = new Promise((resolve, reject) => {
            const editionDocument = {
                id,
                meta: {
                    name
                },
                final: sanitised,
                draft: sanitised,
            }

            const editionInstance = new Edition({
                document: editionDocument,
                model: this.model
            })

            

            QEditions.insertOne(editionDocument)
            .then(result => {
                this.registerEdition(id)
                .then(resolve(editionInstance))
                .catch(reject);

            })
            .catch(reject)
    
        })

        return promise

    }

    async registerEdition(edition){
        // Check if there is an edition in default slot, if not add this

        const docFrag = {
            $set: {
                editions: this.editions
            }
        }

        if(this.editions.length === 0){
            // First Edition, so also add to default slot
            const defaultSlot = this.meta.defaultSlot;

            this.slots.forEach((slot, index) => {
                if(slot.name === defaultSlot){
                    slot.edition = edition
                }
            });

            docFrag.$set.slots = this.slots;

        }

        this.editions.push(edition);

        const filter = {
            "meta.name": this.meta.name,
            "meta.model": this.meta.model,
        }

        

        return QMatter.updateOne(filter, docFrag);
    }

    edition(id){
        if(this.editions.indexOf(id) < 0) {
            throw Error(`Edition "${id}" doesn't exist.`)
        }

        return Edition.open({
            edition: id,
            model: this.model
        })
    }

    slot(name = this.meta.defaultSlot){
        const slot = this.slots.find(slot => slot.name === name);

        if(!slot){
            throw new Error(`Slot "${name}" doesn't exist`)
        }

        return Edition.open({
            edition: slot.edition,
            model: this.model
        });
    }

    static async open({id, name, model} = {}){
        const matter = await QMatter.findOne({
            "meta.name": name,
            "meta.model": model,
        });

        if(!matter){
            return new Error(`${model}/${name} DOESNT EXIST`)
        }

        const modelInstance = await Model.open(model);

        return new Matter({...matter, modelInstance});
        
    }
}

module.exports = { Matter }