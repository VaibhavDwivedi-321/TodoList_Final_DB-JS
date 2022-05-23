const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =  require("lodash");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));





//creating new database
mongoose.connect("mongodb+srv://admin-vaibhav:test123@cluster0.leyhq.mongodb.net/todolistDB",{useNewUrlParser:true});
//creating items schema
const itemsSchema = {
  name:String};
//new mongoose model
const Item = mongoose.model("Item",itemsSchema);
//creating new document
const item1 = new Item({name:"Welcome to your todolist!"});
const item2 = new Item({name:"Hit the + button to add a new item."});
const item3 = new Item({name:"<-- Hit this to delete an item."});
const defaultItems = [item1,item2,item3];






//CREATING NEW SCHEMA FOR THE DYNAMIC ROUTES
const listSchema = {
  name:String,
  items:[itemsSchema]
};
//creating monoose.model
const List = mongoose.model("List",listSchema);

















//RENDERING THE LIST AND ADDING DEFAULT ITEMS
app.get("/", function(req, res) {
  //FINDING ITEMS AND SENDING THEM OVER LIST.EJS
  Item.find({},function(err,foundItems){
  //CHECKING IF THERE WERE NO ITEMS SO THAT WE CAN ADD THE DEFAULT ITEMS ONCE SO THAT THEY ARE NOT REPEATED
if(foundItems.length === 0){
    //INSERTING many items to database
    Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Sucessfully saved"); }});
//REDIRECTION TO THE ROUTE ROUTE SO THAT THE ADDED ITEMS CAN SHOW UP WITHOUT REFRESHING      \
        res.redirect("/");
    }else{
  res.render("list", {listTitle: "Today", newListItems: foundItems});
}});});














//ADDING DELETE ROUTE AND DELETTING THE ITEMS
app.post("/delete",function(req,res){
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;
if(listName ===  "Today"){
    //FINDING THINGS BY ID NAME CAPURTED IN CHECKITEMID AND DELETING THEM
    Item.findByIdAndRemove(checkItemId,function(err){
      if(!err){
        console.log("Succesfully deleted");
        //REDIRECTION TO THE ROUTE ROUTE SO THAT THE ADDED ITEMS CAN SHOW UP WITHOUT REFRESHING      \
        res.redirect("/");
    }});
}else{
  //FINDING THE LIST AND REMOVING THE ELEMENT FROM THE ARRAY
List.findOneAndUpdate({name:listName}, {$pull:{items:{_id: checkItemId}}}, function(err,foundList){
  if(!err){
    res.redirect("/"+ listName);
  }
});
}
});























//ADDING NEW ITEMS TO THE LIST
app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
//  creating new item just like we did above while adding item1,item2,item3 to the db but this time the itemName will be dynamic according to the user enetered input
const item = new Item({name: itemName});
//checking in which list the item got created
if(listName === "Today"){
  //single item can be saved by item.save unlike above where we used insert many to add item1,item2,item3
  item.save();
  //REDIRECTION TO THE ROUTE ROUTE SO THAT THE ADDED ITEMS CAN SHOW UP WITHOUT REFRESHING      \
  res.redirect("/");
}else{
List.findOne({name:listName},function(err,foundList){
  foundList.items.push(item);
  foundList.save();
  res.redirect("/"+listName);
})
}
});


















//CREATING A DYNAMIC ROUTE AND DYNAMIC LISTS
app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
//CHECKING IF THE LIST ALREADY EXISTS
List.findOne({name:customListName},function(err,foundList){
  if(!err){
    if(!foundList){
      //creating new list document whenever an unknown list is made and adding items to it
      const list= new List({name: customListName, items: defaultItems});
      list.save();
      res.redirect("/"+ customListName );
    }else{
      //showing the existing list
      res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
}
}
});});





















app.get("/about", function(req, res){
  res.render("about");});








  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 3000;
  }
app.listen(port, function() {
  console.log("Server started");
});
