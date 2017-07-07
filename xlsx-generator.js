'use strict';

const graph = require('xlsx-chart');
const excelbuilder = require('msexcel-builder');
const xl = require('excel4node');

module.exports = (data) => {
  const times = [];
  const disks = {};

  data.forEach(result => {
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

  const diskNames = Object.keys(disks);
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
    })
  };
  const defaultSheetConfig = {
    sheetFormat: {
      defaultColWidth: 15
    }
  };
  //const workbook = excelbuilder.createWorkbook('./', 'sample.xlsx');

  const diskSheet = wb.addWorksheet('Disk', defaultSheetConfig);
  //const diskSheet = workbook.createSheet('disk', data.length + 1, diskCount * 2 + 3);

  /*diskSheet.width(1, 14);
  diskSheet.set(1, 1, 'DiskUtilization');
  diskSheet.font(1, 1, { bold: true });
  diskSheet.set(1, diskCount + 3, 'DiskAvailable');
  diskSheet.font(1, diskCount + 3, { bold: true });*/

  diskSheet.cell(1, 1).string('DiskUtilization').style(styles.title);
  diskSheet.cell(diskCount + 3, 1).string('DiskAvailable').style(styles.title);

  diskNames.forEach((diskName, row) => {
    diskSheet.cell(row + 2, 1).string(diskName).style(styles.title);
    diskSheet.cell(diskCount + row + 4, 1).string(diskName).style(styles.title);
  });

  times.forEach((t, column) => {
    diskSheet.cell(1, column + 2).date(t).style(styles.title);
    diskSheet.cell(diskCount + 3, column + 2).date(t).style(styles.title);

    diskNames.forEach((diskName, row) => {
      const diskAtTime = disks[diskName][t];
      diskSheet.cell(row + 2, column + 2).number(parseInt(diskAtTime.used)).style(styles.standard);
      diskSheet.cell(diskCount + row + 4,  column + 2).number(parseInt(diskAtTime.available)).style(styles.standard);
    });
  });

  wb.write('sample.xlsx');
  console.log('file saved!');
};
