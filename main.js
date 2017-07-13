'use strict';

const { argv } = require('yargs');
const path =require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const saveXlsx = require('./xlsx-generator');
const formatter = require('system-metrics-formatter');
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
const filename = argv.o || argv.out;
let out = `${config.id}`;
if(filename){
  out = filename;
  if(path.extname(filename) === '.xlsx')
  {
    out = path.normalize(filename.substring(0, filename.length - 5));
  }
}
const { customerId, id } = config;
const s3 = new AWS.S3(config.credentials);

const _listAllKeys = (customerId = null, id = null, out = []) => new Promise((resolve, reject) => {
  let prefix = '';
  if(customerId && id) prefix = `${customerId}/${id}`;
  else if(customerId) prefix = `${customerId}`;
  s3.listObjectsV2({
    Bucket: config.bucket,
    MaxKeys: 10,
    Prefix: prefix,
    StartAfter: out[out.length-1]
  }, (err, data) => {
    if (err) return reject(err);
    data.Contents.forEach(content => {
      out.push(content.Key);
    });
    if (data.IsTruncated) {
      resolve(_listAllKeys(customerId, id, out));
    } else {
      resolve(out);
    }
  });
});

const _listBucket = (customerId = null) => new Promise((resolve, reject) => {
  if(!customerId){
    _listAllKeys()
      .then(keys =>{
        const bucketListed = {};
        keys.forEach(key=>{
          key = key.split('/');
          const customer = key[0];
          const id = key[1];
          if(!(bucketListed[customer])) bucketListed[customer] = {};
          bucketListed[customer][id] = true;
        });
        resolve(bucketListed);
      })
      .catch(error => {
        console.log(error.message);
      });
  }else{
    _listAllKeys(customerId)
      .then(keys =>{
        const customerListed = {};
        keys.forEach(key=>{
          key = key.split('/');
          const id = key[1];
          customerListed[id] = true;
        });
        resolve(customerListed);
      })
      .catch(error => {
        console.log(error.message);
      });
  }
});

if (!config['id']) {
  if(config['customerId']){
    _listBucket(customerId)
      .then(data => {
        console.log('Here are all the possible Id linked to the customer :\n');
        console.log(`${customerId}:`);
        const Ids = Object.keys(data);
        Ids.forEach(Id => console.log(` - ${Id} `));
        process.exit();
      });
  }else{
    _listBucket()
      .then(data => {
        console.log('Here are all the possible combination Customer/Id :\n');
        const Customers = Object.keys(data);
        Customers.forEach(customer => {
          console.log(`${customer}:`);
          const Ids = Object.keys(data[customer]);
          Ids.forEach(Id => console.log(` - ${Id} `));
          console.log();
        });
        process.exit();
      });
  }
}


_listAllKeys(config.customerId, config.id)
  .then(data => {
    return Promise.all(data.sort().map(key => new Promise((resolve, reject) => {
      s3.getObject({
        Bucket: config.bucket,
        Key: key
      }, (err, data) => {
        if (err) return reject(err);
        resolve(JSON.parse(zlib.unzipSync(data.Body).toString()));
      });
    })));
  })
  .then(data => {
    if (!data.length){
      console.log(`No data found for:\ncustomerId = ${customerId}\nid = ${id}\n\n`);
      _listBucket()
        .then(data => {
          console.log('Here are all the possible combination Customer/Id :\n');
          const Customers = Object.keys(data);
          Customers.forEach(customer => {
            console.log(`${customer}:`);
            const Ids = Object.keys(data[customer]);
            Ids.forEach(Id => console.log(` - ${Id} `));
            console.log();
          });
          process.exit();
        });
    } else{
      saveXlsx(`./${out}.xlsx`, formatter(...data));
    }
  })
  .catch(error =>{
    console.log(error.message);
  });

