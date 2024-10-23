import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { FRONTEND_URL } from './utils/constants.js';
import { login } from './Controllers/login.js';
import { User } from "./Models/User.js";
import { Document } from './Models/Document.js';
import bcrypt from "bcrypt";
import mongoose from 'mongoose';
import { userData } from './Controllers/userData.js';
import { Server } from 'socket.io';
import http from 'http';
import { Task } from './Models/Task.js';
import { Message } from './Models/Message.js';
import { sendOtp } from './Controllers/sendOtp.js';
import { updatePassword } from './Controllers/updatePassword.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        credentials:true,
        origin:[
            FRONTEND_URL
        ],
    })
)

const server = http.createServer(app);

const io = new Server(server,{
    cors: {
        origin: "*",
        methods: ['GET', 'POST', 'DELETE']
    }
});

server.listen(PORT, () => {console.log("server is listening")});
const mongodbConnectLink=process.env.MONGODB_CONNECTION_LINK;
mongoose.connect(mongodbConnectLink)
    .then(() => console.log("connected with mongoDB database."))
    .catch((err) => console.log("Not able to connect: ", err));

app.get("/", (req,res) => {
    res.send("Server is on!")
})

app.post("/login", login);

app.get("/authuser", (req,res) => {
    const token = req.cookies.USER_LOGGED_IN;

    if(token){
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
            if(err){
                res.status(403).send("Invalid token");
            }
            const decodedToken = jwt.decode(token, {complete: true});

            res.status(200).json({ _id: decodedToken.payload._id });
        })
    } else {
        res.status(401).send("No token Found.")
    }
});

app.get("/signup/users", (req,res) => {
    User.find()
    .then(users =>{
        res.status(200).json({users});
    })
    .catch(err => {
        res.status(500).send("Server error");
    })
})

app.post("/add/user", async (req,res) => {
    try{
        const {username, password} = req.body;
        if(!username || !password){
            res.status(400).send("Bad request.");
        }else{
            const hashedPassword = await bcrypt.hash(password, 10)
            const user = new User({
                username:username,
                password:hashedPassword
            })
            user.save()
            .then(() => {
                res.status(201).send("User created.")
            })
            .catch(err => {
                res.status(500).send("Problem in saving the user.")
            })
        }
    }catch(err){
        res.status(500).send("Server error.")
    }
})

app.get("/logout", (req,res) => {
    res.clearCookie('USER_LOGGED_IN', {
        httpOnly: true,
        secure: true
    });
    res.status(200).send("Logged out successfully.")
})

app.post("/userdata", userData);

app.post("/sendOTP", sendOtp);

app.post("/updatePassword", updatePassword);

app.post("/addroom", (req,res) => {
    const {room, id} = req.body;

    User.findOne({_id: id})
    .then(async user => {
        try{
            if(!user){
                res.send(404).send("User not found.")
            }else{
                if(user.rooms.includes(room) || room === ""){
                    res.status(200).send("Already has the room.")
                }else{
                    const updatedUser = await User.findOneAndUpdate(
                        { _id: id },      
                        { $push: { rooms: room } },  
                        { new: true });             
                    if(updatedUser){
                        res.status(201).send("Added room.")
                    }else{
                        res.status(400).send("Bad Request.")
                    }
                }
            }
        }catch(err){
            console.log(err)
            res.status(500).send("Internal server error.");
        }
    })
});

const defaultValue = ""

io.on("connection", socket => {
    console.log("client connected.",socket.id)
    socket.on("get-document", async room => {
    console.log(room);
    const document = await findOrCreateDocument(room)
    socket.join(room)
    socket.emit("load-document", document.data)

    socket.on("send-changes", delta => {
      socket.broadcast.to(room).emit("receive-changes", delta)
    })

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(room, { data })
    })
  })

   socket.on("update-users", async() => {
    try{
        const users = await User.find()
        io.emit("users-updated", users);
    }catch(err){
        console.log("error from socket: ", err);
    }
   })

   socket.on("getTasks", room => {
        Task.find({ room : room }).then((tasks) => {
        socket.emit("allTasks", tasks);
        })
    })

    
  socket.on("addTask", async (task, deadline, room) => {
    const newTask = new Task({ room: room, task: task, deadline: deadline });
    await newTask.save();

    Task.find({ room : room }).then((tasks) => {
      socket.emit("allTasks", tasks); 
    });
   });

   socket.on('deleteTask', (taskId, room) => {
        Task.findByIdAndDelete(taskId).then(() => {
        Task.find({ room: room }).then((tasks) => {
            socket.emit('allTasks', tasks);
        });
        });
    });

    socket.on("send-message", async (currentChat, room, id) => {
        try{
            const user = await User.findOne({_id: id})
            const newMessage = new Message({ room: room, message: currentChat, username:user.username });
            await newMessage.save();

            Message.find({room: room}).then((messageList) => {
                io.in(room).emit("get-messageList", messageList, room);
            });

        }catch(err){
            console.log(err);
        }
    })

    socket.on("send-user", async(id, room)=> {
        try{
            const user = await User.findOne({_id: id});
            socket.join(room)
            socket.emit("receive-user", user.username);

            Message.find({room: room}).then((messageList) => {
                io.in(room).emit("get-messageList", messageList, room);
            });
        }catch(err){
            console.log(err);
        }
    })

})

async function findOrCreateDocument(id) {
  if (id == null) return 

  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue })
}







