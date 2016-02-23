var expect=require("chai").expect,
     sinon=require("sinon"),
     request=require("supertest"),
     app=require("../app.js"),
     address=request("http://localhost:8080"),
     categories = require("../models/category");
     var modelStub = sinon.stub(categories, 'find');

  describe("Topic Handler router", function(err){

       it('Getting /topicsHandler/categories get function from "Topics Handler"  through App.js', function(done){
        address
        .get('/topicsHandler/categories')
        .end(function(err,res) {
    		 expect(res.statusCode).to.be.equal(200);
    		 done();
    		});
        });

        describe('Describe Find items-------------------------------1', function(){
          beforeEach(function(){
          modelStub.withArgs({_id: "Hello"}).yields(null, {
            _id: "Hello",
          categoryName:"Big Hello",
          categoryTopics: [{_id: "Computers",
          topicName: "Coding",
          topicIcon: "facebook",
          topicCategory: ["Hello", "Hi", "How are you?"],
          topicDescription: "Hello, This is just a game we are into.",
          topicFollowers: 1212,
          playersPerMatch: 3,
          games:"Single"
}]});
            });

      it('Getting /category/:categoryId get function-------------2', function(done){
        address
         .get("/topicsHandler/category/Hello")
         .end(function(err,res){
         expect(res.statusCode).to.be.equal(200);
          // expect(res.body[0].categoryName).to.be.equal("Big Hello");

           done();
      });
    });
  });
});
