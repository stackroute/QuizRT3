var expect = require('chai').expect,
	sinon = require('sinon'),
	request = require('supertest'),
	app = require('../app.js'),
	address = request("http://localhost:8080/");

describe('Test Tournament Handler Router', function (err) {

	it('Respond with 401 : Unauthorized', function (done) {
		
		address
		.get('/tournaments')
		.expect(401 , done);

	});
	
});
