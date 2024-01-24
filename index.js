const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const PORT = 3000;

app.use(express.static('public'));

const users = {};
var hanger = null;
var admin = null;
var guesser = null;

var word = null;
var wordSpaces = null;
var usedLetters = null;
var strikesLeft = 10;

const pickGuesser = () => {
	const players = Object.keys(users).filter(id => (id != hanger || id != guesser));
	
	if(players == [] || players == null) return null;
	
	return players[Math.floor(Math.random() * players.length)];
}
const updateSpaces = () =>{
	let currentWord = '';
	let anyCorrect = false;
	word.split('').forEach(letter =>{
		if(!usedLetters.has(letter.toLowerCase()))
		{
			if(letter == ' ') currentWord += ' ';
			else              currentWord += '_';
			return;
		}
		currentWord += letter;
		anyCorrect = true;
	});
	wordSpaces = currentWord;
	
	if(anyCorrect) return;
	
	strikesLeft--;
}
io.on('connection', (socket) => {
	console.log('a user connected');
	
	socket.on('join', username =>{
		users[socket.id] = {username:username};
		
		if(admin == null)
		{
			admin = socket.id;
			socket.emit('grand','admin');
			return;
		}
		
		socket.emit('status','Waiting for players');
	});
	socket.on('start', ()=>{
		const players = Object.keys(users);
		const isAdmin = (admin == socket.id);
		const isMinPlayer = (players.length >= 3);
		
		if(!isAdmin)
		{
			socket.emit('status','You are not the admin');
			return;
		}
		if(!isMinPlayer)
		{
			io.emit('status','Not enought players');
			return;
		}
		
		hanger = players[Math.floor(Math.random() * players.length)];
		const hangerUsername = users[hanger].username;
		io.emit('status',`${hangerUsername} is picking word`);
		io.to(hanger).emit('grand','hanger');
	});
	socket.on('setWord',hangerWord=>{
		const players = Object.keys(users);
		const isHanger = (hanger == socket.id);
		const emptyWord = (word == null);
		if(!isHanger)
		{
			socket.emit('status','You are not the hanger');
			return;
		}
		if(!emptyWord)
		{
			socket.emit('status','Word is picked');
			return;
		}
		word = hangerWord;
		usedLetters = new Set();
		updateSpaces();
		io.emit('wordUpdate',wordSpaces,strikesLeft);
		
		guesser = pickGuesser();
		if(guesser == null)
		{
			io.emit('status', 'Not enought players to pick guesser');
			return;
		};
		
		const guesserUsername = users[guesser].username;
		io.emit('status', `${guesserUsername} is picking guessing letter`);
		io.to(guesser).emit('grand','guesser');
	});
	socket.on('guessLetter',guessLetter=>{
		const isGuesser = (guesser == socket.id);
		if(!isGuesser)
		{
			socket.emit('status','You are not the guesser');
			console.log(socket.id);
			console.log(guesser);
			return;
		}
		
		usedLetters.add(guessLetter.toLowerCase());
		updateSpaces();
		io.emit('wordUpdate',wordSpaces,strikesLeft);
		io.to(guesser).emit('degrand','guesser');
		
		guesser = pickGuesser();
		if(guesser == null)
		{
			io.emit('status', 'Not enought players to pick guesser');
			return;
		};
		const guesserUsername = users[guesser].username;
		io.emit('status', `${guesserUsername} is picking guessing letter`);
		io.to(guesser).emit('grand','guesser');
	});
});

server.listen(PORT, () => {
	console.log(`listening on localhost:${PORT}`);
});