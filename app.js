const express = require('express')
const bodyparser = require('body-parser')
const mongoose = require('mongoose')
const _ = require('lodash')
mongoose.connect("mongodb+srv://admin-rissal:test123@cluster0.8aqwy.mongodb.net/todolistDB",{useNewUrlParser:true, useUnifiedTopology:true})

const itemsSchema = {
    name:String
}
const Item = mongoose.model("Item",itemsSchema)

const buy = new Item({
    name: "buy food"
})
const make = new Item({
    name: "make food"
})
const eat = new Item({
    name: "eat food"
})
const defaultItems = [buy,make,eat]


const listSchema = {
    name: String,
    items: [itemsSchema]
}
const List = mongoose.model("List",listSchema)



/*Item.deleteMany({_id: { $in: ["5f35af783b3e8d3cdc1fd47d","5f35af783b3e8d3cdc1fd47e","5f35af783b3e8d3cdc1fd47f"]}}, function(err) {
    if(err){
        console.log(err)
    }else{
        console.log("succesfully deleted items")
    }
})*/

const app = express()
app.use(bodyparser.urlencoded({extended:true}))
app.use(express.static('public'))
app.set('view engine','ejs')



app.get('/',function(req,res){
    Item.find({},function(err,foundItems){
        if(foundItems.length ===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err)
                }else{
                    console.log("Succesfully inserted default items")
                }
            })
        }
        res.render('list',{listTitle:"Today", listItems:foundItems})
        
    })
   
})





app.get('/:customListName',function(req,res){
    const customListName = _.capitalize(req.params.customListName)
    List.findOne({name:customListName},function(err,result){
        if(!result && !err){
            console.log("Does not exist")
            const list = new List({
                name: customListName,
                items:[]
            })
            list.save()
            res.redirect("/"+customListName)
        }else{
            console.log("Already exists")
            res.render("list",{listTitle: result.name, listItems: result.items})
        }
        
    })
    
})





app.post('/',function(req,res){
    
    const listName = req.body.listName
    const itemName = req.body.newItem

    const itemDoc = new Item({
        name: itemName
    })
    
    if(listName === "Today"){
        itemDoc.save()
        res.redirect('/')
    }else{
        List.findOne({name: listName},function(err,foundList){
            foundList.items.push(itemDoc)
            foundList.save()
            res.redirect("/"+listName)
        })
    }
    
    
})

app.post('/delete',function(req,res){

    const checkedItem = req.body.checkbox
    const listName = req.body.listName
    if(listName === "Today"){

        Item.findByIdAndRemove(checkedItem,function(err){
            if(!err){
                console.log("Succesfully deleted item")
                res.redirect('/')
            }
        })
    
    }else{
        List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItem}}},function(err,result){
            if(!err){
                res.redirect("/"+listName)
            }
        })
    }
   
})
let port = process.env.port
if(port == null || port ==""){
    port = 3000
}

app.listen(port,function(){
    console.log('Server up and running port 3000')
})