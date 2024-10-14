import mongoose from "mongoose";

const {Schema} = mongoose;

const userSchema = new Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    rooms:{
        type:[String],
        default:[]
    }
})

export const User = mongoose.model('user', userSchema);
