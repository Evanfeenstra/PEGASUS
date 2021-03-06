import React from 'react'
import Switch from 'react-switch'
import ReactTooltip from 'react-tooltip'
import OutlinedInput from '../../../components/outlinedInput/OutlinedInput'

class TransactionsSettings extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.handleChange = this.handleChange.bind(this)

    this.state = {
      settings: {
        autoPromotion: {
          enabled: false,
          time: 0
        },
        autoReattachment: {
          enabled: false,
          time: 0
        }
      }
    }
  }

  async componentWillMount() {
    const settings = await this.props.background.getSettings()
    if (!settings) return

    this.setState({ settings })
  }

  handleChange(settings, action) {
    this.setState({ settings })

    if (action === 'promote') {
      if (settings.autoPromotion.enabled && settings.autoPromotion.time > 0) {
        this.props.background.enableTransactionsAutoPromotion(
          this.state.settings.autoPromotion.time * 1000 * 60
        )
      } else if (
        !settings.autoPromotion.enabled ||
        settings.autoPromotion.time === 0
      ) {
        if (settings.autoPromotion.time > 15) settings.autoPromotion.time = 0
        this.props.background.disableTransactionsAutoPromotion()
      }
    }

    if (action === 'reattach') {
      if (
        settings.autoReattachment.enabled &&
        settings.autoReattachment.time > 0
      ) {
        this.props.background.enableTransactionsAutoReattachment(
          this.state.settings.autoReattachment.time * 1000 * 60
        )
      } else if (
        !settings.autoReattachment.enabled ||
        settings.autoReattachment.time === 0
      ) {
        if (settings.autoReattachment.time > 20)
          settings.autoReattachment.time = 0
        this.props.background.disableTransactionsAutoReattachment()
      }
    }

    this.props.background.setSettings(settings)
  }

  render() {
    return (
      <React.Fragment>
        <div className="row mt-2">
          <ReactTooltip />
          <div
            className="col-9 text-xs my-auto text-dark-gray"
            data-tip="Promote all transactions pending from the specified number of seconds"
          >
            <i className="fa fa-info-circle mr-05" />
            Enable auto promotion
          </div>
          <div className="col-3 text-right">
            <Switch
              checked={this.state.settings.autoPromotion.enabled}
              onChange={() => {
                this.handleChange(
                  {
                    ...this.state.settings,
                    autoPromotion: {
                      enabled:
                        this.state.settings.autoPromotion.time > 15
                          ? !this.state.settings.autoPromotion.enabled
                          : false,
                      time: this.state.settings.autoPromotion.time
                    }
                  },
                  'promote'
                )
              }}
              onColor="#00008b"
              handleDiameter={30}
              uncheckedIcon={false}
              checkedIcon={false}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={20}
              width={48}
              className="react-switch"
            />
          </div>
        </div>
        <div className="row mt-05">
          <div className="col-12">
            <OutlinedInput
              value={this.state.settings.autoPromotion.time}
              onChange={e =>
                this.handleChange({
                  ...this.state.settings,
                  autoPromotion: {
                    enabled:
                      e.target.value > 15
                        ? this.state.settings.autoPromotion.enabled
                        : false,
                    time: e.target.value
                  }
                })
              }
              label="minutes"
              id="auto-prom-sec"
              type="number"
            />
          </div>
        </div>
        <div className="row mt-05">
          <div className="col-12 text-xxxs text-gray">
            (Must be greater than 15 minutes)
          </div>
        </div>

        <hr className="mt-2 mb-2" />

        <div className="row mt-2">
          <ReactTooltip />
          <div
            className="col-9 text-xs my-auto text-dark-gray"
            data-tip="Enable transactions auto reattachment every a specified number of minutes"
          >
            <i className="fa fa-info-circle mr-05" />
            Enable auto reattachment
          </div>
          <div className="col-3 text-right">
            <Switch
              checked={this.state.settings.autoReattachment.enabled}
              onChange={() => {
                this.handleChange(
                  {
                    ...this.state.settings,
                    autoReattachment: {
                      enabled:
                        this.state.settings.autoReattachment.time > 20
                          ? !this.state.settings.autoReattachment.enabled
                          : false,
                      time: this.state.settings.autoReattachment.time
                    }
                  },
                  'reattach'
                )
              }}
              onColor="#00008b"
              handleDiameter={30}
              uncheckedIcon={false}
              checkedIcon={false}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={20}
              width={48}
              className="react-switch"
            />
          </div>
        </div>
        <div className="row mt-05">
          <div className="col-12">
            <OutlinedInput
              value={this.state.settings.autoReattachment.time}
              onChange={e =>
                this.handleChange({
                  ...this.state.settings,
                  autoReattachment: {
                    enabled:
                      e.target.value > 20
                        ? this.state.settings.autoReattachment.enabled
                        : false,
                    time: e.target.value
                  }
                })
              }
              label="minutes"
              id="auto-prom-sec"
              type="number"
            />
          </div>
        </div>
        <div className="row mt-05">
          <div className="col-12 text-xxxs text-gray">
            (Must be greater than 20 minutes)
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default TransactionsSettings
