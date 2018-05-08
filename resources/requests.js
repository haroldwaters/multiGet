const http = require('http');
const { URL } = require('url');

/**
 * @description Returns false if status code is not in the 200-299 range
 * @param {int} statusCode 
 * @returns {Boolean}
 */
let didFail = function(statusCode){
    return statusCode < 200 && statusCode >= 300;
}

/**
 * @description Resolves to an http.IncomingMessage readStream that will contain header information from the target URL
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
 * @description Resolves to an http.IncomingMessage readStream that will contain content in the given range to the target URL
 * @param {string} target 
 * @param {Int} start 
 * @param {Int} size 
 * @param {string} path
 * @returns {Promise}
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
            if(didFail(res.statusCode)) reject(new Error('Request Failed'))
            resolve(res);
        });
    });
}

module.exports = {
    getContentChunk: getContentChunk,
    getContentInfo: getContentInfo
}