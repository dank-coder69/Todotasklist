//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://Sourabh:2242001s@cluster0.cq9grw2.mongodb.net/todolistDB");
const toDoListSchema = {
  name : String
};
const listSchema = {
  name : String,
  items : [toDoListSchema]
};
const List = new mongoose.model('List', listSchema);
const Task = new mongoose.model("Task", toDoListSchema);
const task = new Task({
  name:"hello"
})
const task1 = new Task({
  name:"new item"
})
const task2 = new Task({
  name:"delete item"
})
const def = [task,task1,task2];

app.get("/", function(req, res) {
  Task.find({},(err,result)=>{
    if (result.length === 0){
      Task.insertMany(def,(err)=>{
        if(err){
            console.log("There is Error");
               }
        else {
            console.log("Succes");
             }
      });
      res.redirect('/');
    }
      else {
      res.render("list", {listTitle: "Today", newListItems: result});
    }

  });

  const day = date.getDate();
});
//const day = date.getDate();
app.get('/favicon.ico', (req, res) => res.status(204));
app.get("/:pathName",(req,res)=>{

const pathName = _.capitalize(req.params.pathName);
//console.log(Array.isArray(pathName));
List.findOne({name : pathName}, (error, results)=>{

  if (!error){
    if(!results){
  //prompt("Hello! I am an alert box!");
     const list = new List({
     name : pathName,
     items : def
        })
     list.save();
     List.aggregate();
     res.redirect('/' + pathName);
  }else {
    res.render("list", {listTitle: results.name, newListItems: results.items});
      }
  }
});
});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName = req.body.list;
  const task = new Task({
   name : item
 });
 //console.log(listName);
  if (listName === "Today"){
    task.save();
    res.redirect("/");
  }else {
    List.findOne({name : listName}, (err, found)=>{
        found.items.push(task);
        found.save();
        res.redirect('/'+ listName)
    });
  }

});
app.post("/delete", (req,res)=>{
const dTask = req.body.checkbox;
const listName = req.body.listName;
const id = req.body.id;
//console.log(id);
if (listName != 'Today'){
  //const deleted = Task.find({_id: dTask});
  // Task.deleteOne({_id: req.body.checkbox},(err,del)=>{
  //   if(!err){
  //     res.redirect('/' + listName);
  //   }
  // })
  List.findOneAndUpdate({name : listName},{$pull:{items:{_id: dTask}}},(err,del)=>{
    console.log(dTask);
    if (!err){
     console.log('deleted!');
     res.redirect('/' + listName);

    }
  })

}else {
  Task.deleteOne({_id :dTask},(err,deleted)=>{
    if(err){
      console.log(err);
    }else {
      console.log("Deleted ");
      res.redirect("/")
    } });
}
});
app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
