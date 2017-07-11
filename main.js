'use strict';

const AWS = require('aws-sdk');
const { argv } = require('yargs');
const path =require('path');
const fs = require('fs');
const saveXlsx = require('./xlsx-generator');
const zlib = require('zlib');

const config = {
  bucket: null,
  credentials: null,
  customerId: null,
  id: null
};
try {
  Object.assign(config, JSON.parse(fs.readFileSync(path.join(process.env.HOME, '.metrics2xlsx'), 'UTF-8')));
} catch(ignore) {
  console.log(`Can't find config file at ${path.join(process.env.HOME, '.metrics2xlsx')}`);
}

if (argv.bucket || argv.b) config.bucket = argv.bucket || argv.b;
if (argv.customerId || argv._[0]) config.customerId = argv.customerId || argv._[0];
if (argv.id || argv._[1]) config.id = argv.id || argv._[1];
const filename = argv.o || argv.out || config.id;
let out = `./${filename}`;
if(path.extname(filename) === '.xlsx')
{
  out = path.normalze(filename.substring(0, filename.length - 5));
}

const { customerId, id } = config;
['customerId', 'id'].forEach(key => {
  if (!config[key]) {
    console.log(`No ${key} found;\nsm2x <customerId> <id>`);
    process.exit();
  }
});

const s3 = new AWS.S3(config.credentials);
const _listAllKeys = (out = []) => new Promise((resolve, reject) => {
  s3.listObjectsV2({
    Bucket: config.bucket,
    MaxKeys: 10,
    Prefix: `${customerId}/${id}`,
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
    Promise.all(data.sort().map(key => new Promise((resolve, reject) => {
      s3.getObject({
        Bucket: config.bucket,
        Key: key
      }, (err, data) => {
        if (err) return reject(err);
        resolve(JSON.parse(zlib.inflateSync(data.Body).toString()));
      });
    })))
      .then(data => {
        if (!data.length) console.log(`No data found for:\ncustomerId = ${customerId}\nid = ${id}`);
        else saveXlsx(`./${out}.xlsx`, data);
      })
      .catch(err => {
        console.log(err);
      });
  })
  .catch(err => {
    console.log(err);
  });
