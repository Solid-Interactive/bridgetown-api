'use strict';
var chai = require('chai'),
    sinonChai = require('sinon-chai'),
    bridgetown = require('../lib/bridgetown-api'),
    utilities = require('./utilities');

chai.should();
chai.use(sinonChai);

describe('API-KEY Validation', function(){

    it('api key validation method should have the api key passed to it', function(done) {
        var req = {
                headers: {
                    'x-api-key': '1234567890'
                }
            },
            middlewares = [
                bridgetown.middleware.initialize(),
                bridgetown.middleware.apiKey(_validateApiKey),
                done.bind(done, undefined)
            ];

        utilities.runMiddlewares(middlewares, req);
    });

    function _validateApiKey(apiKey, deferred){
        apiKey.should.equal('1234567890');
        deferred.resolve();
    }

    function _invalidateApiKey(apiKey, deferred) {
        deferred.reject();
    }

    it('failing the deferred passed into the validation method results in a 403', function(done) {
        var req = {
                headers: {
                    'x-api-key': '1234567890'
                }
            },
            middlewares = [
                bridgetown.middleware.initialize(),
                bridgetown.middleware.apiKey(_invalidateApiKey),
            ],
            options = utilities.runMiddlewares(middlewares, req);

        process.nextTick(function() {
            var res = options.res;
            res.writeHead.should.have.been.calledWith(403, {'Content-Type': 'application/json'});
            res.write.should.have.been.calledWith(JSON.stringify({
                code: 403,
                status: 'error',
                message: 'Invalid API key'
            }));
            res.end.should.have.been.calledOnce;
            done();
        });
    });
});