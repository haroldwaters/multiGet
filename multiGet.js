'use strict'

const fs = require('fs');
const async = require('async')
const parser = require('./resources/clargs');
const {getContentChunk, getContentInfo} = require('./resources/requests');
const {makeBlankFile} = require('./resources/filework');

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

/*
    Main follows these basic steps
        1) Parse args and determine fileSize, chunkCount, and chunkSize
        2) Create a blank file with size equal to fileSize
        3) Determine starting positions and lenthgs to each write needed
        4) Run the writes in parallel
        5) End!
*/
let main = async function(){

    let args = parser.parseArgs();

    const target = args['target'];

    let contentInfo = await getContentInfo(target);
    let contentLength = contentInfo.headers['content-length'];

    if(args['chunksize'] && args['chunks']){
        throw new Error('Chunks and chunksize cannot both be specified!');
    }

    //bytecount determines how much is to be downloaded
    let byteCount;
    if(args['size']){
        //Size shouldn't be allowed to be greater that actual file size
        byteCount = checkSize(args['size'], contentLength);
    }
    else{
        byteCount = contentLength;
    }

    //chunkCount and chunkSize determine how many chunks are to be downloaded and how big each is, respectively
    //it is important to note that only one can be specified by the user
    //I went with Math.floor instead of a bitwise operation here because it easier to read and there's not a bottle neck here
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
    //The last chunk will be the size of the remainder if it's greater than zero
    const remainder = byteCount % chunkSize;

    let fileName;
    let downloadDir = './downloads/';
    if(args['name']){
        fileName = downloadDir + args['name']
    }
    else{
        fileName =downloadDir + target.split('/').slice(-1)[0];
    }

    let startPos = 0;
    let startPositions = [];

    //Create the space to write to by creating a file the same size as what's being downloaded
    makeBlankFile(fileName, parseInt(byteCount));

    console.time('Elapsed Time:');

    //Increment startPos by chunkSize and add to startPositions
    //If there is a remainder, it will be added last
    for(startPos = 0; startPos < byteCount - remainder; startPos += chunkSize){
        startPositions.push({startPos: startPos, size: chunkSize});
    }
    if(remainder){
        startPositions.push({startPos: startPos, size: remainder});
    }
    //There were 3 iterations (one before this, visible in git history, and one after, not visible) of this part
    //Originally the calls were made with a promise and resolved with Promise.all(), but that didn't show any real
    //improvement as chunkCount increased. The third version involved forking and increased the complexity
    //of the operation for little benefit. The async module used here is the Goldilocks of ease-of-use and performance
    //from my testing.
    async.each(startPositions, (item, callback)=>{
        getContentChunk(target, item.startPos, item.size, fileName).then((res)=>{
            callback(null, res);
        }).catch((err)=>{
            callback(err);
        });
    },(err)=>{
        console.timeEnd('Elapsed Time:');
    });
}

main()
    .then(()=> {return 0;})
    .catch((err)=> {throw err});