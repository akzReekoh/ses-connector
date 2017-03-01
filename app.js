'use strict'

let reekoh = require('reekoh')
let _plugin = new reekoh.plugins.Connector()
let async = require('async')
let isArray = require('lodash.isarray')
let isEmpty = require('lodash.isempty')
let isPlainObject = require('lodash.isplainobject')
let SES = null

let sendData = (data, callback) => {
  if (isEmpty(data.sender)) {
    data.sender = _plugin.config.defaultSender
  }

  if (isEmpty(data.receiver)) {
    data.receiver = [_plugin.config.defaultReceiver]
  }

  if (isEmpty(data.messageHtml)) {
    data.messageHtml = _plugin.config.defaultMessageHtml
  }

  if (isEmpty(data.messageText)) {
    data.messageText = _plugin.config.defaultMessageText
  }

  let params = {
    Destination: {
      BccAddresses: data.bcc,
      CcAddresses: data.cc,
      ToAddresses: data.receiver
    },
    Message: {
      Body: {
        Html: {
          Data: data.messageHtml
        },
        Text: {
          Data: data.messageText
        }
      },
      Subject: {
        Data: data.subject
      }
    },
    Source: data.sender
  }

  SES.sendEmail(params, function (error) {
    if (!error) {
      _plugin.log(JSON.stringify({
        title: 'AWS SES Email sent.',
        data: params
      }))
    }

    callback(error)
  })
}

/**
 * Emitted when device data is received.
 * This is the event to listen to in order to get real-time data feed from the connected devices.
 * @param {object} data The data coming from the device represented as JSON Object.
 */
_plugin.on('data', (data) => {
  if (isPlainObject(data)) {
    sendData(data, (error) => {
      if (error) {
        console.error(error)
        _plugin.logException(error)
      }
    })
  } else if (isArray(data)) {
    async.each(data, (datum, done) => {
      sendData(datum, done)
    }, (error) => {
      if (error) {
        console.error(error)
        _plugin.logException(error)
      }
    })
  } else {
    _plugin.logException(new Error('Invalid data received. Must be a valid Array/JSON Object. Data ' + data))
  }
})

/**
 * Emitted when the platform bootstraps the plugin. The plugin should listen once and execute its init process.
 */
_plugin.once('ready', () => {
  let AWS = require('aws-sdk')

  SES = new AWS.SES({
    accessKeyId: _plugin.config.accessKeyId,
    secretAccessKey: _plugin.config.secretAccessKey,
    region: _plugin.config.region,
    version: _plugin.config.apiVersion,
    sslEnabled: true
  })

  _plugin.log('SES Connector has been initialized.')
  _plugin.emit('init')
})

module.exports = _plugin
