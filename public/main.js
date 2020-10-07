const socket = io();

const inboxPeople = document.querySelector(".inbox__people");
const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const fallback = document.querySelector(".fallback");

let userName = "";

function charcountupdate(str) {
    var lng = str.length;
	document.getElementById("charcount").innerHTML = lng + '/2000';
}

const newUserConnected = (user) => {
    userName = user || prompt("Votre pseudo").replace(/\s/g,"") || `User${Math.floor(Math.random() * 1000000)}`;
    socket.emit("new user", userName);
    addToUsersBox(userName);
};

const addToUsersBox = (userName) => {
    if (!!document.querySelector(`.${userName}-userlist`)) {
        return;
    }

    const userBox = `
        <div class="chat_ib ${userName}-userlist">
            <h5>${userName}<span><i class="fas fa-circle"></i></span></h5>
        </div>
    `;
    inboxPeople.innerHTML += userBox;
};


const addNewMessage = ({ user, message }) => {
    const time = new Date();
    const formattedTime = time.toLocaleString("fr-FR", { hour: "numeric", minute: "numeric" });

    const receivedMsg = `
    <div class="incoming__message">
        <div class="received__message">
        <p>${message}</p>
        <div class="message__info">
            <span class="time_date">${formattedTime} •</span>
            <span class="message__author"><b>${user}</b></span>
        </div>
        </div>
    </div>`;

    const myMsg = `
    <div class="outgoing__message">
        <div class="sent__message">
        <p>${message}</p>
        <div class="message__info">
            <span class="time_date">${formattedTime}</span>
        </div>
        </div>
    </div>`;

    messageBox.innerHTML += user === userName 
    ? myMsg
    : receivedMsg;
    document.querySelector(".inbox__messages").scrollTop = document.querySelector(".inbox__messages").scrollHeight;
};

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!inputField.value) {
        return;
    }

    socket.emit("chat message", {
        message: inputField.value,
        nick: userName,
    });

    inputField.value = "";
});


inputField.addEventListener("keyup", () => {
    socket.emit("typing", {
        isTyping: inputField.value.length > 0,
        nick: userName,
    });
});

newUserConnected();

socket.on("new user", function (data) {
    data.map((user) => addToUsersBox(user));
});

socket.on("user disconnected", function (userName) {
    document.querySelector(`.${userName}-userlist`).remove();
});

socket.on("chat message", function (data) {
    addNewMessage({ user: data.nick, message: data.message });
});


socket.on("typing", function (data) {
    console.log(data)
    const { isTyping, nick } = data;

    if (!isTyping) {
        fallback.innerHTML = "";
        return;
    }

    fallback.innerHTML = `<p>${nick} est entrain d'écrire...</p>`;
});

