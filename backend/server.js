const express= require('express')
const mongoose =require('mongoose')
const body_parser=require('body-parser');
const TransactionRouter = require('./routes/Route');

const app=express();



app.use('/task',TransactionRouter)

const DatabaseConnection=()=>{
    mongoose.connect('mongodb+srv://muliksanket17:Sanket17@cluster0.7vnt1wx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(()=>{
        console.log("Connected Database");
    })
    .catch(err=>{
        console.log(err);
    })

}
DatabaseConnection()
app.listen(4001,()=>{
    console.log("server is Started");
})