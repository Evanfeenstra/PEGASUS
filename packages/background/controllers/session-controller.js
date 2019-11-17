import { APP_STATE } from '@pegasus/utils/states'

class SessionController {

  constructor(options) {

    const {
      storageController,
      walletController,
      engine
    } = options

    this.storageController = storageController
    this.walletController = walletController
    this.engine = engine
  }

  startSession() {
    const date = new Date()
    this.storageController.setSession(date.getTime())
    this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
  }

  checkSession() {
    const currentState = this.walletController.getState()

    // transfers queue not empty during an extension hard reload cause show confirm view with 0 transfer 
    // since the transfers are deleted during the hard rel
    if (
      currentState === APP_STATE.WALLET_TRANSFERS_IN_QUEUE &&
      this.engine.getTransfers().length === 0 && !this.password
    ) {
      this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
      return
    }

    if (currentState === APP_STATE.WALLET_TRANSFERS_IN_QUEUE)
      return

    const password = this.walletController.getPassword()

    if (!password && !this.walletController.isWalletSetup()) {
      this.walletController.setState(APP_STATE.WALLET_NOT_INITIALIZED)
      return
    }

    if (!password) {
      this.walletController.setState(APP_STATE.WALLET_LOCKED)
      return
    }

    const time = this.storageController.getSession()
    if (time) {
      const date = new Date()
      const currentTime = date.getTime()
      if (currentTime - time > 900000) { // greather than 15 minutes
        this.storageController.writeToStorage()
        this.walletController.setState(APP_STATE.WALLET_LOCKED)
        return
      }
      this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
      return
    } else { this.password = false }

    if (currentState <= APP_STATE.WALLET_INITIALIZED) {
      return
    } else {
      this.walletController.setState(APP_STATE.WALLET_LOCKED)
      return
    }
  }

  deleteSession() {
    this.storageController.writeToStorage()
    this.storageController.deleteSession()
    this.walletController.setState(APP_STATE.WALLET_LOCKED)
    this.walletController.setPassword(false)
  }
}

export default SessionController