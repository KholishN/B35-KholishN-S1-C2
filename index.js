const express = require("express");
const app = express();
PORT = 5000;
const isLogin = false;

app.set("view engine","hbs");
app.use("/public", express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));

app.get("/",(req, res) =>{
    res.render("index")
});

app.get("/project",(req, res) =>{

    res.render("detail-project")

});

app.get("/contact",(req, res) =>{
    res.render("contact-form")
});

app.get("/addproject",(req, res) =>{
    res.render("add-project")

});

app.post("/addproject",(req, res) =>{

const data = req.body

console.log(data)


});

app.listen(PORT, () => {
    console.log(`Server on PORT:${PORT}`)
})