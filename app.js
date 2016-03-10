'use strict';

var platform = require('./platform'),
    isPlainObject = require('lodash.isplainobject'),
    isEmpty = require('lodash.isempty'),
    isArray = require('lodash.isarray'),
    async = require('async'),
	config, SES;

let sendData = (data) => {
    if(isEmpty(data.sender))
        data.sender = config.default_sender;

    if(isEmpty(data.receiver))
        data.receiver = [config.default_receiver];

    if(isEmpty(data.message_html))
        data.message_html = config.default_message_html;

    if(isEmpty(data.message_text))
        data.message_text = config.default_message_text;

    var params = {
        Destination: {
            BccAddresses: data.bcc,
            CcAddresses: data.cc,
            ToAddresses: data.receiver
        },
        Message: {
            Body: {
                Html: {
                    Data: data.message_html
                },
                Text: {
                    Data: data.message_text
                }
            },
            Subject: {
                Data: data.subject
            }
        },
        Source: data.sender
    };

    SES.sendEmail(params, function(error, response){
        if(error){
            console.error(error);
            platform.handleException(error);
        }
        else{
            platform.log(JSON.stringify({
                title: 'AWS SES Email sent.',
                data: params
            }));
        }
    });
};

platform.on('data', function (data) {
    if(isPlainObject(data)){
        sendData(data);
    }
    else if(isArray(data)){
        async.each(data, (datum) => {
            sendData(datum);
        });
    }
    else
        platform.handleException(new Error('Invalid data received. Must be a valid Array/JSON Object. Data ' + data));

});

platform.once('close', function () {
    platform.notifyClose();
});

platform.once('ready', function (options) {
    var AWS = require('aws-sdk');

    config = {
        default_message_html : options.default_message_html,
        default_message_text : options.default_message_text,
        default_sender : options.default_sender,
        default_receiver : options.default_receiver
    };

    SES = new AWS.SES({
        accessKeyId: options.access_key_id,
        secretAccessKey: options.secret_access_key,
        region: options.region,
        version: options.api_version,
        sslEnabled: true
    });

    platform.log('AWS SES Connector Initialized.');
	platform.notifyReady();
});