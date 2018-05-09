'use strict'

const parser = require('./resources/clargs');
const {getContentInfo} = require('./resources/requests');
const {makeBlankFile} = require('./resources/filework');
const {fork} = require('child_process');

/**
 * @description Returns num2 if num1 is larger else returns num1 
 * @param {int} num1 
 * @param {int} num2 
 * @returns {int}
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
        3) Pass target, start points, chunk sizes to a forked process 
           that will fetch and write the data for each chunk
        4) Say goodbye
*/
let main = async function(){

    let args = parser.parseArgs();

    const target = args['target'];

    //This function makes a HEAD request to the target to get the actual file size
    //this will be used to check requested download size
    let contentLength;
    try{
        let contentInfo = await getContentInfo(target);
        contentLength = contentInfo.headers['content-length'];
    }
    catch (error) {
        console.error("An error occured during head request, defaulting to requested file size");
        contentLength = args['size'];
    }

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
        //If not specified on cli, download entire file in one chunk
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


    try{
        //Create the space to write to by creating a file the same size as what's being downloaded
        makeBlankFile(fileName, parseInt(byteCount));
    }
    catch(error){
        console.error('An error ocurred during dummy file creation');
        throw error;
    }

    console.time('Elapsed Time:');

    //The downloads and writes will be handled by mixedStreams
    //Increment startPos by chunkSize and add to startPositions
    //If there is a remainder, it will be added to the end
    let startPos = 0;
    let forks = [];
    try{
        for(startPos = 0; startPos < byteCount - remainder; startPos += chunkSize){

            fork('./mixedStreams.js',[JSON.stringify({target: target, 
                                                      startPos: startPos,
                                                      chunkSize: chunkSize,
                                                      fileName :fileName})]);
        }
        if(remainder){
            fork('./mixedStreams.js',[JSON.stringify({target: target, 
                                                      startPos: startPos,
                                                      chunkSize: remainder,
                                                      fileName :fileName})]);
        }
    }
    catch(error){
        console.error('An error occured while creating read/write streams');
        throw error;
    }

    //This is only here to end the timer, and to say goodbye which is both important and polite
    process.on('beforeExit',()=>{
        console.log('Download complete!');
        console.timeEnd('Elapsed Time:');
    })
}

main()
    .then(()=> {return 0;})
    .catch((err)=> {throw err;});