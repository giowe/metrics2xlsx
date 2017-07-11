'use strict';

const { argv } = require('yargs');
const path =require('path');
const fs = require('fs');
const saveXlsx = require('./xlsx-generator');
const formatter = require('system-metrics-formatter');

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

formatter(config.bucket, config.customerId, config.id, config.credentials.accessKeyId, config.credentials.secretAccessKey, config.credentials.region)
  .then(data => {
    saveXlsx(`./${out}.xlsx`, data);
  })

  .catch(error =>{
    console.log(error.message);
  });

