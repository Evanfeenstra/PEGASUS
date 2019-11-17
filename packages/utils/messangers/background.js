export default {

  init (duplex) {
    this.duplex = duplex
  },

  setTransfers (transfers) {
    this.duplex.send('popup', 'setTransfers', transfers, false)
  },

  setNetworks (networks) {
    this.duplex.send('popup', 'setNetworks', networks, false)
  },

  setNetwork (network) {
    this.duplex.send('popup', 'setNetwork', network, false)
  },

  setConfirmationLoading(loading) {
    this.duplex.send('popup', 'setConfirmationLoading', loading, false)
  },

  setConfirmationError (error) {
    this.duplex.send('popup', 'setConfirmationError', error, false)
  },

  setAccount (account) {
    this.duplex.send('popup', 'setAccount', account, false)
  },

  newMamData (data) {
    this.duplex.send('popup', 'newMamData', data, false)
  },

  setAddress (address) {
    this.duplex.send('tab', 'tunnel', {
      action: 'setAddress',
      data: address
    }, false)
  },

  setProvider (provider) {
    this.duplex.send('tab', 'tunnel', {
      action: 'setProvider',
      data: provider
    }, false)
  },

  setAppState (state) {
    this.duplex.send('popup', 'setAppState', state, false)
  }
}
