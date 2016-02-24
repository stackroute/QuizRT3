var expect=require("chai").expect,
     sinon=require("sinon"),
     request=require("supertest"),
     app=require("../app.js"),
     address=request("http://localhost:8080"),
     categories = require("../models/category"),
     topic = require("../models/topic");

<<<<<<< HEAD
    var mockFindOne = {
      exec : function (callback) {
         callback(null, [{
           _id: 'Hello',
           categoryName: "Java",
           categoryTopics: [{_id: "Computers",
         topicName: "Coding",
         topicIcon: "facebook",
         topicCategory: ["Hello", "Hi", "How are you?"],
         topicDescription: "Hello, This is just a game we are into.",
           topicFollowers: 1212,
           playersPerMatch: 3,
           games:"Single"}]
       }])
                 },

            populate : function(){
                 return this;
               }
      };

      var mockFindOne2 = {
        exec : function (callback) {
           callback(null, [{
               _id: "1212",
               topicName: "Java",
               topicIcon: "Java.jpeg",
               topicCategory: ["Computer-Quiz"],
               topicDescription: "This Quiz is completely about Quizing on Computers",
               topicFollowers: 1280,
               playersPerMatch:3,
               games:"This is Different game!"}])
             }
         };


   var modelStub = sinon.stub(categories, 'findById');
   var modelStub1=sinon.stub(topic, 'find');

=======
>>>>>>> d9355e81115f5a69e0fd40f72943c1cad65f7c84
  describe("Topic Handler router", function(err){

       it('Getting /topicsHandler/categories get function from "Topics Handler"  through App.js', function(done){
        address
        .get('/topicsHandler/categories')
        .end(function(err,res) {
    		 //expect(res.statusCode).to.be.equal(200);
    		 done();
    		});
        });

       describe('Find a item given the argument', function(){
                 beforeEach(function(done){
                   modelStub.withArgs("Hello").returns(mockFindOne);
                   done();
                 });


      it('Getting /category/:categoryId get function', function(done){
        address
         .get("/topicsHandler/category/Hello")
         .end(function(err,res){
         expect(res.statusCode).to.be.equal(200);
         //console.log(res);
          // expect(res.body[0].categoryName).to.be.equal("Big Hello");
<<<<<<< HEAD

=======
>>>>>>> 3638092e659a1b98aaedd5b733f48790717fa01a
           done();
      });
    });
  });

  describe("Gettin get function for topics", function(){





    describe('Find a item given the argument', function(){
              beforeEach(function(done){
                modelStub1.returns(mockFindOne2);
                done();
              });

    it('Getting /topicsHandler/topics get Function', function(done){
      address
      .get("/topicsHandler/topics")
      .end(function(err,res){
        expect(res.statusCode).to.be.equal(200);
        console.log(res.body);
        done();
      });
  });
});
});
});
