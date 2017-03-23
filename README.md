# AWS SES Connector
[![Build Status](https://travis-ci.org/Reekoh/ses-connector.svg)](https://travis-ci.org/Reekoh/ses-connector)
![Dependencies](https://img.shields.io/david/Reekoh/ses-connector.svg)
![Dependencies](https://img.shields.io/david/dev/Reekoh/ses-connector.svg)
![Built With](https://img.shields.io/badge/built%20with-gulp-red.svg)

AWS SES Connector Plugin for the Reekoh IoT Platform. Integrates a Reekoh instance with AWS SES Service to send emails/notifications.

## Description
This plugin sends emails/notifications based on devices' data connected to the Reekoh Instance to AWS SES.

## Configuration
To configure this plugin, an Amazon AWS account is needed to provide the following:

1. Access Key ID - AWS Access Key ID to use.
2. Secret Access Key - AWS Secret Access Key to use.
3. Region - AWS Region to use.
4. API Version - AWS API Version to use.

Other Parameters:

1. Default HTML Message - The HTML version of the message to be sent (to be used if the email client supports HTML).
2. Default Text Message - The Text version of the message to be sent (to be used if the email client does not support HTML).
3. Default Sender - The default sender to be used (please note that this email should be added and verified in AWS SES console).
4. Default Receiver -  The default receiver in which the email will be sent.

These parameters are then injected to the plugin from the platform.

## Sample input data
```
{
    sender : 'sender@domain.com',
    receiver : ['receiver@domain.com'],
    messageText : 'This is a test email from AWS SES Connector Plugin.',
    messageHtml : '<h1>This is a test email from AWS SES Connector Plugin.</h1> <a href="http://reekoh.com/">Reekoh Website</a>',
    bcc : ['bcc1@domain.com', 'bcc2@domain.com'],
    cc : ['cc1@domain.com', 'cc2@domain.com'],
    subject : 'Test email'
}
```