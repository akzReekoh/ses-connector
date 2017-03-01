'use strict'

const amqp = require('amqplib')

const REGION = 'us-east-1'
const API_VERSION = '2010-12-01'
const ACCESS_KEY_ID = 'AKIAIOU2EZVMZ7DR44NQ'
const SECRET_ACCESS_KEY= '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'

let _channel = null
let _conn = null
let app = null

describe('SES Connector Test', () => {
  before('init', () => {
    process.env.ACCOUNT = 'adinglasan'
    process.env.CONFIG = JSON.stringify({
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey : SECRET_ACCESS_KEY,
      region : REGION,
      apiVersion : API_VERSION,
      defaultMessageText : 'This is a default message.',
      defaultMessageHtml : '<h1>This is a default message.</h1> <a href="http://reekoh.com/">Reekoh Website</a>',
      defaultSender : 'adinglasan@reekoh.com',
      defaultReceiver : 'akzdinglasan@gmail.com'
    })
    process.env.INPUT_PIPE = 'ip.ses'
    process.env.LOGGERS = 'logger1, logger2'
    process.env.EXCEPTION_LOGGERS = 'ex.logger1, ex.logger2'
    process.env.BROKER = 'amqp://guest:guest@127.0.0.1/'

    amqp.connect(process.env.BROKER)
      .then((conn) => {
        _conn = conn
        return conn.createChannel()
      }).then((channel) => {
      _channel = channel
    }).catch((err) => {
      console.log(err)
    })
  })

  after('close connection', function (done) {
    _conn.close()
    done()
  })

  describe('#start', function () {
    it('should start the app', function (done) {
      this.timeout(10000)
      app = require('../app')
      app.once('init', done)
    })
  })

  describe('#data', () => {
    it('should send data to third party client', function (done) {
      this.timeout(15000)

      let data = {
        sender : 'adinglasan@reekoh.com',
        receiver : ['akzdinglasan@gmail.com'],
        messageText : 'This is a test email from AWS SES Connector Plugin.',
        messageHtml : '<h1>This is a test email from AWS SES Connector Plugin.</h1> <a href="http://reekoh.com/">Reekoh Website</a>',
        bcc : [],
        cc : [],
        subject : 'Test email'
      }

      _channel.sendToQueue('ip.ses', new Buffer(JSON.stringify(data)))
      setTimeout(done, 10000)
    })
  })
})
