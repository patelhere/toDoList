//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://admin-patel:Patel123@todolist.dnvwgcm.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome to your Todo List!"
});

const item2 = new Item({
  name: "Hit the + button to add an item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model("List", listSchema) 

app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successful saved default items to dbs");
        }
      })
      res.redirect("/")
    }else{
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
    
  })

});

app.post("/", function (req, res) {

  const listName = req.body.list;
  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  })

  if(listName === "Today"){
    item.save()
    res.redirect("/")
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item)
      foundList.save()
      res.redirect("/"+listName)
    })
  }
  
  
});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox
  const listName = req.body.listName
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemID, function(err){
      if(!err){
        console.log("Deleted an Item Scussfully")
      }
    })
    res.redirect("/")
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName)
      }
    })
  }
  
})

app.get("/:url", function(req, res){
  const customListName = _.capitalize(req.params.url)
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save()
        res.redirect("/"+customListName)
      }else{
        //show an existing list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
      }
    }
  })
  
})

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
