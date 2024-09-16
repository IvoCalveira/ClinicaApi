//import('mysql');
//REPOSITORIO BUENO
var mysql = require('mysql');

var conexion = mysql.createConnection({
    host: 'mysql.db.mdbgo.com',
    user: 'ivo_calveira_calveiraivo',
    password: 'Admin2024!**',
    database: 'ivo_calveira_clinica',
    port: 3306
});

function conectar(){
    conexion.connect(function(err){
        if(err) console.log(err);
        else
        console.log('conexion exitosa');
    })
}
//Actualmente usando la base de datos de la cuenta ivo_calveira pero el proyecto de ivo_calveira2
const pool = mysql.createPool({
    connectionLimit: 10, // Límite de conexiones en el pool
    host: 'mysql.db.mdbgo.com',
    user: 'ivo_calveira_calveiraivo',
    password: 'Admin2024!**',
    database: 'ivo_calveira_clinica',
    port: 3306
});
 exports.verificarUsuario = function (usuario, callback) {
     conectar()
     const sql = "SELECT * FROM usuario WHERE user = ? AND password = ? OR mail = ?";
     const values = [usuario.user, usuario.password, usuario.mail]
     conexion.query(sql, values, function (err, results){ 
         if (err) {
             return callback(err);
         }
         if (results.length > 0) {
             return callback(null, true); // Usuario y password ya existen
         } else {
             return callback(null, false); // Usuario y password no existen
         }
     });  
 };

exports.buscarPersonas= function(respuesta){
    conectar();
    conexion.query("SELECT DISTINCT * FROM usuario;", function(err, resultado, filas){
        if(err) throw err;
        console.log(resultado);
        respuesta(resultado);
    });
}

exports.buscarMedico= function(){
        conectar();
        return new Promise((resolve, reject) => {
        const consulta = "SELECT DISTINCT us.id_usuario, us.nombre, us.user, us.apellido, us.mail, us.tipo_usuario, us.foto_perfil, med.id_medico, med.especialidad, med.foto_especialidad, med.foto_especialidad, med.autorizado FROM usuario AS us, medico AS med WHERE us.id_usuario = med.id_usuario";
        
        conexion.query(consulta, (error, resultado) => {
            if (error) {
                return reject(error);
            }

        const resultadoProcesado = resultado.map(resultado => ({
            id_medico: resultado.id_medico,
            id_usuario: resultado.id_usuario,
            nombre: resultado.nombre,
            apellido: resultado.apellido,
            user:resultado.user,
            tipo_usuario: resultado.tipo_usuario,
            foto_perfil: resultado.foto_perfil,
            especialidad: resultado.especialidad,
            foto_especialidad: resultado.foto_especialidad,
            autorizado: resultado.autorizado,
        }));
        
        resolve(resultadoProcesado);
        });
    });  
};

exports.insertarPersona = function(usuario, retornar){
    // conectar();
    pool.getConnection(function (err, conexion) {
        if (err) {
            return retornar(err);
        }
    var sql = "INSERT INTO usuario (nombre, apellido, mail, fec_nac, user, password, tipo_usuario, foto_perfil) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    var values = [usuario.nombre, usuario.apellido, usuario.mail, usuario.nacimiento, usuario.user,usuario.password, usuario.tipo_usuario, usuario.foto_perfil];
    
    conexion.query(sql, values,
        function(err, resultado){
           if(err) throw err;
           console.log(resultado);
           if(usuario.tipo_usuario == 1){
            return retornar(resultado);
           }
           const idmedico = resultado.insertId;
           if(usuario.tipo_usuario == 2 || usuario.tipo_usuario == 3){
            //acá inserta en la tabla médicos
               var sql2 = "INSERT INTO medico (id_usuario, especialidad, foto_especialidad, autorizado) VALUES (?, ?, ?, ?)";
               var medico = [idmedico, usuario.especialidad, usuario.foto_especialidad, usuario.autorizado];
               conexion.query(sql2, medico,
                function(err, resultadomedico, filas){
                    if(err) throw err;
                    console.log(resultadomedico);
            //acá inserta en la tabla dias_habiles  
            
            
            const idhabiles = resultadomedico.insertId;
               if (usuario.tipo_usuario == 2){

               
                var sql3 = "INSERT INTO dias_habiles (id_medico, lunes, martes, miercoles, jueves, viernes, horas_desde, horas_hasta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                var dias = [idhabiles, usuario.dias_habiles[0], usuario.dias_habiles[1], usuario.dias_habiles[2], usuario.dias_habiles[3], usuario.dias_habiles[4], usuario.horario_desde, usuario.horario_hasta];
                conexion.query(sql3, dias,
                    function(err, resultadodias, filas){
                        if(err) throw err;
                        console.log(resultadodias);
                        
                        return retornar(resultadodias);
                        });
                    }
                    else {
                        return retornar(resultadomedico);
                    }
                });
            }
        });
    });
}


exports.borrarPersona = function(usuario, retornar){
    conectar();
    var sql = "DELETE from usuario WHERE user = ?";
    sql = sql + "'" + usuario.user + "'";

    conexion.query(sql,
        function(err, resultado, filas){
           if(err) throw err;
           console.log(resultado);
           
           retornar(resultado);
   
       } );
}

exports.AutorizacionUsuario = function(usuario, respuesta){
    conectar();

    const sql = "UPDATE medico SET autorizado = ? WHERE id_usuario = ? ;";
    const values = [usuario.autorizado, usuario.id_usuario];


    conexion.query(sql, values, function (err, resultado) {
        if(err) throw err;
        console.log(resultado);
       return respuesta(resultado);
    });
}

exports.buscarMedicosDisponibilidad = function() {
    conectar();

    return new Promise((resolve, reject) => {
        const query = `
             SELECT DISTINCT 
                m.id_medico, 
                u.nombre, 
                u.apellido, 
                u.foto_perfil,  
                m.especialidad, 
                d.lunes, 
                d.martes, 
                d.miercoles, 
                d.jueves, 
                d.viernes, 
                d.horas_desde, 
                d.horas_hasta 
            FROM 
                usuario AS u, 
                medico AS m, 
                dias_habiles AS d 
            WHERE 
                u.tipo_usuario = 2 
                AND m.autorizado = 1 
                AND m.id_medico = d.id_medico 
                AND u.id_usuario = m.id_usuario 
            ORDER BY 
                m.id_medico
        `;
       
        conexion.query(query, (error, results) => {
            if (error) {
                return reject(error);
            }
           
            // Procesar los resultados para incluir los días en un array
            const processedResults = results.map(result => ({
                id_medico: result.id_medico,
                nombre: result.nombre,
                apellido: result.apellido,
                foto_perfil: result.foto_perfil,
                especialidad: result.especialidad,
                dias_habiles: [
                    result.lunes,
                    result.martes,
                    result.miercoles,
                    result.jueves,
                    result.viernes
                ],
              horas_desde: result.horas_desde,
                horas_hasta: result.horas_hasta
           }));

           resolve(processedResults);
       });
    });
};

exports.nuevoTurno = function(usuario, respuesta){
    conectar();
      
      const sql = "INSERT into turnos (id_usuario, id_medico, hora ,fecha ,aceptado) VALUES (?,?,?,?,?);";
      const values = [usuario.id_usuario, resultado.idmedico, usuario.hora, usuario.fecha, usuario.aceptado];
  
      conexion.query(sql, values, function (err, resultado) {
         if(err) throw err;
        console.log(resultado);
         respuesta(resultado);
      });
   };
  
   exports.turnosTomados = function(){
      conectar();
  
      return new Promise((resolve, reject) => {
          conexion.query("SELECT * FROM turnos", (error,results) =>{
              if(error){
                 return reject;
              }
              resolve(results);   
         });
     });
     
   }