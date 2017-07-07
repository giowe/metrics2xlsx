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
    Promise.all(data.sort().map(key => new Promise((resolve, reject) => {
      s3.getObject({
        Bucket: config.bucket,
        Key: key
      }, (err, data) => {
        if (err) return reject(err);
        resolve(JSON.parse(data.Body));
      });
    })))
      .then((results) => {
        const times = [];
        const disks = {};
        results.forEach(result => {
          const { time, disk } = result;
          times.push(time);
          disk.forEach(d => {
            if (!disks[d.name]) disks[d.name] = {};
            disks[d.name][time] = {
              available: d.available,
              used: d.used
            };
          });
        });

        const diskCount = Object.keys(disks).length;
        const workbook = excelbuilder.createWorkbook('./', 'sample.xlsx');
        const diskSheet = workbook.createSheet('disk', results.length + 1, diskCount + 3);
        diskSheet.set(1, 1, 'DiskUtilization');
        diskSheet.set(1, diskCount + 2, 'DiskAvailable');

        const dt = [];
        let i = 2;
        times.forEach(t => {
          diskSheet.set(i, 1, t);
          i++;
        });

        workbook.save((ok) => {
          if (!ok) return workbook.cancel();
          console.log('congratulations, your workbook created');
        });
      })
      .catch(err => {
        console.log(err);
      });
  })
  .catch(err => {
    console.log(err);
  });
