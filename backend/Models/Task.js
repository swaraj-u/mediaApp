import mongoose from "mongoose";

const {Schema} = mongoose;

const taskSchema = new Schema({
    room:{
        type:String,
    },
    task:{
        type:String,
        required:true
    },
    deadline:{
        type: Date,
    }
})

export const Task = mongoose.model('task', taskSchema);