import mongoose from "mongoose";

const {Schema} = mongoose;

const messageSchema = new Schema({
    room:{
        type:String,
    },
    message:{
        type:String,
        required:true
    },
    username:{
        type: String
    }
})

export const Message = mongoose.model('message', messageSchema);