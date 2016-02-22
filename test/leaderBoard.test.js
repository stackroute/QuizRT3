var LeaderBoard = require('../routes/gameManager/LeaderBoard'),
    expect = require('chai').expect,
    assert = require('assert');

describe.only('LeaderBoard', function() {
  it('should have a property called games of type Map', function() {
    assert( LeaderBoard.games );
    assert( LeaderBoard.games instanceof Map);
  });
  it('should have a method called createNewLeaderBoard', function() {
    assert( LeaderBoard.createNewLeaderBoard );
    assert( typeof LeaderBoard.createNewLeaderBoard === 'function' );
  });
  it('should have a method called get', function() {
    assert( LeaderBoard.get );
    assert( typeof LeaderBoard.get === 'function' );
  });
  it('should have a method called updateScore', function() {
    assert( LeaderBoard.updateScore );
    assert( typeof LeaderBoard.updateScore === 'function' );
  });
  it('should have a method called dissolve', function() {
    assert( LeaderBoard.dissolve );
    assert( typeof LeaderBoard.dissolve === 'function' );
  });


  describe('.createNewLeaderBoard()', function() {
    it('should accept three parameters, String, Array, and callback. Return typeError if otherwise', function(done) {
      assert( LeaderBoard.createNewLeaderBoard.length === 3 );
      LeaderBoard.createNewLeaderBoard('GAMEID', 'not array', function(error,result) {
        assert(error);
        done();
      });
    });
    it('should return an error if leaderBoard for gameId already exists', function(done) {
      LeaderBoard.createNewLeaderBoard('SAMEGAMEID', ['1','2'], function(error,result) {
        LeaderBoard.createNewLeaderBoard('SAMEGAMEID', ['4','5','3'], function(error, result) {
          assert(error);
          done();
        });
      });
    });
    it('should return the LeaderBoard created. i.e. array of players', function(done) {
      LeaderBoard.createNewLeaderBoard('NEWGAMEID', ['1','2','3'], function(error, result) {
        assert.strictEqual(error, null);
        assert.deepEqual(result, ['1','2','3']);
        done();
      });
    });
  });

  describe('.get()', function() {
    it('should accept one parameter gameId as String, and return undefined if leaderBoard for gameId does not exist', function() {
      assert( LeaderBoard.get.length === 1 );
      var players = LeaderBoard.get('gameId');
      assert.equal( players, undefined );
    });
    it('should return an Array of players if gameId exists', function(done) {
      LeaderBoard.createNewLeaderBoard('newGameId', ['1','2'], function(error,result) {
        var players = LeaderBoard.get('newGameId');
        assert( Array.isArray(players) );
        done();
      });
    });
  });

  describe('.updateScore()', function() {
    it('should accept three parameters, gameId, userId, and score', function() {
      assert(LeaderBoard.updateScore.length === 3);
    });
    it('should update the score against userId only and return true, otherwise false', function(done) {
      var players = [{userId:'player1',score:0},{userId:'player2',score:0}];
      LeaderBoard.createNewLeaderBoard('newGameId2', players, function(error,result) {
        var successUpdateStatus = LeaderBoard.updateScore('newGameId2', 'player1', 10),
            failureUpdateStatus1 = LeaderBoard.updateScore('newGameId2', 'playerX', 10),
            failureUpdateStatus2 = LeaderBoard.updateScore('incorrectGameId', 'player1', 10);
        assert( successUpdateStatus );
        assert( !failureUpdateStatus1 );
        assert( !failureUpdateStatus2 );
        done();
      });
    });
  });

  describe('.dissolve()', function() {
    it('should return true if the leaderBoard attached to gameId was deleted, otherwise false', function(done) {
      LeaderBoard.createNewLeaderBoard('correctGameId', ['1','2'], function(error,result) {
        var successResult = LeaderBoard.dissolve('correctGameId'),
            failureResult = LeaderBoard.dissolve('incorrectId');
        assert( successResult );
        assert( !failureResult );
        done();
      });
    });
  });

});
