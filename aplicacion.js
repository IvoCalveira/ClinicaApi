//de acá se va a db.js
var db = require('./db');
var jwt = require('jsonwebtoken');

exports.leer = function(usuario,res){

    db.buscarPersonas(datos => {
        res.json(validarusuario(datos, usuario))
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
    for (let i = 0; i < datos.length; i++) {
        console.log(datos[i]);
        let element = datos[i];
        if (element.user == usuario.user && element.password == usuario.password)
            {
                return jwt.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), data: element }, "superclave");
            }
        }
}

exports.insertar = function (usuario, res) {
     db.verificarUsuario(usuario, function(err, existe) {
     if (err) {
         return res.status(500).json({ error: 'Error en la base de datos' });
     }
     if (existe) {
         return res.status(400).json({ error: 'Usuario con el mismo usuario y password ya existe' });
     }
    db.insertarPersona(usuario, datos => { res.json(datos)});
 });
}

exports.borrar = function(usuario, res){

    db.borrarPersona( usuario, datos => {res.json(datos)});
    
}

exports.autorizacion = function(usuario,res){

    db.AutorizacionUsuario(usuario, datos => {
        res.json(datos);
    });

}

exports.turnos = async(req,res) =>{

    try {
        const data = await db.buscarMedicosDisponibilidad();
        res.json(data); // Enviar datos como JSON
      } catch (error) {
        res.status(500).json({ error: 'Error al obtener los datos' }); // Enviar error como JSON
      }

};

exports.buscarTurnos = async(req,res) =>{

    try {
        const data = await db.turnosTomados();
        res.json(data); // Enviar datos como JSON
      } catch (error) {
        res.status(500).json({ error: 'Error al obtener los datos' }); // Enviar error como JSON
      }

};

