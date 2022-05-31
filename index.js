const express = require("express");
const bcrypt = require("bcryptjs")
const session = require("express-session")
const flash = require("express-flash")
const app = express();
PORT = 5000;
const db = require("./connection/db");
const upload = require("./middlewares/uploadFile")
const { password } = require("pg/lib/defaults");
const isLogin = false;
const project = []
const month=["Januari","Febuary","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

app.set("view engine","hbs");
app.use("/public", express.static(__dirname + "/public"));
app.use("/upload", express.static(__dirname + "/upload"));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: "rahasia",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 2}
                }))
app.use(flash())

app.get("/",(req, res) =>{
    // console.log(req.session)
    db.connect((error, client, done) =>{
        if (error) throw error

        let query = ""

        if(req.session.isLogin == true){
            query = `SELECT  tb_project.*, tb_user.id as "user_id" , tb_user.name,email
            FROM tb_project
            LEFT JOIN tb_user
            ON tb_project.author_id = tb_user.id
            WHERE tb_project.author_id = ${req.session.user.id}
            ORDER BY tb_project.id DESC`
        }else{
            query = `SELECT  tb_project.*, tb_user.id as "user_id" , tb_user.name,email
            FROM tb_project
            LEFT JOIN tb_user
            ON tb_project.author_id = tb_user.id
            ORDER BY tb_project.id DESC`
        }

        client.query(query,(error,result) =>{


            const dbProject = result.rows;

            const newPro = dbProject.map((data) => {
                data.isLogin = req.session.isLogin;
                data.duration = diff(data["start"],data["end"]);
                data.name = data.name ? data.name : "Anonim";
                data.image = data.image ? "/upload/" + data.image : "/public/assets/download.jpg"
                return data;
            })
            console.log(newPro)
            res.render("index", {   isLogin: req.session.isLogin,
                                    user: req.session.user
                                    ,project:newPro})
        done()
    })
    
    
    
    });

    
});

app.get("/project/:id",(req, res) =>{
    const id = req.params.id

    db.connect((error, client, done) =>{
            if (error) throw error;

            const query = `SELECT  tb_project.*, tb_user.id as "user_id" , tb_user.name,email
                            FROM tb_project
                            LEFT JOIN tb_user
                            ON tb_project.author_id = tb_user.id
                            WHERE tb_project.id =${id}`;
                            

            client.query(query,(error,result) =>{
                if (error) throw error;

                const dbProject = result.rows[0];

                dbProject.duration = diff(dbProject["start"],dbProject["end"]);
                dbProject.start = startend(dbProject.start);
                dbProject.end = startend(dbProject.end);
                dbProject.image = dbProject.image ? "/upload/" + dbProject.image : "/public/assets/download.jpg"

                console.log(dbProject)
                res.render("detail-project", { isLogin: req.session.isLogin,user: req.session.user ,project: dbProject})
            })
            done()
        })

  
});

app.get("/contact",(req, res) =>{
    res.render("contact-form",{isLogin: req.session.isLogin,user: req.session.user})
});

app.get("/addproject",(req, res) =>{
    res.render("add-project" ,{isLogin: req.session.isLogin,user: req.session.user })

});

app.post("/addproject", upload.single('image'), (req, res) =>{

    const title = req.body.title;
    const start = req.body.start;
    const end = req.body.end;
    const content = req.body.content;
    const technologies = [];
    const userId = req.session.user.id;
    const fileName = req.file.filename

    if (req.body.html) {
        technologies.push('html');
    } else {
        technologies.push('')
    }
    if (req.body.css) {
        technologies.push('css');
    } else {
        technologies.push('')
    }
    if (req.body.js) {
        technologies.push('js');
    } else {
        technologies.push('')
    }
    if (req.body.java) {
        technologies.push('java');
    } else {
        technologies.push('')
    }
    

    db.connect((error, client, done) =>{
        if (error) throw error;

        const query =` INSERT INTO tb_project(title, start, "end", content, technologies , author_id, image) 
                        VALUES ('${title}','${start}','${end}','${content}',ARRAY ['${technologies[0]}','${technologies[1]}',
                                '${technologies[2]}','${technologies[3]}'],${userId},'${fileName}')`;

        client.query(query,(error,result) =>{
            if (error) throw error;
            result.duration = diff(result["start"],result["end"])
            res.redirect("/")
        })
        done()
    })


});

app.get("/delete-project/:id", (req, res) => {
    const id = req.params.id;

    db.connect((error, client, done) =>{
        if (error) throw error;

        const query =`DELETE FROM tb_project WHERE id = ${id};`;

        client.query(query,(error,result) =>{
            if (error) throw error;
            res.redirect("/");
        })
        done()
    })
  
  });

app.get("/update-project/:id", (req, res) =>{
    const id = req.params.id
    db.connect((error, client, done) =>{
        if (error) throw error;

        const query =` SELECT * FROM tb_project WHERE id =${id}`;

        client.query(query,(error,result) =>{
            if (error) throw error;

            const dbProject = result.rows[0];

            dbProject.start = startend1(dbProject.start);
            dbProject.end = startend1(dbProject.end);
            dbProject.duration = diff(dbProject["start"],dbProject["end"]);
            dbProject.image = dbProject.image ? "/upload/" + dbProject.image : "/public/assets/download.jpg"


            // console.log(dbProject)
            res.render("update-project", {isLogin: req.session.isLogin, user: req.session.user , project: dbProject,id})
        })
        done()
    })

})

app.post("/update-project/:id", (req, res) =>{
    const id = req.params.id
    const title = req.body.title;
    const start = req.body.start;
    const end = req.body.end;
    const content = req.body.content;
    const technologies = []

    if (req.body.html) {
        technologies.push('html');
    } else {
        technologies.push('')
    }
    if (req.body.css) {
        technologies.push('css');
    } else {
        technologies.push('')
    }
    if (req.body.js) {
        technologies.push('js');
    } else {
        technologies.push('')
    }
    if (req.body.java) {
        technologies.push('java');
    } else {
        technologies.push('')
    }

    db.connect((error, client, done) =>{
        if (error) throw error;

        const query =` UPDATE tb_project SET title='${title}' , start='${start}' , "end"='${end}' , content='${content}' , technologies = ARRAY['${technologies[0]}','${technologies[1]}','${technologies[2]}','${technologies[3]}'] WHERE id = ${id};`;

        client.query(query,(error,result) =>{
            if (error) throw error;
            result.duration = diff(result["start"],result["end"])
            res.redirect("/")
    })
        done()
    })
})

app.get("/register", (req, res ) => {

    res.render("register",{isLogin: req.session.isLogin,user: req.session.user })
})

app.post("/register", (req, res ) => {
    const name = req.body.name
    const email = req.body.email
    let  password = req.body.password

    password = bcrypt.hashSync(password, 10)

    db.connect((error, client, done) =>{
        if (error) throw error;

        const query =` INSERT INTO tb_user (name, email, password) VALUES ('${name}','${email}','${password}')`;

        client.query(query,(error,result) =>{
            if (error) throw error;
            
            if (error) {
            res.redirect("/register")
            } else {
                res.redirect("/login")
            }
    })
        done()
    })

})

app.get("/login", (req, res ) => {

    res.render("login",{isLogin: req.session.isLogin,user: req.session.user })
})

app.post("/login", (req, res ) => {
    const email = req.body.email
    let  password = req.body.password

        if (email == "" || password == "" ){
        req.flash("warning","Tolong Isi Semua Form")
        return res.redirect("/login")
        }


    db.connect((error, client, done) =>{
        if (error) throw error;

        const query =`SELECT * FROM tb_user WHERE email = '${email}'`;

        client.query(query,(error,result) =>{
            if (error) throw error;

            const data = result.rows

            if (data.length == 0 ) {
                req.flash("error","Email Anda Salah")
                    return res.redirect("/login")
            }


            const Match = bcrypt.compareSync(password,data[0].password)

            if (Match == false ) {
                req.flash("error","Password Anda Salah")
                    return res.redirect("/login")
            }
            
            req.session.isLogin = true;
            req.session.user = {
                id :data[0].id,
                email :data[0].email,
                name :data[0].name
            }
            res.redirect("/")
        })
        done()
    })
})

app.get("/logout", (req, res ) => {

    req.session.destroy()

    res.redirect("/")
})

app.listen(PORT, () => {
    console.log(`Server on PORT:${PORT}`)
})


function diff (date1,date2){
    date1 = new Date (date1);
    date2 = new Date ( date2 );
    const date1utc = Date.UTC(date1.getFullYear(),date1.getMonth(),date1.getDate())
    const date2utc = Date.UTC(date2.getFullYear(),date2.getMonth(),date2.getDate())

    day = 1000*60*60*24;
    dif =(date2utc - date1utc)/day;
  return dif < 30 ? dif +" hari" : parseInt(dif/30)+" bulan"
}

function startend(start,end){
    start = new Date (start);
    end = new Date (end);
    return `${start.getDate()}  ${month[start.getMonth()]}  ${start.getFullYear()}`
}

function startend1(start,end){
    start = new Date (start);
    end = new Date (end);
    return `${start.getDate()} / ${[start.getMonth()]} / ${start.getFullYear()}`
}



