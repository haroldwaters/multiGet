const fs = require('fs');

/**
 * 
 * @param {FileDescriptor} fd 
 * @param {Int} start 
 * @param {Int} size 
 * @param {Buffer} buffer 
 */
let writeChunk = function(fd, start, size, buffer){

    return new Promise((resolve, reject) => {
        fs.write(fd, buffer, 0, size, start, (err, written, string)=>{
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
    fs.writeFileSync(filePath, Buffer.alloc(byteCount));
}

module.exports = {
    writeChunk: writeChunk,
    makeBlankFile : makeBlankFile
}