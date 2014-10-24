'use strict';
var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    bridgetown = require('../lib/bridgetown-api'),
    q = require('q');

chai.should();
chai.use(sinonChai);

describe('API-KEY Validation', function(){

    var port = 3210,
        bridgetownApi = require('../lib/bridgetown-api'),
        Response = require('../lib/Response'),
        middleware = bridgetownApi.middleware;

    it('should receive a 403 because the api is trying to be used before registering an API-KEY precondition.', function(done) { //jshint ignore:line
        var options = {
                host: 'localhost',
                port: port,
                path: '/',
                method: 'GET',
                headers: {
                    'X-API-KEY': '12345890'
                }
            };

        server.start( function(req, res) {
            middleware.apiKey(req, res, function(){
                throw new Error();
            });
        } );

        request(options)
            .then(function(response){
                response.code.should.equal(403);
                response.message.should.equal('API key validation method not registered.');
                done();
            })
            .catch(done);
    });

    it('should successfully create a server and validate an API key using the precondition function.', function(done) {
        var options = {
                host: 'localhost',
                port: port,
                path: '/',
                method: 'GET',
                headers: {
                    'X-API-KEY': '1234567890'
                }
            };

        function validateApiKey(apiKey){
            var deferred = q.defer();

            apiKey.should.equal('1234567890');
            deferred.resolve(true);
            return deferred.promise;
        }

        server.start( function(req, res) {
            middleware.apiKey(req, res, function(){
                var response = new Response(res);
                response.write(200, {success: true});
            });
        } );

        server.configure(function(){
            this.validate.apiKey(validateApiKey);
        });

        request(options)
            .then(function(response){
                response.success.should.equal(true);
                done();
            })
            .catch(done);
    });

    it('should receive a 403 error because the API validation routine returned a failed promise.', function(done) {
        var options = {
                host: 'localhost',
                port: port,
                path: '/',
                method: 'GET',
                headers: {
                    'X-API-KEY': '12345890'
                }
            };

        function validateApiKey(apiKey){
            var deferred = q.defer(),
                err = new Error('API Keys are invalid');

            err.errorCode = 403;

            apiKey.should.equal('12345890');

            deferred.reject(err);
            return deferred.promise;
        }

        server.configure(function(){
            this.validate.apiKey(validateApiKey);
        });

        server.start( function(req, res) {
            middleware.apiKey(req, res, function(){
                throw new Error();
            });
        } );

        request(options)
            .then(function(response){
                response.message.should.equal('API Keys are invalid');
                done();
            })
            .catch(done);
    });
});