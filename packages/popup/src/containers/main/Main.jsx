import React, { Component } from 'react'
import Home from '../home/Home'
import Login from '../login/Login'
import Init from '../init/Init'
import Restore from '../restore/Restore'
import Confirm from '../confirm/Confirm'
import Connector from '../connector/Connector'
import MessageDuplex from '@pegasus/lib/MessageDuplex'
import { PopupAPI } from '@pegasus/lib/api'
import { APP_STATE } from '@pegasus/lib/states'


class Main extends Component {
  constructor(props, context) {
    super(props, context)

    this.bindDuplexRequests = this.bindDuplexRequests.bind(this)
    this.onSuccessFromInit = this.onSuccessFromInit.bind(this)
    this.onSuccessFromLogin = this.onSuccessFromLogin.bind(this)
    this.onSuccessFromRestore = this.onSuccessFromRestore.bind(this)
    this.onLogout = this.onLogout.bind(this)
    this.onRestore = this.onRestore.bind(this)
    this.onBack = this.onBack.bind(this)
    this.onRejectAll = this.onRejectAll.bind(this)
    this.onAskConfirm = this.onAskConfirm.bind(this)
    this.onNotConfirms = this.onNotConfirms.bind(this)
    this.onPermissionGranted = this.onPermissionGranted.bind(this)
    this.onPermissionNotGranted = this.onPermissionNotGranted.bind(this)

    this.home = React.createRef()
    this.confirm = React.createRef()
    this.connector = React.createRef()

    this.state = {
      appState: APP_STATE.WALLET_WITHOUT_STATE,
      duplex: new MessageDuplex.Popup(),
    }
  }

  async componentDidMount() {
    await PopupAPI.checkSession()
    let state = await PopupAPI.getState()
    if (state >= APP_STATE.WALLET_LOCKED) {
      this.props.showHeader(true)
    }
    if (state >= APP_STATE.WALLET_UNLOCKED) {
      PopupAPI.startHandleAccountData()
    }
    if (state === APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
      this.props.showHeader(false)

    if (state === APP_STATE.WALLET_TRANSFERS_IN_QUEUE)
      this.props.showHeader(false)

    //impossible to load data from the storage until that a user log in
    if (state >= APP_STATE.WALLET_UNLOCKED) {
      const connection = await PopupAPI.getConnection()
      if (connection) {
        if (connection.requestToConnect === true && state >= APP_STATE.WALLET_UNLOCKED) {
          state = APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION 
        }
      }
    }
    
    this.setState({ appState: state })
    this.bindDuplexRequests()
  }

  bindDuplexRequests() {
    this.state.duplex.on('setAppState', appState => {
      this.setState({ appState })
      if (appState > APP_STATE.WALLET_LOCKED)
        this.props.showHeader(true)
      else this.props.showHeader(false)
    })
  }

  async onSuccessFromLogin() {
    PopupAPI.startSession()
    PopupAPI.setState(APP_STATE.WALLET_UNLOCKED)

    const connection = await PopupAPI.getConnection()
    const payments = await PopupAPI.getPayments()
    if (
      (!connection && payments.length > 0) ||
      connection.requestToConnect === true
    ) {
      this.props.showHeader(false)
      PopupAPI.setConnection({
        requestToConnect: true,
        connected: false,
        enabled: false
      })
      this.setState({ appState: APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION })
      PopupAPI.setState(APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
      return
    }
    
    if (payments.length > 0) {
      this.props.showHeader(false)
      this.setState({ appState: APP_STATE.WALLET_TRANSFERS_IN_QUEUE })
      PopupAPI.setState(APP_STATE.WALLET_TRANSFERS_IN_QUEUE)
      this.changePayments(payments)
      return
    } else {
      PopupAPI.closePopup()
      PopupAPI.executeRequests()
    }

    PopupAPI.startHandleAccountData()
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
  }

  async onPermissionGranted() {
    PopupAPI.setConnection({
      requestToConnect: false,
      connected: true,
      enabled: true
    })
    PopupAPI.completeConnection()
    const payments = await PopupAPI.getPayments()
    if (payments.length > 0) {
      this.props.showHeader(false)
      this.setState({ appState: APP_STATE.WALLET_TRANSFERS_IN_QUEUE })
      PopupAPI.setState(APP_STATE.WALLET_TRANSFERS_IN_QUEUE)
      this.changePayments(payments)
      return
    } else {
      PopupAPI.closePopup()
      PopupAPI.executeRequests()
    }
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
  }

  onPermissionNotGranted() {
    PopupAPI.setConnection({
      requestToConnect: false,
      connected: false,
      enabled: false
    })
    PopupAPI.rejectConnection()
  }

  onSuccessFromInit() {
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
    PopupAPI.startHandleAccountData()
    PopupAPI.setState(APP_STATE.WALLET_UNLOCKED)
    PopupAPI.startSession()
  }

  onSuccessFromRestore() {
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
    PopupAPI.setState(APP_STATE.WALLET_UNLOCKED)
    PopupAPI.startHandleAccountData()
    PopupAPI.startSession()
  }

  onLogout() {
    PopupAPI.deleteSession()
    PopupAPI.stopHandleAccountData()
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_LOCKED })
    PopupAPI.setState(APP_STATE.WALLET_LOCKED)
  }

  onRestore() {
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_RESTORE })
    PopupAPI.setState(APP_STATE.WALLET_RESTORE)
  }

  onBack() {
    this.setState({ appState: APP_STATE.WALLET_LOCKED })
    PopupAPI.setState(APP_STATE.WALLET_LOCKED)
  }

  onRejectAll() {
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
    PopupAPI.rejectAllPayments()
  }

  onNotConfirms() {
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
  }

  //duplex function
  changePayments(payments) {
    this.confirm.current.changePayments(payments)
  }

  setConfirmationLoading(isLoading) {
    this.confirm.current.setConfirmationLoading(isLoading)
  }

  setConfirmationError(error) {
    this.confirm.current.setConfirmationError(error)
  }

  onAskConfirm() {
    this.props.showHeader(false)
    this.setState({ appState: APP_STATE.WALLET_TRANSFERS_IN_QUEUE })
    PopupAPI.setState(APP_STATE.WALLET_TRANSFERS_IN_QUEUE)
  }

  //add network
  addCustomNetwork() {
    this.home.current.addCustomNetwork()
  }

  render() {
    switch (this.state.appState) {
      case APP_STATE.WALLET_NOT_INITIALIZED:
        return <Init onSuccess={this.onSuccessFromInit} />
      case APP_STATE.WALLET_LOCKED:
        return <Login onSuccess={this.onSuccessFromLogin}
                  onRestore={this.onRestore} />
      case APP_STATE.WALLET_RESTORE:
        return <Restore network={this.props.network} 
                  onSuccess={this.onSuccessFromRestore}
                  onBack={this.onBack}/>
      case APP_STATE.WALLET_UNLOCKED:
        return <Home ref={this.home} 
                  account={this.props.account} 
                  network={this.props.network} 
                  onLogout={this.onLogout} 
                  onAskConfirm={this.onAskConfirm}/>
      case APP_STATE.WALLET_TRANSFERS_IN_QUEUE:
        return <Confirm ref={this.confirm} 
                  onNotConfirms={this.onNotConfirms}
                  onRejectAll={this.onRejectAll} />
      case APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION:
        return <Connector ref={this.connector} 
                  onPermissionGranted={this.onPermissionGranted}
                  onPermissionNotGranted={this.onPermissionNotGranted} />
      default:
        return ''
    }
  }
}

export default Main