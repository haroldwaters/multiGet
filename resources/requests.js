const http = require('http');
const { URL } = require('url');

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
let getContentChunk = function(target, start, size, path){
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

                resolve(res);
                
            });
        });
}

module.exports = {
    getContentChunk: getContentChunk,
    getContentInfo: getContentInfo
}