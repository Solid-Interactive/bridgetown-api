var http = require('http'),
    bridgetownApi = require('../lib/bridgetown-api'),
    middleware = bridgetownApi.middleware;

require('chai').should();
describe('Authorization Validation', function(){
    'use strict';

    var port = 3210;

    it('should receive a 401 Because the authorization header is not provided.', function(done) {
        var options = {
                host: 'localhost',
                port: port,
                path: '/',
                method: 'GET'
            },
            request = http.request(options, function(res){
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    var response = JSON.parse(chunk);

                    response.code.should.equal(401);
                    response.message.should.equal('Authorization credentials not provided.');

                    server.close();
                    done();
                });
            }),

            server = http.createServer(function (req, res) {
                middleware.authorization(req, res, function(){
                    // This should not happen.
                    'Should not have passed'.should.equal('No authorization header was supplied.');
                    done();
                });
            });

        server.listen(port);

        request.end();
    });

    it('should have it\'s callback called successfully because the authorization header is present.', function(done) {
        var options = {
                host: 'localhost',
                port: port,
                path: '/',
                method: 'GET',
                headers: {
                    authorization: 'Token QWxhZGRpbjpvcGVuIHNlc2FtZQ=='
                }
            },
            request = http.request(options, function(res){
                res.setEncoding('utf8');
                res.on('data', function () {
                    'Should not have passed'.should.equal('Authorization header was supplied, should not have failed.');
                    done();
                });
            }),

            server = http.createServer(function (req, res) {
                middleware.authorization(req, res, function(){
                    server.close();
                    done();
                });
            });

        server.listen(port);

        request.end();
    });

});