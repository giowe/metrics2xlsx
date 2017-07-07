'use strict';

const graph = require('xlsx-chart');
const excelbuilder = require('msexcel-builder');
const xl = require('excel4node');

module.exports = (data) => {
  const times = [];
  const diskData = {};
  const memoryData = {};
  const cpuData = {};
  const networkData = {};

  data.forEach(({ time, disk, memory, cpu, network }, i)=> {
    const { cpu : prevCpu, network : prevNetwork } = i === 0 ? {} : data[i-1];

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

    if (i === 0) return;
    const prevIdle = prevCpu.total.idle + prevCpu.total.iowait;
    const idle = cpu.total.idle + cpu.total.iowait;

    const prevNonIdle = prevCpu.total.user + prevCpu.total.nice + prevCpu.total.system + prevCpu.total.irq + prevCpu.total.softirq + prevCpu.total.steal;
    const nonIdle = cpu.total.user + cpu.total.nice + cpu.total.system + cpu.total.irq + cpu.total.softirq + cpu.total.steal;

    const prevTotal = prevIdle + prevNonIdle;
    const total = idle + nonIdle;

    const totald = total - prevTotal;
    const idled = idle - prevIdle;

    cpuData[time] = (totald - idled) / totald;
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
  memorySheet.cell(2, 1).string('Percentage').style(styles.title);

  const cpuSheet = wb.addWorksheet('Cpu', defaultSheetConfig);
  cpuSheet.cell(1, 1).string('CPUUtilization').style(styles.title);
  cpuSheet.cell(2, 1).string('Percentage').style(styles.title);

  /*const memorySheet = wb.addWorksheet('Memory', defaultSheetConfig);
  memorySheet.cell(1, 1).string('MemoryUtilization').style(styles.title);
  memorySheet.cell(2, 1).string('Percentage').style(styles.title);*/

  times.forEach((t, column) => {
    diskSheet.cell(1, column + 2).date(t).style(styles.title);
    diskSheet.cell(diskCount + 3, column + 2).date(t).style(styles.title);
    diskNames.forEach((diskName, row) => {
      const diskAtTime = diskData[diskName][t];
      diskSheet.cell(row + 2, column + 2).number(parseInt(diskAtTime.used)).style(styles.standard);
      diskSheet.cell(diskCount + row + 4,  column + 2).number(parseInt(diskAtTime.available)).style(styles.standard);
    });

    memorySheet.cell(1, column + 2).date(t).style(styles.title);
    memorySheet.cell(2, column + 2).number(memoryData[t].percentage).style(Object.assign({ numberFormat: '0.00%' }, styles.standard));

    cpuSheet.cell(1, column + 2).date(t).style(styles.title);
    if (cpuData[t]) {
      cpuSheet.cell(2, column + 2).number(cpuData[t]).style(Object.assign({ numberFormat: '0.00%' }, styles.standard));
    } else {
      cpuSheet.cell(2, column + 2).string('NA').style(styles.standard);
    }
  });

  wb.write('sample.xlsx');
  console.log('file saved!');
};
