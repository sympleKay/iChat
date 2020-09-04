//Get ID from DOM and assign variable to them
let onlineUsers = document.getElementById('onlineUsers');
let chatLink = document.getElementById('chatLink');
let user = document.getElementById('user');
let chatMsg = document.getElementById('chatMsg');
let chatForm = document.getElementById('chatForm');
let noOfOnlineUsers = document.getElementById('noOfUsers');
let msg = document.getElementById('msg');
let msgTyping = document.getElementById('msgTyping');
let body = document.getElementById('body');

// Get username from query using qs
let usernameChat = Qs.parse(location.search, {ignoreQueryPrefix: true});

//Initialize socket on the front end
const socket = io();

//Create a function for outputing messages to other users
function outputChatMessages (docs) {
    //create a div element
    let div = document.createElement('div');
    div.classList.add('bg-light');
    div.innerHTML = `<p class="card-text"><strong>${docs.username}:</strong> ${docs.message}</p> <p class="time">${docs.time}</p>`
    chatMsg.appendChild(div);
}

//Create a function for outputing messages to sender
function senderChatMessages (docs) {
    //create a div element
    let div = document.createElement('div');
    div.classList.add('bg-light', 'text-right');
    div.innerHTML = `<p class="card-text"><strong>${docs.username}:</strong> ${docs.message}</p> <p class="time">${docs.time}</p>`
    chatMsg.appendChild(div);
}

//function to list all users
function allUsersList (docs) {
    user.innerHTML = `${docs.map(doc => `<li class = "list-group-item">${doc.username}</li>`).join('')}`
}

//Grab message from server
socket.on('message', (docs) => { 
    //Message is what was emitted from the server the docs contains the content of the message emitted
    msgTyping.innerHTML = "";
    outputChatMessages(docs);
    chatMsg.scrollTop = chatMsg.scrollHeight;
}) // This function sends message to all the connected user when a user sends message.

socket.on('senderMsg', (docs) => {
    msgTyping.innerHTML = "";
    senderChatMessages(docs);
    chatMsg.scrollTop = chatMsg.scrollHeight;
}) // This function sends message to the sender of the message

//Get all users from server
socket.on('allUsers', (docs) => {
    user.innerHTML = `${docs.map(doc => `<li class = "list-group-item">${doc.username.username}</li>`).join('')}`;
    noOfOnlineUsers.innerHTML = `(${docs.length})`
})

//On exit
socket.on('exitMessage', (docs) => {
    user.innerHTML = `${docs.map(doc => `<li class = "list-group-item">${doc.username.username}</li>`).join('')}`;
    noOfOnlineUsers.innerHTML = `(${docs.length})`
})

//Existed user
socket.on('getExitUser', (docs) => {
    //create a div element
    let time = moment().format('h:mm a');
    let div = document.createElement('div');
    div.classList.add('bg-light');
    div.innerHTML = `<p class="card-text"><strong>iChat Bot:</strong> ${docs.username.username} has left the chat</p> <p class="time">${time}</p>`;
    chatMsg.appendChild(div);
})

//On Join chat
socket.emit('joinChat', usernameChat);

chatForm.addEventListener('submit', (e) => {
    //Prevent default form behaviour
    e.preventDefault();

    //Get user input
    let usersChatInput = e.target.elements.msg.value;

    //Send the input to the server
    socket.emit('chats', usersChatInput);

    //Set input back to empty
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus;
})

//On typing send to server
msg.addEventListener('focusin', function () {
    socket.emit('msgTyping', `${usernameChat.username} is typing...`);
})

msg.addEventListener('focusout', function () {
    socket.emit('msgTypingStop', '');
})

//receive typing message from server
socket.on('msgTyping', (docs) => {
    msgTyping.innerHTML = `<p class = "text-center bg-light"><em>${docs}</em></p>`
})

socket.on('msgTypingStop', (docs) => {
    msgTyping.innerHTML = docs;
})


// Event Listeners to toggle Chats and Online Users
onlineUsers.addEventListener('click', function () {
    chatLink.classList.remove('active');
    onlineUsers.classList.add('active');
    chatMsg.style.display = 'none';
    chatForm.style.display = 'none';
    user.style.display = 'block';
})

chatLink.addEventListener('click', function () {
    onlineUsers.classList.remove('active');
    chatLink.classList.add('active');
    user.style.display = 'none';
    chatMsg.style.display = 'block';
    chatForm.style.display = 'block';
})