#!/usr/bin/env node
const crypto = require('crypto');
const read = require('./read.js');
const path = require('path');
const fs = require("fs");

const MODE = {
    S: 0,
    SHOW: 0,
    D: 1,
    DECRYPT: 1,
    E: 2,
    ENCRYPT: 2
}

const executeMode = MODE[process.argv[2].toUpperCase()];
const targetFilePath = path.join(process.cwd(), process.argv[3] || 'default.json');
const targetFile = fs.readFileSync(targetFilePath, 'utf8');

function encrypt(text, password){
    var cipher = crypto.createCipher('aes-256-cbc',password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text, password){
    var decipher = crypto.createDecipher('aes-256-cbc',password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}


const isJSON = (text) => {
    return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
        text.replace(/"(\\.|[^"\\])*"/g, '')));
}
const OutputPasswords = (data) => {
    for (const key in data) {
        const wing = Math.floor(25 - key.length / 2);
        console.log(`${"=".repeat(wing)} ${key} ${"=".repeat(wing)}`);
        console.log(JSON.stringify(data[key], null, 2));
    }
}

const ShowMode = (file, password) => {
    if (!isJSON(file)) file = decrypt(file, password);
    OutputPasswords(JSON.parse(file));
}

const EncryptMode = (file, password) => {
    if (!isJSON(file)) return console.log("Your file looks like already encrypted!");
    fs.writeFileSync(targetFilePath, encrypt(file, password), 'utf8')
}

const DecryptMode = (file, password) => {
    if (isJSON(file)) return console.log("Your file looks like already encrypted!");
    const decryptData = decrypt(file, password);
    if (!isJSON(decryptData)) return console.log("Error! Can't decrypt file");
    fs.writeFileSync(targetFilePath, decryptData, 'utf8')
}


read({
    prompt: "Password: ",
    silent: true
}, (err, password) => {
    switch (executeMode) {
        case MODE.SHOW:
            return ShowMode(targetFile, password);
        case MODE.ENCRYPT:
            return EncryptMode(targetFile, password);
        case MODE.DECRYPT:
            return DecryptMode(targetFile, password);
    }
})