const http = require('http');
const { URL } = require('url');
const {writeChunk} = require('./filework');

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

module.exports = {
    getContentChunk: getContentChunk,
    getContentInfo: getContentInfo
}