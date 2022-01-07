const scraper = require('./scraper.js');
const express = require('express');
const app= express();
const mongoose = require('mongoose');
require('dotenv').config()
const DB_PASS=process.env.DB_PASSWORD;
console.log(DB_PASS);

mongoose.connect("mongodb+srv://salvatore:"+DB_PASS+"@cluster0.yrroi.mongodb.net/test");
const Item=mongoose.model("Item",{title:String, providers: JSON});
app.set('view engine', 'ejs');
//app.use(express.static(__dirname + '/public/'));
app.get('/', function(req,res) {
    res.render('index')
});

app.get('/search/:movie', async function(req, res){
    if(req.params.movie.includes("favicon")){
        res.status(204);
    }else {
    const result= await Item.find({title: { '$regex' : req.params.movie, '$options' : 'i' }}).exec();
    if(result.length==0){
        console.log("crea entry nel db")
        const scrapeRes= await scraper(req.params.movie,null);
        const item= new Item({title: scrapeRes.title, providers:scrapeRes.providers});
        const itemSaved= await item.save();
        res.send(itemSaved);
    }
    await res.send(result);
}
});
app.use(express.json());
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})

app.post('/request',async function(req, res) {
    var error="";
    var isError=false;
    const body=req.body;
    const title=body.title;
    if(!title) error="Nessun Titolo inserito!"; isError=isError || true;
    if(!error)
    {
        const dbRetrived= await Item.find({title: { '$regex' : title, '$options' : 'i' }}).exec();
        if(dbRetrived.length!=0) error="Il titolo inserito è già presente!"; isError=isError || true;
        if(!error)
        {
            const providers=body.providers;
            const toSave=new Item({title: title, providers: providers});
            res.send(toSave.save())
        }
        else{
            res.send({"error": error});
        }
    }
    else{
        res.send({"error": error});
    }
    
});

app.get('/favicon.ico', function(req, res) { 
    res.status(204);
    res.end();    
});

app.get('/provider/:providerName',async function(req,res) {
    if(req.params.providerName.includes("favicon")){
        res.status(204);
    }{
    const providerName=req.params.providerName
    const retrived= await Item.find({"providers.name" : {'$regex': providerName, '$options': 'i'}}).exec();
    res.send(retrived)
    }
});



const port= process.env.PORT || 3000;
app.listen(port, console.log("working on port: "+port));
