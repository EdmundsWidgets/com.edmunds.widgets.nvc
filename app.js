var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    url = require('url'),

    // carconfig
    carconfig = require('./routes/carconfig/carconfig'),
    carconfigAbout = require('./routes/carconfig/about'),
    carconfigLessApiV1 = require('./v1/routes/api/carconfig/less'),
    carconfigLessApi = require('./routes/api/carconfig/less'),



    masheryApi = require('./routes/api/mashery'),

    http = require('http'),
    path = require('path'),

    fs = require('fs'),
    ejs = require('ejs');

var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 2000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    // less
    app.use(require('less-middleware')({
        src: __dirname + '/src/less',
        dest: __dirname + '/public/css',
        prefix: '/css',
        compress: true
    }));
    // static resources
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/nvc', express.static(path.join(__dirname, 'edmunds/widgets/nvc/dist')));
    // bower components
    app.use('/libs', express.static(path.join(__dirname, 'bower_components')));
});

//app.use('/glance', express.static(path.join(__dirname, 'src/js/glance')));

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.get('/', routes.index);
// carconfig
app.get('/carconfig/v1', carconfig.carconfig);
app.get('/carconfig/v1/about', carconfigAbout.about);

app.post('/api/carconfig/less', carconfigLessApiV1.render);
app.get('/nvc/api/less', carconfigLessApi.render);

app.get('/api/keyvalidate', masheryApi.keyValidate);

app.get('/dealer/sendlead', masheryApi.sendLead);

app.get('/nvc/iframe', carconfig.iFrameContent);
app.get('/loader.js', function(req, res) {
    res.setHeader('Content-Type', 'text/javascript');
    res.render('loader', {
        baseUrl: req.protocol + '://' + req.headers.host
    });
});
    app.get('/nvc/example', function(req, res) {
    res.render('carconfig/example', {
        widgetLoaderUrl: req.protocol + '://' + req.headers.host + '/loader.js'
    });
});

app.get('/css/carconfig/*', function(req, res) {
    var fileName = __dirname + '/v1/public' + req.url;
    res.sendfile(fileName);
});

app.get('/js/carconfig/*', function(req, res) {
    var fileName = __dirname + '/v1/public' + req.url;
    res.sendfile(fileName);
});

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
