'use strict';

const xl = require('excel4node');

module.exports = (filename, data) => {

  const times = [];
  let diskNames = [];
  const DiskData = {};
  const MemoryData = {};
  const CpuData = {};
  const NetworkData = {};
  let networkNames =[];

  const wb = new xl.Workbook({
    dateFormat: 'd hh:mm:ss'
  });
  const styles = {
    title: wb.createStyle({
      font: {
        bold: true
      },
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: '#bdbdbd'
      },
      border: {
        left: { style: 'thin' },
        right: { style: 'thin' },
        top: { style: 'thin' },
        bottom: { style: 'thin' }
      }
    }),
    standard: wb.createStyle({
      border: {
        left: { style: 'thin' },
        right: { style: 'thin' },
        top: { style: 'thin' },
        bottom: { style: 'thin' }
      }
    }),
    NA: wb.createStyle({
      border: {
        left: { style: 'thin' },
        right: { style: 'thin' },
        top: { style: 'thin' },
        bottom: { style: 'thin' }
      },
      alignment: {
        horizontal: 'right'
      }
    })
  };
  const defaultSheetConfig = {
    sheetFormat: {
      defaultColWidth: 20
    }
  };

  data.forEach(datum => {
    const { time, diskData, memoryData, cpuData, networkData } = datum;
    times.push(time);
    diskNames = Object.keys(diskData);
    diskNames.forEach(diskName =>{
      if (!DiskData[diskName]) DiskData[diskName] = {};
      DiskData[diskName][time] = diskData[diskName];
    });
    MemoryData[time] = memoryData;
    CpuData[time] = cpuData;
    networkNames = Object.keys(networkData);
    networkNames.forEach(networkName =>{
      if (!NetworkData[networkName]) NetworkData[networkName] = {};
      NetworkData[networkName][time] = networkData[networkName];
    });
  });

  const diskSheet = wb.addWorksheet('Disk', defaultSheetConfig);
  const diskCount = diskNames.length;
  diskSheet.cell(1, 1).string('DiskUtilization').style(styles.title);
  diskSheet.cell(diskCount + 3, 1).string('DiskAvailable').style(styles.title);
  diskNames.forEach((diskName, row) => {
    diskSheet.cell(row + 2, 1).string(diskName).style(styles.title);
    diskSheet.cell(diskCount + row + 4, 1).string(diskName).style(styles.title);
  });

  const memorySheet = wb.addWorksheet('Memory', defaultSheetConfig);
  memorySheet.cell(1, 1).string('MemoryUtilization').style(styles.title);
  memorySheet.cell(2, 1).string('Percentage').style(styles.title);

  const cpuSheet = wb.addWorksheet('Cpu', defaultSheetConfig);
  cpuSheet.cell(1, 1).string('CPUUtilization').style(styles.title);
  cpuSheet.cell(2, 1).string('Percentage').style(styles.title);

  const networkSheet = wb.addWorksheet('Network', defaultSheetConfig);
  const networkCount = networkNames.length;
  networkSheet.cell(1, 1).string('BytesIn').style(styles.title);
  networkSheet.cell(networkCount + 3, 1).string('BytesOut').style(styles.title);
  networkNames.forEach((networkName, row) => {
    networkSheet.cell(row + 2, 1).string(networkName).style(styles.title);
    networkSheet.cell(networkCount + row + 4, 1).string(networkName).style(styles.title);
  });

  times.forEach((t, c) => {
    diskSheet.cell(1, c + 2).date(t).style(styles.title);
    diskSheet.cell(diskCount + 3, c + 2).date(t).style(styles.title);
    diskNames.forEach((diskName, r) => {
      const diskAtTime = DiskData[diskName][t];
      diskSheet.cell(r + 2, c + 2).number(diskAtTime.used).style(styles.standard);
      diskSheet.cell(diskCount + r + 4,  c + 2).number(diskAtTime.available).style(styles.standard);
    });

    memorySheet.cell(1, c + 2).date(t).style(styles.title);
    memorySheet.cell(2, c + 2).number(MemoryData[t].percentage).style(Object.assign({ numberFormat: '0.00%' }, styles.standard));

    cpuSheet.cell(1, c + 2).date(t).style(styles.title);
    if (CpuData[t] === 'NA') {
      cpuSheet.cell(2, c + 2).string('NA').style(styles.NA);
    } else {
      cpuSheet.cell(2, c + 2).number(CpuData[t]).style(Object.assign({ numberFormat: '0.00%' }, styles.standard));
    }

    networkSheet.cell(1, c + 2).date(t).style(styles.title);
    networkSheet.cell(networkCount + 3, c + 2).date(t).style(styles.title);
    networkNames.forEach((networkName, row) => {
      const networkAtTime = NetworkData[networkName][t];
      if(networkAtTime.bytesIn === 'NA' && networkAtTime.bytesOut === 'NA'){
        networkSheet.cell(row + 2, c + 2).string('NA').style(styles.NA);
        networkSheet.cell(networkCount + row + 4, c + 2).string('NA').style(styles.NA);
      }else{
        networkSheet.cell(row + 2, c + 2).number(networkAtTime.bytesIn).style(styles.standard);
        networkSheet.cell(networkCount + row + 4,  c + 2).number(networkAtTime.bytesOut).style(styles.standard);
      }
    });
  });

  wb.write(filename);
  console.log(`${filename} saved!`);
};
