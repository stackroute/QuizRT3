var expect = require('chai').expect,
	sinon = require('sinon'),
  request = require('supertest'),
	app = require('../app.js'),
	address = request("http://localhost:8080"),
	Tournament = require("../models/tournament");


  describe('Test Tournament Handler Router', function (err) {

   it('Getting /quizPlayer/quizData/:id get function from "QUIZ PLAYER HANDLER" through App.js', function (done)
  	 {address
  		.get('/quizPlayer/quizData/')
  		.end(function(err,res) {
  		 expect(res.statusCode).to.be.equal(200);
  		 done();
  		});
     });
   });
