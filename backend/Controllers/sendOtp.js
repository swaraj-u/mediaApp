import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { User } from '../Models/User.js';
dotenv.config();

export const sendOtp = async(req,res) => {
    const {username, email} = req.body;

    const otp = Math.floor(1000 + Math.random() * 9000);

    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can use other services like Outlook, Yahoo, etc.
        auth: {
          user: process.env.GOOGLE_EMAIL, // Your email
          pass: process.env.GOOGLE_APP_PASSWORD, // Your email password or app-specific password
        },
      });

    const mailOptions = {
    from: process.env.GOOGLE_EMAIL , // Sender address
    to: email , // Receiver's email
    subject: 'Connectverse: OTP for Resetting your password.', // Subject line
    text: `OTP for the resetting your password is ${otp} `, // Plain text body
    };

    try{
        const user = await User.findOne({ username:  username});
        console.log(user._id);
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
            console.log('Error occurred in sending the mail:', error);
            } else {
            console.log('Email sent: ' + info.response);
            res.status(200).json({ _id: user._id.toString(), otp: otp });
            }
        });

    }catch(err){

    }
    
}