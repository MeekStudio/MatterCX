const { Squid, ShortText } = require("@MeekStudio/DataTypesCX");
const { Matter, Model } = require("../index.js");




async function createModel(){
    Model.create({
        id: "Project",
        schema: {
            title: {type: ShortText, required: true, default: "Header"},
            subtitle: {type: ShortText, required: true, default: "Subheading"},
        }
    })
    .then(result => {
        console.log("Model.create:", result);
    }).catch(error => console.error(error));

}

async function createMatter(){
    Matter.create({
        name: "Paul",
        model: "Project",
        author: "me"
    })
    .then(result => console.log("Matter.create()", result)) 
    .then(error => console.error(error))
}

async function createEdition(){
    const Paul = await Matter.open({
        model: "Project",
        name: "Paul"
    })


    const defaultEdition = await Paul.createEdition({
        document: {
            title: "Paul",
            subtitle: "McCartney"
        },
        name: "Default Doc",
    })

    console.log("Project > Paul > Final:", defaultEdition.final);
    console.log("Project > Paul > Draft:", defaultEdition.draft);
}

async function openEdition(){
    const Paul = await Matter.open({
        model: "Project",
        name: "Paul"
    })

    console.log("Paul:", Paul);

    const defaultEdition = await Paul.slot("default");

    console.log("defaultEdition:", defaultEdition.draft)
}

//createModel();
//createMatter();
//createEdition();
openEdition();