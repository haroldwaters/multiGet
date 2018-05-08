const fs = require('fs');

/**
 * 
 * @param {string} path 
 * @param {int} start 
 */
let chuckWriteStream = function(path, start){
    //Returns a writeStream to a file at "Path" that will begin writing at "start"
    let options = {
        start: start,
        flags: 'r+'
    }

    return fs.createWriteStream(path, options);
}

/**
 * 
 * @param {string} filePath path to create file at
 * @param {int} byteCount size in bytes of file to create
 */
let makeBlankFile = function(filePath, byteCount){
    //Create a new file and fill it to require size
    //Sync is used here because execution can't continue until
    //the file is done anyways
    fs.writeFileSync(filePath, Buffer.alloc(byteCount));
}

module.exports = {
    chunkWriteStream: chuckWriteStream,
    makeBlankFile : makeBlankFile
}
