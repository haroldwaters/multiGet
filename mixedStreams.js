const {getContentChunk} = require('./resources/requests');
const {chunkWriteStream} = require('./resources/filework');

let args = JSON.parse(process.argv[2]);

//Write stream will target the blank file created in multiGet.js and begin
//writing at startPos
let writeStream;
try{
    writeStream = chunkWriteStream(args['fileName'], args['startPos'])
}
catch(error){
    console.error('An error occur while creating write stream');
    throw error;
}

//The function generates a http.Get request with a range header defined by
//startPos and chunkSize
getContentChunk(args['target'], args['startPos'],
                args['chunkSize'], args['fileName']).then((response)=>{
    response.pipe(writeStream);
}).catch((error) =>{
    console.error('An occured creating while getting content');
    throw error;
});