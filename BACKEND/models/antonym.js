const mongoose =require('mongoose');

const Schema = mongoose.Schema;

const antonymSchema = new Schema({
    word: { type:String, required:true},
    antonym: { type:String, required:true},
    status: { type:String, required:true},
})

module.exports = mongoose.model("antonym",antonymSchema);