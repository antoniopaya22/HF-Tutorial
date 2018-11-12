/**
 *     _    _ ______   _______ _    _ _______ ____  _____  _____          _      
 *    | |  | |  ____| |__   __| |  | |__   __/ __ \|  __ \|_   _|   /\   | |     
 *    | |__| | |__       | |  | |  | |  | | | |  | | |__) | | |    /  \  | |     
 *    |  __  |  __|      | |  | |  | |  | | | |  | |  _  /  | |   / /\ \ | |     
 *    | |  | | |         | |  | |__| |  | | | |__| | | \ \ _| |_ / ____ \| |____ 
 *    |_|  |_|_|         |_|   \____/   |_|  \____/|_|  \_\_____/_/    \_\______|                                                                           
 *
 *    ===========================================================================
 *    Aplicacion realizada en NodeJS que se conecta con una red Hyperledger Fabric
 *    ======================
 *    @author Antonio Paya
 *
 */

//==========MODULOS===============
var express = require('express');
var app = express();
var swig = require('swig');
var bodyParser = require('body-parser');
var rest = require('request');
var jwt = require('jsonwebtoken');
var log4js = require('log4js');
log4js.configure({
    appenders: { cheese: { type: 'file', filename: 'hftutorial.log' } },
    categories: { default: { appenders: ['cheese'], level: 'all' } }
});

//==========VARIABLES===============
app.set('port', 8081);
app.set('rest',rest);
app.set('jwt', jwt);
app.set('logger', log4js.getLogger('hftutorial'));

//==========INICIACION=============
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(fileUpload());


//==========RUTAS================

require("./routes/rapilaptop.js")(app, swig);


app.get('/', function (req, res) {
    res.redirect("/home");
});


//=========ERRORES==============
app.use(function (err, req, res, next) {
    console.log("Error producido: " + err);
    if (!res.headersSent) {
        res.status(400);
        var respuesta = swig.renderFile('views/error.html', {
            error: "Error 400",
            mensaje: err
        });
        res.send(respuesta);
    }
});

app.get('*', function(req, res){
    var respuesta = swig.renderFile('views/error.html', {
        error: "Error 404 Page not found",
        mensaje: "La página "+req.url+" no existe"
    });
    res.status(404);
    res.send(respuesta);
});


//===========RUN===============
// Lanza el servidor
app.listen(app.get('port'), function() {
    console.log("Autor: Antonio Paya Gonzalez");
    console.log("Servidor activo en el puerto: 8081");
});
