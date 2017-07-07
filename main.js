'use strict';

const AWS = require('aws-sdk');
const graph = require('xlsx-chart');
const excelbuilder = require('msexcel-builder');
const { argv } = require('yargs');
const path =require('path');
const fs = require('fs');

const config = {};
try {
  Object.assign(config, JSON.parse(fs.readFileSync(path.join(process.env.HOME, '.metrics2xlsx'), 'UTF-8')));
} catch(ignore) {
  console.log(`Can't find config file at ${path.join(process.env.HOME, '.metrics2xlsx')}`);
}

const s3 = new AWS.S3(config);
const params = {
  Bucket: 'sf-system-metrics',
  Prefix: argv.group + '/' +argv.m
};

const _listObjects = () => {
  /*s3.listObjects(params, (err, data) => {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      if(!(data.isTruncated)) ended = true;
      console.log(data);
      data = data.Contents;
      data.forEach(function (value) {
        keys.push(value.Key);
      });
    }
  });*/
};

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
