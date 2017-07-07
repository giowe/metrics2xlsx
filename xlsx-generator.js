'use strict';

const graph = require('xlsx-chart');
const excelbuilder = require('msexcel-builder');
const xl = require('excel4node');

module.exports = (data) => {
  const times = [];
  const diskData = {};
  const memoryData = {};

  data.forEach(result => {
    const { time, disk, memory } = result;
    times.push(time);
    disk.forEach(d => {
      if (!diskData[d.name]) diskData[d.name] = {};
      diskData[d.name][time] = {
        available: d.available,
        used: d.used
      };
    });

    const memoryUtilization = memory.MemTotal - memory.MemFree - memory.MemAvailable;
    memoryData[time] = {
      memoryUtilization,
      percentage: memoryUtilization / memory.MemTotal
    };
  });

  const diskNames = Object.keys(diskData);
  const diskCount = diskNames.length;

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
    percentage: wb.createStyle({
      border: {
        left: { style: 'thin' },
        right: { style: 'thin' },
        top: { style: 'thin' },
        bottom: { style: 'thin' }
      },
      numberFormat: '0.00%'
    })
  };
  const defaultSheetConfig = {
    sheetFormat: {
      defaultColWidth: 20
    }
  };

  const diskSheet = wb.addWorksheet('Disk', defaultSheetConfig);
  diskSheet.cell(1, 1).string('DiskUtilization').style(styles.title);
  diskSheet.cell(diskCount + 3, 1).string('DiskAvailable').style(styles.title);
  diskNames.forEach((diskName, row) => {
    diskSheet.cell(row + 2, 1).string(diskName).style(styles.title);
    diskSheet.cell(diskCount + row + 4, 1).string(diskName).style(styles.title);
  });

  const memorySheet = wb.addWorksheet('Memory', defaultSheetConfig);
  memorySheet.cell(1, 1).string('MemoryUtilization').style(styles.title);

  times.forEach((t, column) => {
    diskSheet.cell(1, column + 2).date(t).style(styles.title);
    diskSheet.cell(diskCount + 3, column + 2).date(t).style(styles.title);
    diskNames.forEach((diskName, row) => {
      const diskAtTime = diskData[diskName][t];
      diskSheet.cell(row + 2, column + 2).number(parseInt(diskAtTime.used)).style(styles.standard);
      diskSheet.cell(diskCount + row + 4,  column + 2).number(parseInt(diskAtTime.available)).style(styles.standard);
    });

    memorySheet.cell(1, column + 2).date(t).style(styles.title);
    memorySheet.cell(2, column + 2).number(memoryData[t].percentage).style(styles.percentage);
  });

  wb.write('sample.xlsx');
  console.log('file saved!');
};
