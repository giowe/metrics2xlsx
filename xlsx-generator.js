'use strict';

const xl = require('excel4node');

module.exports = (filename, data) => {
  const times = [];
  const diskData = {};
  const memoryData = {};
  const cpuData = {};
  const networkData = {};

  data.forEach(({ Time, Disks, Memory, Cpu, Network }, i)=> {
    times.push(Time);
    Disks.forEach(d => {
      if (!diskData[d.Name]) diskData[d.Name] = {};
      diskData[d.Name][Time] = {
        available: d.Available,
        used: d.Used
      };
    });

    Network.forEach(n => {
      if (!networkData[n.Name]) networkData[n.Name] = {};
      networkData[n.Name][Time] = {
        bytesIn: n.BytesIn,
        bytesOut: n.BytesOut
      };
    });

    const memoryUtilization = Memory.MemTotal - Memory.MemFree;
    memoryData[Time] = {
      memoryUtilization,
      percentage: memoryUtilization / Memory.MemTotal
    };

    if (i === 0) return cpuData[Time] = 'NA';
    const prevCpuTotal = data[i-1].Cpu.TotalCpuUsage;
    const cpuTotal = Cpu.TotalCpuUsage;
    const prevIdle = prevCpuTotal.Idle + prevCpuTotal.Iowait;
    const idle = cpuTotal.Idle + cpuTotal.Iowait;

    const prevNonIdle = prevCpuTotal.User + prevCpuTotal.Nice + prevCpuTotal.System + prevCpuTotal.Irq + prevCpuTotal.Softirq + prevCpuTotal.Steal;
    const nonIdle = cpuTotal.User + cpuTotal.Nice + cpuTotal.System + cpuTotal.Irq + cpuTotal.Softirq + cpuTotal.Steal;

    const prevTotal = prevIdle + prevNonIdle;
    const total = idle + nonIdle;

    const totald = total - prevTotal;
    const idled = idle - prevIdle;

    cpuData[Time] = (totald - idled) / totald;
  });

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

  const diskSheet = wb.addWorksheet('Disk', defaultSheetConfig);
  const diskNames = Object.keys(diskData);
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
  const networkNames = Object.keys(networkData);
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
      const diskAtTime = diskData[diskName][t];
      diskSheet.cell(r + 2, c + 2).number(diskAtTime.used).style(styles.standard);
      diskSheet.cell(diskCount + r + 4,  c + 2).number(diskAtTime.available).style(styles.standard);
    });

    memorySheet.cell(1, c + 2).date(t).style(styles.title);
    memorySheet.cell(2, c + 2).number(memoryData[t].percentage).style(Object.assign({ numberFormat: '0.00%' }, styles.standard));

    cpuSheet.cell(1, c + 2).date(t).style(styles.title);
    if (cpuData[t] === 'NA') {
      cpuSheet.cell(2, c + 2).string('NA').style(styles.NA);
    } else {
      cpuSheet.cell(2, c + 2).number(cpuData[t]).style(Object.assign({ numberFormat: '0.00%' }, styles.standard));
    }

    networkSheet.cell(1, c + 2).date(t).style(styles.title);
    networkSheet.cell(networkCount + 3, c + 2).date(t).style(styles.title);
    networkNames.forEach((networkName, row) => {
      const networkAtTime = networkData[networkName][t];
      const networkAtTimePre = c === 0 ? null : networkData[networkName][times[c-1]];
      if (networkAtTimePre) {
        if(networkAtTime.bytesIn - networkAtTimePre.bytesIn < 0){
          networkSheet.cell(row + 2, c + 2).string('NA').style(styles.NA);
          networkSheet.cell(networkCount + row + 4, c + 2).string('NA').style(styles.NA);
        }else{
          networkSheet.cell(row + 2, c + 2).number(networkAtTime.bytesIn - networkAtTimePre.bytesIn).style(styles.standard);
          networkSheet.cell(networkCount + row + 4,  c + 2).number(networkAtTime.bytesOut - networkAtTimePre.bytesOut).style(styles.standard);
        }
      } else {
        networkSheet.cell(row + 2, c + 2).string('NA').style(styles.NA);
        networkSheet.cell(networkCount + row + 4, c + 2).string('NA').style(styles.NA);

      }
    });
  });

  wb.write(filename);
  console.log(`${filename} saved!`);
};
