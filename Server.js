const express = require("express");
const session = require("express-session");
const mysql = require("mysql");
const ejs = require("ejs");
const multer = require("multer");
const url = require("url");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public")); // Agregamos la ruta public para obtener el index y los estilos

app.use(
  session({
    secret: "mi-secreto", // una cadena aleatoria que se utiliza para cifrar los datos de la sesión
    resave: false,
    saveUninitialized: true,
  })
);

// CONEXION
var con = mysql.createConnection({
  host: "localhost",
  user: "brian8",
  password: "brian",
  database: "anuario",
});

con.connect((err) => {
  if (err) {
    console.log("Error al conectarse a la base de datos:", err);
  } else {
    console.log("Conexión exitosa a la base de datos");
  }
});

app.set("view engine", "ejs");

//Configuracion multer para almacenar imagenes
const upload = multer({
  dest: "public/img",
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|JPG)$/)) {
      return cb(new Error("Solo se permiten archivos JPG"));
    }
    cb(null, true);
  }, // fin filefilter
}); // fin multer

//Mostrar alumnos
app.get("/Alumnos", (req, res) => {
  const user = req.session.user;
  const admin = req.session.admin;
  if (user) {
    con.query("SELECT * FROM alumnos", (error, rows) => {
      if (error) throw error;
      return res.render("User/Alumnos", { rows });
    });
  } else if (admin) {
    const query = "SELECT * FROM alumnos";

    con.query(query, (error, rows) => {
      if (error) throw error;
          return res.render("Admin/Alumnos", { rows }); 
    });
    
  } else{
    return res.redirect("/");
  }
});

//Mostrar Usuarios
app.get("/Usuarios", (req, res) => {
  const admin = req.session.admin;
   if (admin) {
    const query = "SELECT * FROM usuarios";

    con.query(query, (error, rows) => {
      if (error) throw error;
          return res.render("Admin/Usuarios", { rows }); 
    });
    
  } else{
    return res.redirect("/");
  }
});

//Mostrar Formulario Para Registrar o Actualizar Alumno
app.get("/RegistrarAlumno", (req, res) => {
  const admin = req.session.admin;
  if (admin) {
    const requestUrl = req.url;
    const parsedUrl = url.parse(requestUrl, true);
    const numControl = parsedUrl.query.numControl;
    let alumno = {};

    if (numControl) {
      const sql = `select * from alumnos where numControl = '${numControl}'`;
      con.query(sql, (error, registro) => {
        if (error) throw error;
        alumno = registro[0];

        return res.render("Admin/RegistrarAlumno", { alumno });
      });
    } else {
      return res.render("Admin/RegistrarAlumno", { alumno });
    }
  } else {
    return res.redirect("/");
  }
});

// Registrar o Actualizar Alumno
app.post("/RegistrarAlumno", upload.single("file"), (req, res) => {
  const admin = req.session.admin;
  if (admin) {
    let idNumControl = req.body.id;
    let numControl = req.body.numControl;
    let nombreCompleto = req.body.nombreCompleto;
    let Edad = req.body.Edad;
    let Telefono = req.body.Telefono;
    let Correo = req.body.Correo;
    let Carrera = req.body.Carrera;
    let Promedio = req.body.Promedio;
    let Imagen = req.file.filename;
    let habilidadesFortalezas = req.body.habilidadesFortalezas;
    let query1 = `UPDATE alumnos SET numControl = ${parseInt(
      numControl
    )}, nombreCompleto = '${nombreCompleto.toLowerCase()}', Edad = ${parseInt(
      Edad
    )}, Telefono = '${Telefono}', Correo = '${Correo}', Carrera = '${Carrera}', Promedio = ${parseFloat(
      Promedio
    )}, Imagen = '${Imagen}', habilidadesFortalezas = '${habilidadesFortalezas}' WHERE numControl = '${parseInt(
      numControl
    )}'`;
    let query2 = `INSERT INTO alumnos (numControl, nombreCompleto, Edad, Telefono, Correo, Carrera, Promedio, Imagen, habilidadesFortalezas) VALUES(${parseInt(
      numControl
    )},'${nombreCompleto.toLowerCase()}',${parseInt(
      Edad
    )},'${Telefono}','${Correo}','${Carrera}',${parseFloat(
      Promedio
    )}, '${Imagen}' ,'${habilidadesFortalezas}')`;
    let query = idNumControl ? query1 : query2;

    con.query(query, function (err, result) {
      if (err) throw err;
      console.log(
        "Alumno Creado o Actualizado Correctamente" + result.affectedRows
      ); //result.affectedRows
      return res.redirect("Alumnos");
    });
  } else {
    return res.redirect("/");
  }
});

//Mostrar proyectos
app.get("/Proyectos", (req, res) => {
  const user = req.session.user;
  const admin = req.session.admin;
  if (user) {
    con.query("SELECT * FROM proyectos", (error, rows) => {
      if (error) throw error;
      return res.render("User/Proyectos", { rows });
    });
  } else if (admin) {
    const query = "SELECT * FROM proyectos";

    con.query(query, (error, rows) => {
      if (error) throw error;
          return res.render("Admin/Proyectos", { rows }); 
    });
  } else{
    return res.redirect("/");
  }
});

//Mostrar Formulario para Registrar o Actualizar Proyecto
app.get("/RegistrarProyecto", (req, res) => {
  const admin = req.session.admin;
  if (admin) {
    const requestUrl = req.url;
    const parsedUrl = url.parse(requestUrl, true);
    const id = parsedUrl.query.id;
    let proyecto = {};
    let alumnos = {};

    if (id) {
      const sql = `select * from proyectos where Id = '${id}'`;
      const sql2 = "SELECT numControl,nombreCompleto FROM alumnos";
      con.query(sql, (error, registro) => {
        if (error) throw error;
        proyecto = registro[0];
        con.query(sql2, (error, registro2) => {
          if (error) throw error;
          alumnos = registro2;
          return res.render("Admin/RegistrarProyecto", { proyecto, alumnos });
        });
      });
    } else {
      const sql = "SELECT numControl,nombreCompleto FROM alumnos";
      con.query(sql, (error, registros) => {
        if (error) throw error;
        alumnos = registros;
        return res.render("Admin/RegistrarProyecto", { proyecto, alumnos });
      });
    }
  } else {
    return res.redirect("/");
  }
});

// Registrar o Actualizar Proyecto
app.post("/RegistrarProyecto", upload.single("file"), (req, res) => {
  const admin = req.session.admin;
  if (admin) {
    let idProyecto = req.body.id;
    let Nombre = req.body.Nombre;
    let Autor = req.body.Autor;
    let Imagen = req.file.filename;
    let Descripcion = req.body.Descripcion;
    let query1 = `UPDATE proyectos SET Nombre = '${Nombre.toLowerCase()}', Autor = ${Autor}, Imagen = '${Imagen}', Descripcion = '${Descripcion}' WHERE Id = '${parseInt(
      idProyecto
    )}'`;
    let query2 = `INSERT INTO proyectos (Nombre, Autor, Imagen, Descripcion) VALUES('${Nombre.toLowerCase()}',${Autor},'${Imagen}','${Descripcion}')`;
    let query = idProyecto ? query1 : query2;
    con.query(query, function (err, result) {
      if (err) throw err;
      console.log(
        "Proyecto Insertado o Actualizado Correctamente" + result.affectedRows
      ); //result.affectedRows
      return res.redirect("Proyectos");
    });
  } else {
    return res.redirect("/");
  }
});

//Mostrar Formulario para Registrar o Actualizar Usuario
app.get("/RegistrarUsuario", (req, res) => {
  const admin = req.session.admin;
  if (admin) {
    const requestUrl = req.url;
    const parsedUrl = url.parse(requestUrl, true);
    const id = parsedUrl.query.id;
    let usuario = {};

    if (id) {
      const sql = `select * from usuarios where id = '${id}'`;
      con.query(sql, (error, registro) => {
        if (error) throw error;
        usuario = registro[0];
        return res.render("Admin/RegistrarUsuario", { usuario });
      });
    } else {
      return res.render("Admin/RegistrarUsuario", { usuario });
    }
  } else {
    return res.redirect("/");
  }
});
// Registrar o Actualizar Usuario
app.post("/RegistrarUsuario", (req, res) => {
  const admin = req.session.admin;
  if (admin) {
    let id = req.body.id;
    let Correo = req.body.correo;
    let Contraseña = req.body.contraseña;
    let Tipo = req.body.tipo;
    let query1 = `UPDATE usuarios SET Correo = '${Correo}', Contraseña = '${Contraseña}', Admin = ${parseInt(
      Tipo
    )} WHERE id = '${parseInt(id)}'`;
    let query2 = `INSERT INTO usuarios (Correo, Contraseña, Admin) VALUES('${Correo}','${Contraseña}',${parseInt(
      Tipo
    )})`;
    let query = id ? query1 : query2;

    con.query(query, function (err, result) {
      if (err) throw err;
      console.log(
        "Usuario Insertado o Actualizado Correctamente" + result.affectedRows
      ); //result.affectedRows
      return res.redirect("Usuarios");
    });
  } else {
    return res.redirect("/");
  }
});

//Mostrar Pagina de Inicio del Usuario
app.get("/Inicio", (req, res) => {
  const user = req.session.user;
  const admin = req.session.admin;
  if (user) {
    return res.render("User/Inicio");
  } else if (admin) {
    return res.render("Admin/Inicio");
  } else {
    return res.redirect("/");
  }
});

app.get("/Cerrar", (req, res) => {
  if (req.session.admin) req.session.admin = false;
  if (req.session.user) req.session.user = false;
  return res.redirect("/");
});

// Validar Login de Administración
app.post("/Login", (req, res) => {
  const { Correo, Contraseña } = req.body;

  let sql = `select * from usuarios where Correo = '${Correo}' and Contraseña = '${Contraseña}'`;
  con.query(sql, (err, rows) => {
    if (err) {
      console.log("Error al ejecutar la consulta:", err);
      res.send("Ha ocurrido un error al intentar iniciar sesión");
    } else if (rows.length === 0) {
      res.send("Usuario o contraseña incorrectos");
    } else {
      const user = rows[0];
      if (user.Admin) {
        req.session.admin = true;
        // Si el usuario es administrador, redirigirlo a la página de administración
        res.redirect("Inicio");
      } else {
        req.session.user = true;
        // Si el usuario no es administrador, redirigirlo a la página de inicio
        res.redirect("Inicio");
      }
    }
  });
});
//Eliminar Alumno o Proyecto
app.post("/eliminar", (req, res) => {
  const admin = req.session.admin;
  if (admin) {
    let numControl = req.body.numControl;
    let id = req.body.id;
    let tipo = req.body.tipo;
    let query1 = `delete from alumnos where numControl = '${numControl}'`;
    let query2 = `delete from proyectos where Id = '${id}'`;
    let query3 = `delete from usuarios where id = '${id}'`;
    let query = tipo === "alumno" ? query1 : tipo === "proyecto" ? query2 : query3;
    let redirect = tipo === "alumno" ? 'Alumnos' : tipo === "proyecto" ? 'Proyectos' : 'Usuarios';
    con.query(query, (error, result) => {
      if (error) throw error;
      return res.redirect(redirect);
    });
  } else {
    return res.redirect("/");
  }
});

//Buscar Alumno o Proyecto
app.post("/Search", (req, res) => {
  const user = req.session.user;
  if (user) {
    let search = req.body.search;
    let tipo = req.body.tipo;
    let query1 = `SELECT * FROM alumnos WHERE nombreCompleto LIKE '%${search}%' OR numControl LIKE '%${search}%'`;
    let query2 = `SELECT * FROM proyectos WHERE Nombre LIKE '%${search}%' OR Autor LIKE '%${search}%'`;
    let query = tipo === "alumnos" ? query1 : query2;
    let render = tipo === "alumnos" ? "User/Alumnos" : "User/Proyectos";
    
    con.query(query, (error, rows) => {
      if (error) throw error;
      return res.render(render, { rows });
    });
  } else {
    return res.redirect("/");
  }
});

app.listen(4000, function () {
  return console.log("Servidor en linea en puerto 4000");
});
