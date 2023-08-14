const socket=io('http://localhost:3000');

socket.on('total_clients', (message)=>{
    let el=document.querySelector(".clients-total");
    el.textContent=`Total Clients: ${message}`;
});

const messageContainer=document.getElementById('message-container');
const messageLeft=document.querySelector('.message-left');
const messageRight=document.querySelector('.message-right');
const nameInput=document.querySelector('.name-input');
const messageForm=document.querySelector('.message-form');
const messageInput=document.querySelector('.message-input');
const sendButton=document.querySelector('.send-button');

// messageForm.addEventListener('submit', (event)=>{
//     event.preventDefault();
//     sendMessage();
// })
sendButton.addEventListener('click', (event)=>{
    event.preventDefault();
    sendMessage();
})

function sendMessage() {
    console.log(messageInput.value);
    const data={
        name: nameInput.value,
        message: messageInput.value,
        dateTime: new Date()
    };

    if(messageInput.value=='' || nameInput.value==''){
        return;
    }

    socket.emit('client_message', data);
    addMessageToUI(true, data);
    clearFeedback();
    scrollToBottom();
    messageInput.value='';
}

socket.on('chat_message', (data)=>{
    addMessageToUI(false, data);
})

function addMessageToUI(isOwnMessage, data) {
    const element=`
    <li class="${isOwnMessage?'message-right':'message-left'}">
        <p class="message">
        ${data.message}
        <span>${data.name}</span>
        </p>
    </li>
    `
    messageContainer.innerHTML+=element;
    scrollToBottom();
    clearFeedback();
}

messageInput.addEventListener("keypress", (event)=>{
    // event.preventDefault();
    if(nameInput.value=='') {
        alert("Please Specify Your Name");
    }
    const feedback=nameInput.value+" is typing..."
    console.log(feedback)
    socket.emit('typing_feedback', feedback);
})

socket.on('feedback', (message)=>{
    clearFeedback();
    const element=
    `
    <li class="message-feedback">
    <p class="feedback" id="feedback">
        ${message}
    </p>
    </li>
    `
    messageContainer.innerHTML+=element;
})

function scrollToBottom() {
    messageContainer.scrollTo(0, messageContainer.scrollHeight)
  }

function clearFeedback() {
    document.querySelectorAll('li.message-feedback').forEach((element) => {
      element.parentNode.removeChild(element)
    })
}

// ${moment(data.dateTime).fromNow()}