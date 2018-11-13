'use strict';
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
var bodyParser = require('body-parser');
var rest = require('request');
var RedFabric = require('./redFabric.js');

//==========VARIABLES===============
app.set('port', 8081);
app.set('rest',rest);
const redFabric = new RedFabric('admin');

//==========INICIACION=============
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

//==========RUTAS================

require("./routes.js")(app, redFabric);

//===========RUN===============
// Lanza el servidor
app.listen(app.get('port'), function() {
    console.log("Autor: Antonio Paya Gonzalez");
    console.log("Servidor activo en el puerto: 8081");
});
