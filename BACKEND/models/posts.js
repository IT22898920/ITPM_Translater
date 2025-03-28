const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },
    description:{
        type:String,
        required:true
    },
    note:{
        type:String,
        required:true

    },

});
module.exports = mongoose.model('Post',postSchema);

