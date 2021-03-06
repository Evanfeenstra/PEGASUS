const options = {
  networks: [
    {
      name: 'nodes.thetangle.org',
      provider: 'https://nodes.thetangle.org:443',
      link: 'https://thetangle.org/',
      type: 'mainnet',
      difficulty: 14,
      default: true
    },
    {
      name: 'comnet.thetangle.org',
      provider: 'https://nodes.comnet.thetangle.org:443',
      link: 'https://comnet.thetangle.org/',
      type: 'comnet',
      difficulty: 10,
      default: true
    },
    {
      name: 'nodes.devnet.iota.org',
      provider: 'https://nodes.devnet.iota.org',
      link: 'https://devnet.thetangle.org/',
      type: 'devnet',
      difficulty: 9,
      default: true
    },
    {
      name: 'trinity.iota-tangle.io',
      provider: 'http://trinity.iota-tangle.io:14265',
      link: 'https://thetangle.org/',
      type: 'mainnet',
      difficulty: 14,
      default: true
    }
  ]
}

export default options
