// Module dependencies
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , Product = require('./models/product')
  , util = require('util');

// connect to database
module.exports = {
    // Define class variable
    myEventID: null,

    // initialize DB
    startup: function (dbToUse) {
        mongoose.connect(dbToUse);
        // Check connection to mongoDB
        mongoose.connection.on('open', function () {
            console.log('We have connected to mongodb');
        });

    },

    // disconnect from database
    closeDB: function () {
        mongoose.disconnect();
    },

    // get all the products
    getProducts: function (skip, top, callback) {
        console.log('*** accessDB.getProducts');
        Product.count(function(err, custsCount) {
            var count = custsCount;
            console.log('Products count: ' + count);

            Product.find({}, { '_id': 0, 'name': 1, 'description': 1, 'price': 1,'id': 1 })
                /*
                //This stopped working (not sure if it's a mongo or mongoose change) so doing 2 queries now
                function (err, products) {
                    console.log('Products count: ' + products.length);
                    count = products.length;
                })*/
            .skip(skip)
            .limit(top)
            .exec(function (err, products) {
                callback(null, {
                    count: count,
                    products: products
                });
            });

        });
    },

    // get the product summary
    getProductsSummary: function (skip, top, callback) {
        console.log('*** accessDB.getProductsSummary');
        Product.count(function(err, custsCount) {
            var count = custsCount;
            console.log('Products count: ' + count);

            Product.find({}, { '_id': 0, 'name': 1, 'description': 1, 'price': 1, 'id': 1 })
            /*
            //This stopped working (not sure if it's a mongo or mongoose change) so doing 2 queries now
            function (err, productsSummary) {
                console.log('Products Summary count: ' + productsSummary.length);
                count = productsSummary.length;
            })
            */
            .skip(skip)
            .limit(top)
            .exec(function (err, productsSummary) {
                callback(null, {
                    count: count,
                    productsSummary: productsSummary
                });
            });

        });
    },

    // get a  product
    getProduct: function (id, callback) {
        console.log('*** accessDB.getProduct');
        Product.find({ 'id': id }, {}, function (err, product) {
            callback(null, product[0]);
        });
    },

    // insert a  product
    insertProduct: function (req_body, callback) {
        console.log('*** accessDB.insertProduct');

        var product = new Product();
        

        product.name = req_body.name;
        product.description = req_body.description;        
        product.price = req_body.price;        
        product.id = 1; // The id is calculated by the Mongoose pre 'save'.

        product.save(function (err, product) {
            if (err) { console.log('*** new product save err: ' + err); return callback(err); }

            callback(null, product.id);
        });
    },

    editProduct: function (id, req_body, callback) {
        console.log('*** accessDB.editProduct');

        

        Product.findOne({ 'id': id }, { '_id': 1, 'name': 1, 'description': 1, 'price': 1, 'id': 1 }, function (err, product) {
            if (err) { return callback(err); }

            product.name = req_body.name || product.name;
            product.description = req_body.description || product.description;
            product.price = req_body.price || product.price;


            product.save(function (err) {
                if (err) { console.log('*** accessDB.editProduct err: ' + err); return callback(err); }

                callback(null);
            });

        });
    },

    // delete a product
    deleteProduct: function (id, callback) {
        console.log('*** accessDB.deleteProduct');
        Product.remove({ 'id': id }, function (err, product) {
            callback(null);
        });
    },

    // get a  product's email
    checkUnique: function (id, property, value, callback) {
        console.log('*** accessDB.checkUnique');
        console.log(id + ' ' + value)
        switch (property) {
            case 'email':
                Product.findOne({ 'email': value, 'id': { $ne: id} })
                        .select('email')
                        .exec(function (err, product) {
                            console.log(product)
                            var status = (product) ? false : true;
                            callback(null, {status: status});
                        });
                break;
        }

    }


}
