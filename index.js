const { query } = require("express");
const express = require("express");
const app = express();
PORT = 5000;
const db = require("./connection/db")
const isLogin = true;
const project = []
const month=["Januari","Febuary","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];


// db.connect((error, _, done) =>{
//     if (error) throw error
//     console.log("Database berhasil terhubung")
//     done()
// })



app.set("view engine","hbs");
app.use("/public", express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));

app.get("/",(req, res) =>{
    db.connect((error, client, done) =>{
        if (error) throw error
        
        const query = 'SELECT * FROM tb_project'

        client.query(query,(error,result) =>{


            const dbProject = result.rows;

            const newPro = dbProject.map((data) => {
                data.isLogin = isLogin
                data.duration = diff(data["start"],data["end"])
                return data;
            })
            console.log(newPro)
            res.render("index", {  isLogin, project:newPro})
        done()
    })
    
    
    
    });

    
});

app.get("/project/:id",(req, res) =>{
    const id = req.params.id

    db.connect((error, client, done) =>{
            if (error) throw error;

            const query =` SELECT * FROM tb_project WHERE id =${id}`;

            client.query(query,(error,result) =>{
                if (error) throw error;

                const dbProject = result.rows[0];

                dbProject.duration = diff(dbProject["start"],dbProject["end"]);
                dbProject.start = startend(dbProject.start);
                dbProject.end = startend(dbProject.end);

                

                console.log(dbProject)
                res.render("detail-project", {project: dbProject})
            })
            done()
        })

  
});

app.get("/contact",(req, res) =>{
    res.render("contact-form")
});

app.get("/addproject",(req, res) =>{
    res.render("add-project")

});

app.post("/addproject",(req, res) =>{

    const title = req.body.title;
    const start = req.body.start;
    const end = req.body.end;
    const content = req.body.content;
    const technologies = [];

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

        const query =` INSERT INTO tb_project(title, start, "end", content, technologies) VALUES ('${title}','${start}','${end}','${content}',ARRAY ['${technologies[0]}','${technologies[1]}','${technologies[2]}','${technologies[3]}'])`;

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


            console.log(dbProject)
            res.render("update-project", {project: dbProject,id})
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

app.listen(PORT, () => {
    console.log(`Server on PORT:${PORT}`)
})







function tech (item){

    if (item.html){
        tech.html = true
    }

    if (item.css){
        tech.css = true
    }

    if (item.js){
        tech.js = true
    }

    if (item.java){
        tech.java = true
    }
  
}



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

