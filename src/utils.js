/**
 * Created by root on 2/21/17.
 */
//var apiai = require('apiai');
var Promise = require("bluebird");
var apiAi = Promise.promisifyAll(require('apiai'));
module.exports = {
    getContent: function(param) {
        var options = {
            host: "https://api.api.ai/",
            path: "/v1/query?v=2015091&langen&sessionId=something&query="+param,
            method: "GET",
            headers: {
                "Authorization": "Bearer 77a1d2e2e92c4e86abfe74515392b6fd"
            }
        };
        // return new pending promise
        return new Promise((resolve, reject) => {
            // select http or https module, depending on reqested url
            const lib = require('https');
            const request = lib.request(options, (response) => {
                // handle http errors
                if (response.statusCode < 200 || response.statusCode > 299) {
                    reject(new Error('Failed to load page, status code: ' + response.statusCode));
                }
                // temporary data holder
                const body = [];
                // on every content chunk, push it to the data array
                response.on('data', (chunk) => body.push(chunk));
                // we are done, resolve promise with those joined chunks
                response.on('end', () => resolve(body.join('')));
            });
            // handle connection errors of the request
            request.on('error', (err) => reject(err))
        })
    },

    getApiAiContent: function (param){
        return new Promise((resolve, reject) => {
            var app = apiAi("77a1d2e2e92c4e86abfe74515392b6fd");

            var request = app.textRequest(param, {
                sessionId: 'something'
            });

            request.on('response', function(response) {
                console.log(response);
                //return response.result.fulfillment.speech;
                resolve(response);
            });

            request.on('error', function(error) {
                console.log(error);
                reject(error);
            });

            request.end();
        });
    }
};