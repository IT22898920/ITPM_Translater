const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({

    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique: true,
    },
    password:{
        type:String,
        required:true

    },
});

// Hash the password before saving to the database
UserSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    next();
  });
  
  // Method to compare passwords
  UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };
  
  const User = mongoose.model('User', UserSchema);
  
  module.exports = User;

