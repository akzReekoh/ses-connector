'use strict';

var platform = require('./platform'),
    isPlainObject = require('lodash.isplainobject'),
    isEmpty = require('lodash.isempty'),
	config, SES;

platform.on('data', function (data) {
    if(isPlainObject(data)){
        if(isEmpty(data.sender))
            data.sender = config.default_sender;

        if(isEmpty(data.receiver))
            data.receiver = [config.default_receiver];

        if(isEmpty(data.message))
            data.message = config.default_message;

        var params = {
            Destination: {
                BccAddresses: data.bcc,
                CcAddresses: data.cc,
                ToAddresses: data.receiver
            },
            Message: {
                Body: {
                    Html: {
                        Data: data.message
                    },
                    Text: {
                        Data: data.message
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
    }
    else
        platform.handleException(new Error('Invalid data received. Must be a valid JSON Object. Data ' + data));

});

platform.once('close', function () {
    platform.notifyClose();
});

platform.once('ready', function (options) {
    var AWS = require('aws-sdk');

    config = {
        default_message : options.default_message,
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