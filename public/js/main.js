const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name")
const userList = document.getElementById("users")

// get username and room from url

const {username, room} = Qs.parse(location.search,{
    ignoreQueryPrefix:true
})



const socket = io();
//join chat room
socket.emit('joinroom',{username,room})

//get room users
socket.on('roomUsers',({room,users})=>{
outputRoomName(room)
outputUsers(users)
})
//messsage from server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);
  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault(); //block the default function

  //get message text
  const msg = e.target.elements.msg.value;

  //send the message to the server
  socket.emit("chatMessage", msg);
  //clear input 
  e.target.elements.msg.value='';
  e.target.elements.msg.focus();
});

//output message from dom

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
  document.querySelector(".chat-messages").append(div);
}


//Add room name to dom

function outputRoomName(room){
  console.log(room);
  roomName.innerText= room;
}
function outputUsers(users){
  userList.innerHTML=`
  ${users.map(user=>`<li>${user.username}</li>`).join('')}
  `
}
