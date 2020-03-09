'use strict'

var validator = require('validator');
var Article = require('../models/article');
var fs = require('fs');
var path = require('path');

var controller = {

    //=======================================
    // ====== metodos de prueba ==============
    datosCurso: function(req, res){
        var hola = req.body.hola;
        return res.status(200).send({
            curos: 'Master en Frameworks de Js',
            autor: 'Alejandro Ruiz',
            url: 'google.com',
            hola
        });
    },

    test: function(req, res){
        return res.status(200).send({
            message : 'Soy la accion test de mi controlador de articulos'
        });
    },

    //==================================================
    //======= metodo post que guarda un articulo =======
    save:function(req, res){
        // Recoger parametros por post
        var params = req.body;

        // Validar datos(validator)
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        }catch(err){
            return res.status(500).send({
                status : 'error',
                message : 'faltan datos por enviar'
            });           
        }

        if(validate_title && validate_content){
            // Crear el objeto a guardar
            var article = new Article();

            // Asignar valores
            article.title = params.title;
            article.content = params.content;
            article.image = null;

            // Guardar el articulo 
            article.save( (err, articleStored) => {
                if(err || !articleStored){
                    return res.status(404).send({
                        status : 'error',
                        message : 'los datos no son validos !!!'
                    });
                }

                 // Devolver una respuesta
                return res.status(200).send({
                    status : 'success',
                    article : articleStored
                });

            });

        }else{
            return res.status(500).send({
                status : 'error',
                message : 'los datos no son validos !!!'
            });
        }
    },

    //=====================================================
    //======= metodo get que devuelve los articulos =======
    getArticles : function(req, res){
        var query = Article.find({});
        var last = req.params.last;

        if(last || last != undefined){
            query.limit(5);
        }

        query.sort('-_id').exec( (err , articles) => {
            if(err || !articles){
                return res.status(500).send({
                    status : 'error',
                    message : 'Error al devolver los articulos !!!'
                });
            }

            return res.status(200).send({
                status : 'success',
                articles
            });
        });
    },

    //=====================================================
    //======= metodo get que devuelve un articulo =======
    getArticle : function(req, res){

        // Recoger el id
        var articleId = req.params.id;

        // Comprobar que existe
        if(!articleId || articleId == null){
            return res.status(404).send({
                status : 'error',
                message : 'No existe el artículo !!!'
            });
        }

        // Buscar el artículo
        Article.findById(articleId, (err, article) => {
            if(err || !article){
                return res.status(404).send({
                    status : 'error',
                    message : 'No existe el artículo !!!'
                });
            }
             // Devolverlo en json
            return res.status(200).send({
                status : 'success',
                article
            });
        });
    },

    //=====================================================
    //======= metodo put que actualiza un articulo =======
    updateArticle : function(req,res){

        // Recoger el id del articulo  por la url
        var articleId = req.params.id;

        // Recoger los datos que llegan por put
        var params = req.body;

        // Validar los datos
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch(error){
            return res.status(500).send({
                status : 'error',
                message: 'Faltan datos por enviar'
            });
        }

        if(validate_title && validate_content){
            // Find and update
            Article.findOneAndUpdate({_id : articleId}, params, {new : true}, (err, articleUpdated) => {
                if(err || !articleUpdated){
                    return res.status(500).send({
                        status : 'error',
                        message: 'No existe el articulo!!!'
                    });
                }
                // Devolver una respuesta
                return res.status(200).send({
                    status : 'success',
                    articleUpdated
                });
            });
        }else{
            // Devolver una respuesta
            return res.status(500).send({
                status : 'error',
                message: 'La validación no es correcta !!!'
            });
        }
    },

    //=====================================================
    //======= metodo put que actualiza un articulo =======
    deleteArticle : function(req, res){

        // Recoger el id de la url
        var articleId = req.params.id;

        // Find and delete
        Article.findOneAndDelete({_id : articleId}, (err, articleRemove) => {
            if(err || !articleRemove){
                return res.status(500).send({
                    status : 'error',
                    message: 'No se ha podido eliminar el articulo !!!'
                });
            }else{
                //si el projecto existe comparamos que tenga imagen
                if(articleRemove.image != null){

                    //esta es la ruta del archivo
                    var path_file = './upload/articles/'+articleRemove.image;

                    //fs. es el filesistem
                    fs.unlink(path_file,(err) =>{
                        if(err) res.status(500).send({message: "Error al eliminar la imagen"});
                        
                         // Devolver una respuesta
                        return res.status(200).send({
                            status : 'success',
                            articleRemove
                        });
                      })
                }else{
                     // Devolver una respuesta
                    return res.status(200).send({
                        status : 'success',
                        articleRemove
                    });
                }
            }
        });
    },

    //===========================================================================
    //======= metodo post que actualiza un articulo y le añade una imagen =======
    uploadImage : function(req, res){

        // Configurar el modulo connect-multiparty router/article.js (Hecho)

        // Recoger el fichero de la peticion
        var fileName = 'Imagen no subida...';
        //===========================================================================
        //======= metodo post que actualiza un articulo y le añade una imagen =======

        if(!req.files){
            return res.status(404).send({
                status: 'error',
                message: fileName
            });
        }

        // Conseguir el nombre y la extensión del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('/');
        var fileName = file_split[2];
        var extension_split = fileName.split('\.');
        var fileExt = extension_split[1];

        // Comprobar la extensión, solo imagenes, si no es valida borrar el fichero
        if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){
            // Si todo es valido, sacamos el id
            var articleId = req.params.id;

            // Find and update
            Article.findOneAndUpdate({_id: articleId}, {image: fileName}, {new: true}, (err, articleUpdated) =>{
                if(err || !articleUpdated){
                    return res.status(500).send({
                        status : 'error',
                        message: 'No se pudo subir la imagen'
                    });
                }
                return res.status(200).send({
                    status: 'success',
                    articleUpdated
                });
            });
        }else{
            // Eliminar el archivo
            fs.unlink(file_path, (err) =>{
                return res.status(500).send({
                    status : 'error',
                    message: 'La extensión no es valida'
                });
            });
        }
    },

    //=============================================================
    //======= metodo get que devuelve la imagen un articulo =======
    getImage: function(req, res){
        var file = req.params.image;
        var file_path = './upload/articles/'+file;

        fs.exists(file_path, exists =>{
            if(exists){
                return res.status(200).sendFile(path.resolve(file_path));
            }else{
                return res.status(404).send({
                    status : 'error',
                    message: 'La imagen no existe '
                });
            }
        });
    },

    //========================================================
    //======= metodo get que devuelve lo que busquemos =======
    search : function(req, res){
        // Sacar el string a buscar 
        var searchString = req.params.search;
        
        // Find or
        Article.find({ "$or" : [
        {"$title": {"$regex": searchString, "$options": "i"}},
        {"$content": {"$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date', 'descending']])
        .exec((err, articles) =>{
            if(err){
                return res.status(500).send({
                    status : 'error',
                    message: 'Error en la petición'
                });
            }
            if(!articles || articles.length <= 0){
                return res.status(500).send({
                    status : 'error',
                    message: 'No hay articulos para mostrar'
                });
            }
            return res.status(200).send({
                status : 'success',
                articles
            });

        });
    }

}; // End Controles


// Aqui se exportan los controladores
module.exports = controller;