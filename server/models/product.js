var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;


var SettingsSchema = new Schema({
    collectionName: {
        type: String, required: true, trim: true, default: 'products'
    },
    nextSeqNumber: {
        type: Number, default: 1
    }
});


var ProductSchema = new Schema({
    name: {
        type: String, required: true, trim: true
    },
    description: {
        type: String, required: true, trim: true
    },
    price: {
        type: Number, required: true
    },
    id: {
        type: Number, required: true
    }

});

ProductSchema.index({ id: 1, type: 1 }); // schema level

// I make sure this is the last pre-save middleware (just in case)
var Settings = mongoose.model('settings', SettingsSchema);

ProductSchema.pre('save', function (next) {
    var doc = this;
    // Calculate the next id on new Customers only.
    if (this.isNew) {
        Settings.findOneAndUpdate({ "collectionName": "products" }, { $inc: { nextSeqNumber: 1 } }, function (err, settings) {
            if (err) next(err);
            doc.id = settings.nextSeqNumber - 1; // substract 1 because I need the 'current' sequence number, not the next
            next();
        });
    } else {
        next();
    }
});

exports.ProductSchema = ProductSchema;
module.exports = mongoose.model('Product', ProductSchema);
