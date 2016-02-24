var questionBank = require('../routes/gameManager/questionBank.js'),
    Reservoir = require('reservoir'),
    Question = require("../models/question.js"),
    expect = require('chai').expect;

describe('Question Bank', function() {
  it('require(questionBank) should return an object', function() {
    expect( questionBank ).to.exist.and.to.be.an("object");
  });
  it('should have a method getQuizQuestions()', function() {
    expect( questionBank.getQuizQuestions ).to.be.a("function");
  });

  describe('.getQuizQuestions()', function() {
    it('should accept 3 parameters, String, Number, callback Function', function() {
      expect( questionBank.getQuizQuestions ).to.have.length(3);
    });
    it('should retrun an error(noOfQs is not a number) when noOfQs is NaN', function(done) {
      questionBank.getQuizQuestions('Cartoons', 'hgh', function(err, questions) {
        expect(err).to.exist;
        done();
      });
    });
    it('should retrun an error when topicId is not found', function(done) {
      questionBank.getQuizQuestions('Wrongtopicid', 5, function(err, questions) {
        expect(err).to.exist;
        done();
      });
    });
    it('should retrun an array of questions when topicId, noOfQs is valid', function(done) {
      questionBank.getQuizQuestions('Cartoons', 5, function(err, questions) {
        expect(err).to.not.exist;
        expect(questions).to.be.an('array').with.length(5);
        done();
      });
    });
  });
});
