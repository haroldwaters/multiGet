'use strict'

const fs = require('fs');
const async = require('async')
const parser = require('./clargs');
const {getContentChunk, getContentInfo} = require('./requests');
const {makeBlankFile} = require('./filework');

// let target = 'https://httpbin.org/range/1024';
let target = 'http://40ff26ef.bwtest-aws.pravala.com/384MB.jar';

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

let main = async function(){

    let args = parser.parseArgs();

    const target = args['target'];

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
    let downloadDir = './downloads/';
    if(args['name']){
        fileName = downloadDir + args['name']
    }
    else{
        fileName = downloadDir + 'test.txt';
    }

    let startPos = 0;
    let startPositions = [];

    //Create the space to write to by creating a file the same size as what's being downloaded
    makeBlankFile(fileName, parseInt(byteCount));

    //Create a file decriptor for the file made above
    fs.open(fileName, 'w', (err, fd)=> {
        console.time('timeToWrite');

        //Increment startPos by chunkSize and add to startPositions
        //If there is a remainder, it will be added last
        while(startPos < byteCount){
            if( startPos + remainder < byteCount){
                startPositions.push({startPos: startPos, size: chunkSize});
                startPos += chunkSize;
            }
            else{
                startPositions.push({startPos: startPos, size: remainder});
                startPos += remainder;
            }
        }
        async.each(startPositions, (item, callback)=>{
            getContentChunk(target, fd, item.startPos, item.size).then((res)=>{
                callback(null, res);
            }).catch((err)=>{
                callback(err);
            });
        },(err)=>{
            console.timeEnd('timeToWrite');
        });
    });
}

main()
    .then(()=> {return 0;})
    .catch((err)=> {throw err});