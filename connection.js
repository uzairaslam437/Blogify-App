const mongoose = require("mongoose");

async function connectMongoDB(connectionString){
    mongoose.connect(connectionString).
    then(console.log("Connected to mongoDB")).
    catch((err)=>{ console.log(`Error in connecting to mongoDb:${err}`)})
}

module.exports = {connectMongoDB};
