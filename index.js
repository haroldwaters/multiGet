'use strict'

const http = require('http');
const fs = require('fs');
const { URL } = require('url');

const parser = require('./clargs');

// let target = 'https://httpbin.org/range/1024';
let target = 'http://40ff26ef.bwtest-aws.pravala.com/384MB.jar';


let didFail = function(statusCode){
    return statusCode < 200 && statusCode >= 300;
}

/**
 * @param {String} target 
 * @returns {Promise}
 */
let getContentInfo = function(target){
    const targetURL = new URL(target);
    let options = {
        hostname: targetURL.host,
        path: targetURL.pathname,
        method: 'HEAD'
    };

    return new Promise((resolve, reject)=>{
        http.get(options, (res) => {
            if(didFail(res.statusCode)) reject(new Error('Request Failed'))
            resolve(res);
        })
    });
}

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
 * @param {string} target 
 * @param {FileDescriptor} fd 
 * @param {Int} start 
 * @param {Int} size 
 * @return {Promise}
 */
let getContentChunk = function(target, fd, start, size){
    //Parse the given target so the path can be pulled out
    const targetURL = new URL(target);
    let options = {
        hostname: targetURL.host,
        path: targetURL.pathname,
        method: 'GET',
        headers:{
            Range: `bytes=${start}-${start + size - 1}`
        }
    };
    return new Promise((resolve,reject)=>{
        http.get(options, (res) => {

                let buffers = [];

                if(didFail(res.statusCode)) reject(new Error('Request Failed'))
                res.on('error', (error) => reject(new Error(`Error occured retreiving chunks ${start}-${start + size}`)));
                
                res.on('data', (buffer) => buffers.push(buffer));
                res.on('end', ()=>{
                    
                    writeChunk(fd, start, size, Buffer.concat(buffers)).then((written)=>{
                        resolve(written);
                    })
                    .catch(err => reject(err));
                });
            });
        });
    }

/**
 * @description Returns num2 if num1 is larger else returns num1 
 * @param {int} num1 
 * @param {int} num2 
 */
let checkSize = function(testSize, fileSize){
    if(testSize > fileSize){
        return fileSize;
    }
    else{
        return testSize;
    }

}
//===============================================
let args = parser.parseArgs();

let main = async function(){

    let contentInfo = await getContentInfo(target);
    let contentLength = contentInfo.headers['content-length'];

    if(args['chunksize'] && args['chunks']){
        throw new Error('Chunks and chunksize cannot both be specified!');
    }

    let byteCount;
    if(args['size']){
        //Size shouldn't be allowed to be greater that actual file size
        byteCount = checkSize(args['size'], contentLength);
    }
    else{
        byteCount = contentLength;
    }

    let chunkCount;
    let chunkSize;
    if(args['chunks']){
        //Can't have more chunks than bytes!
        chunkCount = checkSize(args['chunks'], contentLength);
        chunkSize = Math.floor(byteCount/chunkCount);
    }
    else if(args['chunksize']){
        //Larger filesizes than actual filesize are allowed in the request, but for the sake of cleanliness I'll disallow it
        chunkSize = checkSize(args['chunksize'], contentLength);
        chunkCount = Math.floor(byteCount/chunkSize);
    }
    else{
        //If not specified on cl, download entire file in one chunk
        chunkCount = 1;
        chunkSize = byteCount;
    }
    const remainder = byteCount % chunkSize;

    let fileName;
    if(args['filename']){
        fileName = './downloads' + args['filename']
    }
    else{
        fileName = './downloads/test.txt';
    }

    let calls = [];
    let startPos = 0;

    //Create the space to write to by creating a file the same size as what's being downloaded
    fs.writeFileSync(fileName, Buffer.alloc(parseInt(byteCount)))
    //Create a file decriptor for the file just opened
    fs.open(fileName, 'w', (err, fd)=> {
        console.time('main');
        while(startPos < byteCount){
            if( startPos + remainder < byteCount){
                console.log(startPos + ' ' + (chunkSize + startPos));
                calls.push(getContentChunk(target, fd, startPos, chunkSize));
            }
            else{
                console.log(startPos + ' ' + (remainder + startPos));
                calls.push(getContentChunk(target, fd, startPos, remainder));
                startPos += remainder;
            }
            startPos += chunkSize;
        }

        Promise.all(calls).then((values)=>{
            console.timeEnd('main');
        }).catch((err) =>{
            throw err;
        })
    });
}

main();