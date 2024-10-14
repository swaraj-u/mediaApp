import { User } from "../Models/User.js";

export const userData = async(req,res) => {
    const {_id} = req.body;
    
    User.findOne({_id: _id})
    .then(async(user) => {
        if(!user){
            return res.status(400).send("User not found.");
        }else{
            const users = await User.find();
            return res.status(200).json({user: user, users: users});
        }
    })
    .catch(err => {
        return res.status(500).send("Internal server error: ");
    })
}