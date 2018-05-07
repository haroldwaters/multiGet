const fs = require('fs');

/**
 * 
 * @param {FileDescriptor} fd 
 * @param {Int} start 
 * @param {Int} size 
 * @param {Buffer} buffer 
 */
let writeChunk = function(fd, start, size, buffer){
    //This function does a random write to the file belonging to fd
    //write begins at start, and continues for length size
    return new Promise((resolve, reject) => {
        fs.write(fd, buffer, 0, size, start, (err, written)=>{
            if(err) reject(err);
            resolve(written);
        });
    });

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
    writeChunk: writeChunk,
    makeBlankFile : makeBlankFile
}