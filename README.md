# metrics2xlsx

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Dependency Status][dependencies-image]][dependencies-url] [![Gandalf  Status][gandalf-image]][gandalf-url]

[npm-url]: https://www.npmjs.com/package/metrics2xlsx
[npm-image]: http://img.shields.io/npm/v/metrics2xlsx.svg?style=flat
[downloads-image]: https://img.shields.io/npm/dm/metrics2xlsx.svg?style=flat-square
[dependencies-image]: https://david-dm.org/giowe/metrics2xlsx.svg
[dependencies-url]: href="https://david-dm.org/giowe/metrics2xlsx
[gandalf-url]: https://www.youtube.com/watch?v=Sagg08DrO5U
[gandalf-image]: http://img.shields.io/badge/gandalf-approved-61C6FF.svg

## What is metrics2xlsx?

metrics2xlsx is a tool that allows you to convert system metrics files uploded on S3 into a .xlsx file.
To collect those data we recommend using the npm module [system-metrics-collector](https://www.npmjs.com/package/system-metrics-collector) available even in GO language at this [link](https://github.com/giowe/system-metrics-collector/tree/go) (if you want a compiled version)

## How to use it

You can install metrics2xlsx globally running:  
``$ npm install -g metrics2xlsx``

### Configuration

Before starting using metrics2xlsx you have to create a configuration file called ```.metrics2xlsx``` in your Home folder.  
This file is structured like this:
```
{
        "credentials":{
                "accessKeyId" : "yourAccessKeyId",
                "secretAccessKey": "yourSecretAccessKey",
                "region": "yourRegion"
        },
        "bucket": "yourBucket"
}
```

### Running
  If you have metrics2xlsx installed globally you can start it running:  
  ```$ m2x <CustomerId> <Id> ```

  This will generate a file .xlsx in your current working directory, named `<Id>.xlsx`,
  containing one sheet for each metric

#### Flags
   - ```-o``` or ```--out``` change the name and path in which you would like to save the file
   - ```-b``` or ```--bucket``` sets your bucket (overwrites the config file)
   
#### Data
  I recommend the npm module [system-metrics-collector](https://www.npmjs.com/package/system-metrics-collector) available even in GO language at this [link](https://github.com/giowe/system-metrics-collector/tree/go) (if you want a compiled version) to collect such metrics and put them on an S3 bucket;
  On the S3 bucket you have to put a Gzipped file named: ``<CustomerId>/<Id>/<CustomerId>_<Id>_<UnixTime>``
  
  Structured like this:
  ```
  {
    "Time": 1499680866,
    "Cpu": {
      "TotalCpuUsage": {
        "CpuName": "cpu",
        "User": 41969,
        "Nice": 270,
        "System": 7609,
        "Idle": 704945,
        "Iowait": 31409,
        "Irq": 0,
        "Softirq": 1135,
        "Steal": 0,
        "Guest": 0,
        "GuestNice": 0
      }
    },
    "Memory": {
      "MemTotal": 3473712,
      "MemFree": 110332,
      "MemAvailable": 942664
    },
    "Disks": [
      {
        "Name": "/dev/disk0s2",
        "MountPoint": "/",
        "Capacity": 15,
        "Used": 36566132,
        "Available": 212397356
      },
      {
        "Name": "/dev/disk1s2",
        "MountPoint": "/Volumes/+è",
        "Capacity": 19,
        "Used": 112448544,
        "Available": 511843712
      }
    ],
    "Network": [
      {
        "Name": "enp5s0",
        "BytesIn": 0,
        "PacketsIn": 0,
        "BytesOut": 0,
        "PacketsOut": 0
      },
      {
        "Name": "lo",
        "BytesIn": 45933,
        "PacketsIn": 565,
        "BytesOut": 45933,
        "PacketsOut": 565
      },
      {
        "Name": "wlp4s0",
        "BytesIn": 197285671,
        "PacketsIn": 136480,
        "BytesOut": 7569366,
        "PacketsOut": 70109
      }
    ]
  }
  ```
  
## People

- [Giovanni Bruno](https://github.com/giowe) - [Soluzioni Futura](https://www.soluzionifutura.it/)
- [Emanuele Zanni](https://github.com/zanni99)

## License
MIT
