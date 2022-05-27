const express = require("express");
const app = express();
PORT = 5000;
const isLogin = true;
const project = []
const month=["Januari","Febuary","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

app.set("view engine","hbs");
app.use("/public", express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));

app.get("/",(req, res) =>{
    console.log(project)
    res.render("index", {  isLogin, project})
    
});


app.get("/project/:index",(req, res) =>{
    const index = req.params.index
    const projects = project[index]

    res.render("detail-project", {isLogin, projects})
  
    console.log(projects)
});

app.get("/contact",(req, res) =>{
    res.render("contact-form")
});

app.get("/addproject",(req, res) =>{
    res.render("add-project")

});

app.post("/addproject",(req, res) =>{

    const data = req.body;
    data.duration = diff(data["start"],data["end"])
    data.isLogin = isLogin

    const addpro = project.map((technologies) =>{
        req.body.data
        return technologies
    })

    project.push(data)

    res.redirect("/")
});

app.get("/delete-project/:index", (req, res) => {
    const index = req.params.index;
    project.splice(index, 1);
  
    res.redirect("/");
  });

app.get("/update-project/:index", (req, res) =>{
    const index = req.params.index
    const update = project[index]
    res.render( "update-project",{update,index})

})

app.post("/update-project/:index", (req, res) =>{
        const data = req.body

   let index = req.params.index
    project[index] ={
        ...project[index],
        ...data
    }

    console.log(data)
    res.redirect("/")
})

app.listen(PORT, () => {
    console.log(`Server on PORT:${PORT}`)
})







function technologies (item){

    if (item.html){
        technologies.html = true
    }

    if (item.css){
        technologies.css = true
    }

    if (item.js){
        technologies.js = true
    }

    if (item.java){
        technologies.java = true
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
    return `${start.getDate()} ${month[start.getMonth()]} ${start.getFullYear()} - ${end.getDate} ${month[end.getMonth]} ${end.getFullYear}`
}

