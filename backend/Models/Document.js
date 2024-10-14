import mongoose from "mongoose";

const {Schema} = mongoose;

const docSchema = new Schema({
    _id: String,
    data: Object,
})

export const Document = mongoose.model('doc', docSchema);