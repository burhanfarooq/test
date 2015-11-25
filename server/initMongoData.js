var db = db.getSiblingDB('customermanager');


//Settings
db.settings.remove({});
var r = { 'nextSeqNumber': 24, 'collectionName': "products" };
db.settings.insert(r);