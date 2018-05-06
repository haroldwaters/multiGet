'use strict'

const http = require('http');
const fs = require('fs');
const { URL } = require('url');

const parser = require('./clargs');

// let target = 'https://httpbin.org/range/1024';
let target = 'http://40ff26ef.bwtest-aws.pravala.com/384MB.jar';


/**
 * @param {String} target 
 * @returns {Promise}
 */
let getContentLengthReq = function(target){
    const targetURL = new URL(target);
    let options = {
        hostname: targetURL.host,
        path: targetURL.pathname,
        method: 'HEAD'
    };

    return new Promise((resolve, reject)=>{
        http.get(options, (res) => {
            if(res.statusCode !== 200) reject(new Error('Request Failed'))
            resolve(res.headers['content-length']);
        })
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

                if(res.statusCode !== 206) reject(new Error('Request Failed'))
                res.on('error', (error) => reject(new Error(`Error occured retreiving chunks ${start}-${start + size}`)));
                
                res.on('data', (buffer) => buffers.push(buffer));
                res.on('end', ()=>{
                    
                    fs.write(fd, Buffer.concat(buffers), 0, size, start, (err, written, string)=>{
                        resolve(written);
                    });
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
    let contentLength = await getContentLengthReq(target);

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
        //Larger filesize are allowed in the request, but for the sake on cleanliness I'll disallow it
        chunkSize = checkSize(args['chunksize'], contentLength);
        chunkCount = Math.floor(byteCount/chunkSize);
    }
    const remainder = byteCount % chunkSize;

    let calls = [];
    let startPos = 0;
    let fileName = './downloads/test.txt';

    await fs.writeFile(fileName, Buffer.alloc(parseInt(byteCount)));

    fs.open(fileName, 'w', (err, fd)=> {
        console.time('main');
        while(startPos < byteCount){
            if( startPos + remainder < byteCount){
                console.log(startPos + ' ' + (chunkSize + startPos));
                calls.push(getContentChunk(target, fd, startPos, chunkSize));
            }
            else{
                console.log(startPos + ' ' + (chunkSize + startPos));
                calls.push(getContentChunk(target, fd, startPos, remainder));
                startPos += remainder;
            }
            startPos += chunkSize;
        }

        Promise.all(calls).then((values)=>{
            console.timeEnd('main');
        })
    });
    return 0;
}

main();