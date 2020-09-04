//Dependencies
const path = require ('path');
const http = require ('http');
const express = require ('express');
const socket = require ('socket.io');
const moment = require ('moment');

//Initialize Express App
const app = express();

//Create server variable with http, so socket can listen on http
const server = http.createServer(app);

//Initialize socketio
const io = socket(server);

//BOT name
const BOT = 'iChat Bot'

//Users
let users = [];

//function to add users
function userChat (id, username) {
    const user = {id, username};
    users.push(user);
    return user;
}

//Current user
function currentUser (id) {
    return users.find(user => user.id ===  id);
}

// User leaves chat
function userLeave(id) {
    let remUsers = users.filter(user => user.id != id);
    users = remUsers;
    return users;
}


//Port Number
let PORT = process.env.PORT || 2000;

//Send Public folder
app.use(express.static(path.join(__dirname, 'public')));

//format messages, user and time into objects
function formatMessage (username, message) {
    return {
        username:username,
        message:message,
        time:moment().format('h:mm a')
    }
}


//Listen for http connection
io.on('connection', (socket) => {
    //Recieve new user to chat
    socket.on('joinChat', (docs) => {
        userChat(socket.id, docs);
        io.emit('allUsers', users);

        //Send a welcome message to user that joined.
        //socket.emit: Sends message to only the user that just joined
        socket.emit('message', formatMessage(BOT, 'Welcome to iChat'));

        //Send a message when a new user joins the chat
        //socket.broadcast.emit sends message to all other connected users expect the person that is conneecting
        socket.broadcast.emit('message', formatMessage(BOT,`${docs.username} has joined the chat`));
    })

    //Get input message from server
    //Socket listen for on 'chat' from the client and send to all connected users
    socket.on('chats', (docs) => {
        //Find the user sending a message
        const user = currentUser(socket.id)

        //Send to other users with socket.broadcast.emit excluding the sender
        socket.broadcast.emit('message', formatMessage(user.username.username, docs));

        //Send to only the sender using socket.emit
        socket.emit('senderMsg', formatMessage('me', docs))
        /*
            The message sent from server was splited into two so that 
            the message can be put on the right side of the sender while
            it appears on the left side of the reciver
        */ 
    })

    //Receive user is typing message focusIn
    socket.on('msgTyping', (docs) => {
        socket.broadcast.emit('msgTyping', docs)
    })

    //Receive when user stops typing message focusOut
    socket.on('msgTypingStop', (docs) => {
        socket.broadcast.emit('msgTypingStop', docs);
    })

    //send a message when a user leaves chat
    socket.on('disconnect', () => {
        //io.emit: sends message to all connected users
        io.emit('getExitUser', currentUser(socket.id)); //This will get the user that left the chat
        io.emit('exitMessage', userLeave(socket.id));// This sends the remaining users
    })
})


//Listen on port
server.listen(PORT, () => {
    console.log(`App is running on port: ${PORT}`);
})