const async = require('async');
const moment = require('moment');

const admin = require('./models/admin');
const room = require('./models/room');
const HistoryChat = require('./models/HistoryChat');
const HistorySocket = require('./models/HistorySocket');

const InitiateMongoServer = require("./db/config");
const mongoose = require('mongoose');

// Initiate Mongo Server
InitiateMongoServer();

const numOfMsg = 16;
const numOfSocketEvents = 6;
let rooms = [];
let historiesChat = [];
let historiesSocket = [];

const roomsList = [
    'Batcave',
    'Westworld',
    'Death Star',
    'Kings Landing',
];

const usersList = [
    'ticklishgoose483',
    'goldenelephant339',
    'beautifulwolf535',
    'yellowlion153',
];

const msgList = [
    "Chuck Norris is responsible for the dark matter of the universe. It is made up of the atoms of everything he's killed or destroyed.",
    "Chuck Norris walked past Uasin Bolt who was running the 100m... on the day that he broke the world record",
    "Why do so many rock stars die at age 27? Chuck Norris",
    "david copper field can turn a $1 bill into $100. but Chuck Norris can turn david copperfield into the u.s. tresury",
    "Chuck Norris combs his hair with a pitchfork.",
    "If you see Chuck Norris fighting a bear, don't help Chuck Norris, help the bear.",
    "Chuck Norris doesn't use web standards as the web will conform to him.",
    "All who would win joy, must share it; happiness was born a twin.",
    "You have to sniff out joy; keep your nose to the joy-trail.",
    "So shall I join the choir invisible Whose music is the gladness of the world.",
];

function getRandomRoomObj() {
    return rooms[parseInt(Math.random() * rooms.length)];
}

function getRandomUser() {
    return usersList[parseInt(Math.random() * usersList.length)];
}

function getRandomMsg() {
    return msgList[parseInt(Math.random() * msgList.length)];
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(start, end) {
    return parseInt(Math.random() * (end + 1 - start) + start)
}

function adminCreate(login, password) {
    let newAdmin = new admin({ login, password });

    newAdmin.save(function (err) {
        if (err) {
            throw err;
        }
        console.log('Admin created: ' + newAdmin.login);    
    });
}

function roomCreate(name, cb) {
    let newRoom = new room({ name });

    newRoom.save(function (err) {
        if (err) {
            throw err;
        }
        console.log('New Room: ' + newRoom.name);
        rooms.push(newRoom);
        cb(null, newRoom);
    });
}

function historyChatCreate(user, room, message, date, cb) {
    let newHistoryChat = new HistoryChat(
        {
            user,
            room,
            message,
            date
        }
    );

    newHistoryChat.save(function (err) {
        if (err) {
            throw err;
        }
        console.log('New history chat: ' + newHistoryChat.message);
        historiesChat.push(newHistoryChat);
        cb(null, newHistoryChat);
    });
}

function historySocketCreate(user, room, message, date, cb) {
    let newHistorySocket = new HistorySocket(
        {
            user,
            room,
            message,
            date
        }
    );

    newHistorySocket.save(function (err) {
        if (err) {
            throw err;
        }
        console.log('New history socket: ' + newHistorySocket.message);
        historiesSocket.push(newHistorySocket);
        cb(null, newHistorySocket);
    });
}

function populateRooms(cb) {
    let roomsCreateArray = []
    for (const room of roomsList) {
        roomsCreateArray.push(cb => roomCreate(room, cb));
    }

    async.series(roomsCreateArray, cb);
}

function populateHistoryChat(cb) {
    let historyChatCreateArray = []
    for (let i = 0; i < numOfMsg; i++) {
        historyChatCreateArray
            .push(cb => historyChatCreate(getRandomUser(), getRandomRoomObj(), getRandomMsg(), randomDate(new Date(2020, 1, 30), new Date(2020, 2, 6)), cb));
    }

    async.parallel(historyChatCreateArray, cb);
}

function populateHistorySocket(cb) {
    let historySocketCreateArray = []
    for (let i = 0; i < numOfSocketEvents; i++) {

        let user = getRandomUser();
        let room = getRandomRoomObj();
        let dateConnect = randomDate(new Date(2020, 1, 30), new Date(2020, 2, 6));
        let dateJoin = moment(dateConnect).add(randomInt(1, 30).toString(), 'm').toDate();
        let dateLeft = moment(dateJoin).add(randomInt(1, 30).toString(), 'm').toDate();
        let dateDisconnect = moment(dateLeft).add(randomInt(1, 30).toString(), 'm').toDate();

        historySocketCreateArray.push(cb => historySocketCreate(user, null, "new socket connection", dateConnect, cb));
        historySocketCreateArray.push(cb => historySocketCreate(user, null, "socket disconnection", dateDisconnect, cb));
        historySocketCreateArray.push(cb => historySocketCreate(user, room, "joined the room", dateJoin, cb));
        historySocketCreateArray.push(cb => historySocketCreate(user, room, "has left the room", dateLeft, cb));
    }

    async.parallel(historySocketCreateArray, cb);
}

adminCreate('admin', 'admin');

async.series([
    populateRooms,
    populateHistoryChat,
    populateHistorySocket
],
    // Optional callback
    function (err, results) {
        if (err) {
            console.log('FINAL ERR: ' + err);
        }
        else {
            console.log('Rooms Instances: ' + rooms.length);
            console.log('History Chat Instances: ' + historiesChat.length);
            console.log('History Socket Instances: ' + historiesSocket.length);
        }
        // All done, disconnect from database
        mongoose.connection.close();
    }
);