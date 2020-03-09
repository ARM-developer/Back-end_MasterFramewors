'use strict'
////////////////////////////////////////////////////
// Cargar modulos de node para crear el servidor
var express = require('express');
var bodyParser = require('body-parser');


////////////////////////////
// Ejecutar Express(http)
var app = express();

////////////////////////
// Cargar ficheros rutas
var article_routes = require('./routes/article');

///////////////////
// Middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//////////////////
// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

///////////////////////////////
// Añadir prefijos a las rutas
app.use('/api', article_routes);

////////////////////////////
/* Ruta o metodo de prueba 
app.post('/datos-curso', (req, res) => {
    return res.status(200).send({
        curos: 'Master en Frameworks de Js',
        autor: 'Alejandro Ruiz',
        url: 'google.com',
        hola
    });
}); */

////////////////////////////////////
// Exportar modulo (fichero actual)
module.exports = app;