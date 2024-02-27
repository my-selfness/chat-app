
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessages = require('./utils/messages')
const {userJoin,getCurrentUser,userLeave,getRoomUser} = require("./utils/users");


const app = express();
const server = http.createServer(app);
const io=socketio(server);


//set static folder 
app.use(express.static(path.join(__dirname,"public")));



// run when client connects
/**
 * Handles a new WebSocket connection.
 * @param {Socket} socket - The WebSocket socket object.
 */
const botName = "Bot";
/**
 * Handles a new WebSocket connection.
 *
 * @param {object} socket - The socket object representing the connection.
 */
io.on("connection", (socket) => {

    /**
     * Handles the 'joinroom' event when a user joins a room.
     *
     * @param {object} data - The data object containing the username and room.
     */
    socket.on('joinroom',({username,room})=>{
        const user = userJoin(socket.id,username,room)
        socket.join(user.room)
        // Welcome Current User
        socket.emit("message",formatMessages(botName,'Welcome Everyone !......',))
        
        //Broad cast when a user connects
        socket.broadcast.to(user.room).emit("message",formatMessages(botName, `A ${user.username} has Joined the chat`));

        //send users and room info
        io.to(user.room).emit("roomUsers",{
            room:user.room,
            users:getRoomUser(user.room)
        })
    })

    /**
     * Handles the 'chatMessage' event when a chat message is emitted from the client.
     *
     * @param {string} msg - The chat message.
     */
    socket.on("chatMessage",(msg)=>{
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message',formatMessages(user.username,msg))
    })

    /**
     * Handles the 'disconnect' event when a client disconnects from the server.
     */
    socket.on("disconnect",()=>{
        const user = userLeave(socket.id)
        if (user) {
            io.to(user.room).emit("message", formatMessages(botName,`${user.username} has left the chat`));
        }
        
        io.to(user.room).emit("roomUsers",{
            room:user.room,
            users:getRoomUser(user.room)
        })
    })


});


const PORT = process.env.PORT || 3000;
/**
 * Starts the server and listens on port 3000.
 * @param {number} port - The port number to listen on.
 * @param {Function} callback - The callback function to be executed when the server starts listening.
 */
server.listen(PORT, () => {
    console.log(`server is listining on port ${PORT}`);
});
