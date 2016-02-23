var expect = require('chai').expect,
	sinon = require('sinon'),
  request = require('supertest'),
	app = require('../app.js'),
	address = request("http://localhost:8080"),
	Tournament = require("../models/tournament");


describe('Test Tournament Handler Router', function (err) {

<<<<<<< HEAD
	it('Respond with 401 : Unauthorized', function (done) {

=======
 it('Getting /tournamentHandler/tournaments get function from "TOURNAMENT HANDLER" through App.js', function (done)
	{address
		.get('/tournamentHandler/tournaments')
		.end(function(err,res) {
		expect(res.statusCode).to.be.equal(200);
		done();
		});
   });


	it('Getting /tournamentHandler/tournaments post function from "TOURNAMENT HANDLER" through App.js', function (done)
	{
>>>>>>> 82b558b3ec4acda51b2e9514157cebc6b43241ae
		address
		.post('/tournamentHandler/tournaments')
		.end(function(err,res) {
			expect(res.statusCode).to.be.equal(204);
			expect('Content-Type', /json/);
			done();
		});

	});

<<<<<<< HEAD
});

var expect = require('chai').expect,
	sinon = require('sinon'),
  request = require('supertest'),
	app = require('../app.js'),
	address = request("http://localhost:8080"),
	Tournament = require("../models/tournament");


describe('Test Tournament Handler Router', function (err) {

 it('Getting /tournamentHandler/tournaments get function from "TOURNAMENT HANDLER" through App.js', function (done)
	 {address
		.get('/tournamentHandler/tournaments')
		.end(function(err,res) {
		 expect(res.statusCode).to.be.equal(200);
		 done();
		});
   });


	 it('Getting /tournamentHandler/tournaments post function from "TOURNAMENT HANDLER" through App.js', function (done)
	 {
		 address
		 .post('/tournamentHandler/tournaments')
		 .end(function(err,res) {
			 expect(res.statusCode).to.be.equal(204);
			 expect('Content-Type', /json/);
			 done();
		 });

	 });

	 it('Getting /tournamentHandler/:tId get function from "TOURNAMENT HANDLER" through App.js', function (done)
 	 {
		 address
		   .get('/tournamentHandler//tournament/TV-Maniac')
			 .end(function(err,res) {
	 		  expect(res.statusCode).to.be.equal(200);
				 expect('Content-Type', /json/);
			  done();
	 		 });
  });
});
=======
	it('Getting /tournamentHandler/:tId get function from "TOURNAMENT HANDLER" through App.js', function (done)
 	{
		address
		  .get('/tournamentHandler//tournament/TV-Maniac')
			.end(function(err,res) {
			 expect(res.statusCode).to.be.equal(200);
				expect('Content-Type', /json/);
			 done();
			});
  });







 		});
>>>>>>> 82b558b3ec4acda51b2e9514157cebc6b43241ae
