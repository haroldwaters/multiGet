const fs = require('fs');

/**
 * @description Returns a writeStram to file located at "path" that will begin writing at "start"
 * @param {string} path 
 * @param {int} start 
 * @returns {fs.writeStream}
 */
let chuckWriteStream = function(path, start){
    let options = {
        start: start,
        //      \/ for random write access without truncating
        flags: 'r+'
    }
    return fs.createWriteStream(path, options);
}

/**
 * @description Creates new file of size specified by byteCount
 * @param {string} filePath path to create file at
 * @param {int} byteCount size in bytes of file to create
 */
let makeBlankFile = function(filePath, byteCount){
    //Sync is used here because execution can't continue until
    //the file is done anyways
    fs.writeFileSync(filePath, Buffer.alloc(byteCount));
}

module.exports = {
    chunkWriteStream: chuckWriteStream,
    makeBlankFile : makeBlankFile
}
