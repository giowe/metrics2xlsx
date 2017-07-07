'use strict';

const AWS = require('aws-sdk');
const graph = require('xlsx-chart');
const excelbuilder = require('msexcel-builder');
const { argv } = require('yargs');
const path =require('path');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('/home/zanni/.smtx', 'UTF-8'));
let keys = [];
let ended = false;

const s3 = new AWS.S3(config);
let params = {
    Bucket: "sf-system-metrics",
    Prefix: argv.group + "/" +argv.m,
};

function listObjects(){
    s3.listObjects(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            if(!(data.isTruncated)) ended = true;
            console.log(data);
            data = data.Contents;
            data.forEach(function (value) {
                keys.push(value.Key)
            });
        }
    });
}

/*Promise.all(
    keys.map(
        (key, index) =>
            new Promise(resolve => {
                //s3.getObject(<bucket, key>, (err, data) => {
                // if (err) return reject(err)
                // return resolve(data)
                //})
                resolve(responses[index])
            })
    )
)
    .then(array => {
        // L'array te lo torna ordinato come tu hai messo i parametri
        let output = {};
        array.forEach(file => {
            Object.keys(file).map(key => {
                if (!output.hasOwnProperty(key)) {
                    output[key] = []
                }
                output[key].push(file[key])
            })
        });
        console.log(output)
    })
    .catch(error => {
        console.log(error)
    });*/

listObjects();
























