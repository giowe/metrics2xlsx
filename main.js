'use strict';

const AWS = require('aws-sdk');
const graph = require('xlsx-chart');
const excelbuilder = require('msexcel-builder');
const { argv } = require('yargs');
const path =require('path');
const fs = require('fs');

const config = {
  bucket: null,
  credentials: null
};
try {
  Object.assign(config, JSON.parse(fs.readFileSync(path.join(process.env.HOME, '.metrics2xlsx'), 'UTF-8')));
} catch(ignore) {
  console.log(`Can't find config file at ${path.join(process.env.HOME, '.metrics2xlsx')}`);
}

if (argv.bucket) config.bucket = argv.bucket;

const s3 = new AWS.S3(config.credentials);
const params = {
  Bucket: config.bucket,
  Prefix: argv.group + '/' +argv.m
};


const _listAllKeys = (out = []) => new Promise((resolve, reject) => {
  s3.listObjectsV2({
    Bucket: config.bucket,
    MaxKeys: 10,
    StartAfter: out[out.length-1]
  }, (err, data) => {
    if (err) return reject(err);

    data.Contents.forEach(content => {
      //if (content.LastModificationDate )
      out.push(content.Key);
    });
    if (data.IsTruncated) {
      resolve(_listAllKeys(out));
    } else {
      resolve(out);
    }
  });
});

_listAllKeys()
  .then(data => {
    Promise.all(data.map(key => new Promise((resolve, reject) => {
      s3.getObject({
        Bucket: config.bucket,
        Key: key
      }, (err, data) => {
        if (err) return reject(err);
        resolve(JSON.parse(data.Body));
      });
    })))
      .then((results) => {
        console.log(results);
      })
      .catch(err => {
        console.log(err);
      });
  })
  .catch(err => {
    console.log(err);
  });


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

//listObjects();
