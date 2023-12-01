# MatterCX

MATTER
Matter.create({name, model, author}) > returns new Matter Instance
Matter.open(id) > returns new Matter Instance
  
const myMatter = Matter.open(id);
myMatter.createEdition({document, name = "New Edition", id = Date.now()}) > returns new Edition Instance
myMatter.edition(id) > returns new Edition instance matching id
myMatter.slot(name) > returns new Edition instance stored in slot name
 
 
 
MODEL
Model.open(id) > returns new Model instance
Model.create({id, schema}) > return new Model instance on success
 
const myModel = new Model({id, schema})
myModel.validateDoc(document) > returns {valid, errors, sanitised}
 
 
EDITION
Edition.open()
 
const myEdition = Edition.open({edition, model})
myEdition.final > returns JSON of final copy
myEdition.draft > returns JSON of draft copy
myEdition.updateDraft({draftFrag}) > Saves fragment of draft document to DB. Returns updated draft doc
myEdition.approveDraft() > Overwrites final with copy of draft








Notes:
    Model needs to serialise and deserialise when sharing with DB