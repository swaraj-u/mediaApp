import { User } from "../Models/User.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();
import jwt from 'jsonwebtoken';

export const login = async (req,res) => {
    const {username, password} = req.body;
    console.log(username, typeof(username));
    const trimmedUsername = username.trim();

    User.findOne({ username: trimmedUsername })
        .then(async user => 
            {
                try{
                        if(!user){
                            return res.status(404).send("Username not found.");
                        }
                        else if(await bcrypt.compare(password, user.password)){
                            const token = jwt.sign(
                                {_id: user._id},
                                process.env.JWT_SECRET_KEY
                            );
                            res.cookie("USER_LOGGED_IN", token, {
                                httpOnly:true,
                                secure:true,
                            })
                            return res.status(200).send();
                        }
                        else{
                            return res.status(401).send("Incorrect password.")
                        }
                    }catch(err){
                        console.log("Error in comparing password: ", err);
                        return res.status(500).send("internal server error");
                    }
            }
        )
        .catch(err => {
            console.log("Error in userFind block: ", err);
            return res.status(500).send("internal server error");
        });
}