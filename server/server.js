var express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    errorhandler = require('errorhandler'),
    csrf = require('csurf'),
    routes = require('./routes'),
    api = require('./routes/api'),
    DB = require('./accessDB'),
    protectJSON = require('./lib/protectJSON'),
    app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(session({ 
    secret: 'customermanagerstandard', 
    saveUninitialized: true,
    resave: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/../'));
app.use(errorhandler());
app.use(protectJSON);
app.use(csrf());

app.use(function (req, res, next) {
    var csrf = req.csrfToken();
    res.cookie('XSRF-TOKEN', csrf);
    res.locals._csrf = csrf;
    next();
})

process.on('uncaughtException', function (err) {
    if (err) console.log(err, err.stack);
});

//Local Connection 
var conn = 'mongodb://localhost/customermanager';
var db = new DB.startup(conn);

// Routes
app.get('/', routes.index);

// JSON API
var baseUrl = '/api/dataservice/';

app.get(baseUrl + 'Products', api.products);
app.get(baseUrl + 'Product/:id', api.product);
app.get(baseUrl + 'ProductById/:id', api.product);

app.post(baseUrl + 'PostProduct', api.addProduct);
app.put(baseUrl + 'PutProduct/:id', api.editProduct);
app.delete(baseUrl + 'DeleteProduct/:id', api.deleteProduct);

app.post(baseUrl + 'Login', api.login);
app.post(baseUrl + 'Logout', api.logout);


// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server

app.listen(3000, function () {
    console.log("CustMgr Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
