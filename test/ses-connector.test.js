'use strict';

const REGION = 'us-east-1',
    API_VERSION = '2010-12-01',
    ACCESS_KEY_ID = 'AKIAJCDH5ZSQYJHPXOZQ',
    SECRET_ACCESS_KEY= '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';

var cp     = require('child_process'),
	assert = require('assert'),
	connector;

describe('Connector', function () {
	this.slow(5000);

	after('terminate child process', function () {
        setTimeout(function(){
            connector.kill('SIGKILL');
        }, 5000);
	});

	describe('#spawn', function () {
		it('should spawn a child process', function () {
			assert.ok(connector = cp.fork(process.cwd()), 'Child process not spawned.');
		});
	});

	describe('#handShake', function () {
		it('should notify the parent process when ready within 5 seconds', function (done) {
			this.timeout(5000);

			connector.on('message', function (message) {
				if (message.type === 'ready')
					done();
			});

			connector.send({
				type: 'ready',
				data: {
					options: {
                        access_key_id: ACCESS_KEY_ID,
                        secret_access_key : SECRET_ACCESS_KEY,
                        region : REGION,
                        api_version : API_VERSION,
                        default_message : 'This is a default message.',
                        default_sender : 'adinglasan@reekoh.com',
                        default_receiver : 'akzdinglasan@gmail.com'
					}
				}
			}, function (error) {
				assert.ifError(error);
			});
		});
	});

	describe('#data', function (done) {
		it('should process the data', function () {
			connector.send({
				type: 'data',
				data: {
                    sender : 'adinglasan@reekoh.com',
                    receiver : ['akzdinglasan@gmail.com'],
                    message : 'This is a test email from AWS SES Connector Plugin.',
                    bcc : [],
                    cc : [],
                    subject : 'Test email'
				}
			}, done);
		});
	});
});