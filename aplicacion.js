//de acá se va a db.js
var db = require('./db');

exports.leer = function(usuario,res){

    db.buscarPersonas(datos => {
        res.json(validarusuario(datos,usuario))
    } );

}

exports.leerMedico = async (req, res)  => { 
    try {
        const data = await db.buscarMedico();
        res.json(data);
        
      } catch (error) {
        res.status(500).json({ error: 'Error al obtener los datos' }); // Enviar error como JSON
      }
   
}

function validarusuario(datos, usuario) {
    for (i = 0; i < datos.length; i++) {
        element = datos[i];
        if (element.user == usuario.user && element.password == usuario.password)
            return element;

    };

    return null;

}

exports.insertar = function (usuario, res) {

    db.insertarPersona(usuario, datos => { res.json(datos) });

}

exports.borrar = function(usuario, res){

    db.borrarPersona( usuario, datos => {res.json(datos)});
    
}

