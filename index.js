var express = require('express')
var cors = require('cors')
var aplicacion = require('./aplicacion')


var app = express();
// app.use(express.json());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors()); 

app.get('/prueba/', (req, res) => {

    res.send("hola mundo");

});

app.post('/login/', (req,res)  => {

    var usuario = req.body;

    aplicacion.leer(usuario, res);
    // if(usuario.usuario == res.usuario){
    //     res.json({login:'exitoso'});
    // } else {
    //     res.json({login:'fallo'});
    // }

    console.log(res);


});

app.post('/insertar', (req, res) => {

    var usuario = req.body;
    aplicacion.insertar(usuario, res);

})



app.post('/leer', (req,res)  => {


  
    //res.json(usuario.nombre);
    aplicacion.leerMedico(req, res);

});

app.delete('/borrar/', (req,res) => {

    var usuario = req.body;
    aplicacion.borrar(usuario, res);

})

app.post('/autorizar' , (req,res) => {

    var usuario = req.body;

    aplicacion.autorizacion(usuario,res);

});


app.listen(process.env.PORT || 3000, ()=> {

    console.log('escuchando el puerto');

});
