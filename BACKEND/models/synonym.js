const mongoose =require('mongoose');

const Schema = mongoose.Schema;

const synonymSchema = new Schema({
    word: { type:String, required:true},
    synonym: { type:String, required:true},
    status: { type:String, required:true},
})

module.exports = mongoose.model("synonym",synonymSchema);