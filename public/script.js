const socket = io();

const statusP = document.getElementById('status-box');

const inputUsername = document.getElementById('input-username');
const inputSubmit = document.getElementById('input-submit');

const adminStart = document.getElementById('admin-start');
const adminPanel = document.getElementById('admin-panel');

const hangerWord = document.getElementById('hanger-word');
const hangerSend = document.getElementById('hanger-send');
const hangerPanel = document.getElementById('hanger-panel');

const guesserLetter = document.getElementById('guesser-letter');
const guesserSend = document.getElementById('guesser-send');
const guesserPanel = document.getElementById('guesser-panel');

const currentWord = document.getElementById('current-word');
const usedLettersP = document.getElementById('used-letters');

const displayStatus = (message) => {
	statusP.innerText = message;
};
const showPanel = (panel) =>{
	panel.style.display = 'flex';
}
const hidePanel = (panel) =>{
	panel.style.display = 'none';
}


const grandRole = (role) =>{
	if(role == 'admin') showPanel(adminPanel);
	if(role == 'hanger') showPanel(hangerPanel);
	if(role == 'guesser') showPanel(guesserPanel);
}
const degrandRole = (role) =>{
	if(role == 'admin') hidePanel(adminPanel);
	if(role == 'hanger') hidePanel(hangerPanel);
	if(role == 'guesser') hidePanel(guesserPanel);
}

inputSubmit.addEventListener('submit', e =>{
	e.preventDefault();
	const username = inputUsername.value;
	
	if(username.length < 3) 
	{
		displayStatus('Username invalid');
		return;
	}
	
	socket.emit('join',username);
});
adminStart.addEventListener('click', () => {socket.emit('start')});
hangerSend.addEventListener('click', () => {socket.emit('setWord',     hangerWord.value)});
guesserSend.addEventListener('click', () => {socket.emit('guessLetter',guesserLetter.value)});

socket.on('status', message=>displayStatus(message));
socket.on('grand', role=>grandRole(role));
socket.on('degrand', role=>degrandRole(role));
socket.on('wordUpdate', (word,strikes)=>{
	currentWord.innerText = word;
	const text = 'O'.repeat(strikes);
	usedLettersP.innerText = text;
});
