var expect = require('chai').expect,
	sinon = require('sinon'),
	request = require('supertest'),
	app = require('../app.js'),
	address = request("http://localhost:8080");

describe('Test index Handler Router', function (err) {

	it('Hit the index page', function (done) {

  address
    .get('/')
    .expect(200 , done);
		});
});
