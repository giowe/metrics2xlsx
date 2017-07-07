const x = {
  'id': 'matteo-pc-1',
  'time': 1499419646066,
  'cpu': {
  'time': 1499419646065,
    'total': {//<------
    'cpuName': 'cpu',
      'user': '105246',
      'nice': '470',
      'system': '19128',
      'idle': '1179835',
      'iowait': '29733',
      'irq': '0',
      'softirq': '1346',
      'steal': '0',
      'guest': '0',
      'guest_nice': '0'
  },
  'cpus': [
    {
      'cpuName': 'cpu0',
      'user': '27254',
      'nice': '162',
      'system': '5084',
      'idle': '295718',
      'iowait': '6001',
      'irq': '0',
      'softirq': '317',
      'steal': '0',
      'guest': '0',
      'guest_nice': '0'
    },
    {
      'cpuName': 'cpu1',
      'user': '25346',
      'nice': '67',
      'system': '4539',
      'idle': '296562',
      'iowait': '6004',
      'irq': '0',
      'softirq': '595',
      'steal': '0',
      'guest': '0',
      'guest_nice': '0'
    },
    {
      'cpuName': 'cpu2',
      'user': '26452',
      'nice': '73',
      'system': '5224',
      'idle': '294362',
      'iowait': '7182',
      'irq': '0',
      'softirq': '166',
      'steal': '0',
      'guest': '0',
      'guest_nice': '0'
    },
    {
      'cpuName': 'cpu3',
      'user': '26192',
      'nice': '167',
      'system': '4280',
      'idle': '293192',
      'iowait': '10545',
      'irq': '0',
      'softirq': '267',
      'steal': '0',
      'guest': '0',
      'guest_nice': '0'
    }
  ],
    'info': {
    'cores': 4,
      'speed': [
      '1700.000',
      '1700.000',
      '1400.000',
      '2300.000'
    ]
  }
},
  'memory': {
  'time': 1499419646065,
    'MemTotal': '3473712 ',
    'MemFree': '163752 ',//<----
    'MemAvailable': '924956 '//<----
},
  'disk': [
  {
    'name': 'udev',//<-----
    'mountPoint': '/dev',
    'capacity': '0%',
    'used': '0',//<-----
    'available': '1714032'//<-----
  },
  {
    'name': 'tmpfs',
    'mountPoint': '/run',
    'capacity': '2%',
    'used': '6020',
    'available': '341352'
  },
  {
    'name': '/dev/sda7',
    'mountPoint': '/',
    'capacity': '22%',
    'used': '9971028',
    'available': '35369216'
  },
  {
    'name': 'tmpfs',
    'mountPoint': '/dev/shm',
    'capacity': '5%',
    'used': '76200',
    'available': '1660656'
  },
  {
    'name': 'tmpfs',
    'mountPoint': '/run/lock',
    'capacity': '1%',
    'used': '4',
    'available': '5116'
  },
  {
    'name': 'tmpfs',
    'mountPoint': '/sys/fs/cgroup',
    'capacity': '0%',
    'used': '0',
    'available': '1736856'
  },
  {
    'name': '/dev/sda8',
    'mountPoint': '/home',
    'capacity': '4%',
    'used': '2864848',
    'available': '87832944'
  },
  {
    'name': '/dev/sda1',
    'mountPoint': '/boot/efi',
    'capacity': '30%',
    'used': '29434',
    'available': '68870'
  },
  {
    'name': 'tmpfs',
    'mountPoint': '/run/user/1000',
    'capacity': '1%',
    'used': '148',
    'available': '347220'
  },
  {
    'name': '/dev/sr0',
    'mountPoint': '/media/matteo/Komplett',
    'capacity': '100%',
    'used': '269528',
    'available': '0'
  }
],
  'network': [
  {
    'name': 'enp5s0',
    'bytes_in': '0',
    'packets_in': '0',
    'bytes_out': '0',
    'packets_out': '0'
  },
  {
    'name': '',
    'bytes_in': 'lo:',
    'packets_in': '92008',
    'bytes_out': '0',
    'packets_out': '92008'
  },
  {
    'name': 'wlp4s0',
    'bytes_in': '60752175',
    'packets_in': '61334',
    'bytes_out': '5717931',
    'packets_out': '33892'
  }
]
}
