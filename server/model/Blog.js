const mongoose=require("mongoose");

const blogScehma=mongoose.Schema({
    title:{
        type:String
    },
    imageURL:String
});
module.exports=mongoose.model("Blog",blogSchema);