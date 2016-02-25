//Copyright {2016} {NIIT Limited, Wipro Limited}
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//
//   Name of Developers  Anil Sawant



var GameManager = function() {
  this.games = new Map(); // to map topicId to [players]
  this.players = new Map();// to map userId to [topicIds]

  /**
  ** @param topicId as String, gamePlayer as Object
  ** @return true if gamePlayer was added to a game; otherwise false
  */
  this.addPlayerToGame = function( topicId, gamePlayer ) {
    var playerTopics = this.players.get( gamePlayer.userId ),
        gamePlayers = this.games.get( topicId );

  	if ( gamePlayers && gamePlayers.length ) { // game with topicId exists, and already has player(s)
      if ( playerTopics && playerTopics.length ) { // gamePlayer is already playing some game(s)
        if( playerTopics.indexOf( topicId ) != -1 ) // gamePlayer is playing the same topicId
          return false;

        playerTopics.push( topicId ); // add the topicId to gamePlayer's array of playing-topics
        gamePlayers.push( gamePlayer ); // add the gamePlayer to topicId's array of players
        return true;
      } else { // gamePlayer is not playing any game(s) so far
        this.players.set( gamePlayer.userId, [topicId] ); // set the topicId as the first game gamePlayer is playing i.e. set it in the map
        gamePlayers.push( gamePlayer ); // since the game already exists, add gamePlayer to topicId's array of players
        return true;
      }
  	} else { // game with topicId doesn't exist, or doesn't have any player(s)
  		this.games.set( topicId, [gamePlayer] ); // set the gamePlayer as the first player of the topicId
      if ( playerTopics && playerTopics.length ) { // player is already playing some other game
        playerTopics.push( topicId ); // push the topicId to his previous playing-topics array
        return true;
      }
      this.players.set( gamePlayer.userId, [topicId] ); // this is the first topic for the player, hence set it in map
      return true;
  	}
  };

  /**
  ** @param topicId as String, gamePlayer as Object
  ** @return true if gamePlayer left the game successfully; otherwise false
  */
  this.leaveGame = function( topicId, gamePlayer ) {
    var playerTopics = this.players.get( gamePlayer.userId ),
        gamePlayers = this.games.get( topicId ),
        playerLeft = false;

    if ( gamePlayers && gamePlayers.length ) {
      playerLeft = gamePlayers.some( function( savedPlayer, index ) {
        if ( savedPlayer.userId == gamePlayer.userId ) {
          console.log( gamePlayers.splice( index, 1 ) , ' left ' + topicId );
          return true;
        }
        return false;
      });
    }
    if ( playerLeft ) { // do some cleanup
      if ( gamePlayers && !gamePlayers.length ) { // remove the game mapping if the game doesn't have any players
        this.games.delete( topicId );
      }
      var index = playerTopics.indexOf( topicId);
      if ( playerTopics && playerTopics.length &&  (index != -1)) {
        console.log( playerTopics.splice( index, 1 ), ' was removed from ' + gamePlayer.userId  + "'s array");
      }
      if ( playerTopics && !playerTopics.length ) { // remove the player mapping if the player is not playing any topic
        this.players.delete( gamePlayer.userId );
      }
      return true; // player successfully left the game and other cleanup was done
    }
    return false; // the player or the game did not exist
  };

  /**
  ** @param topicId as String
  ** @return Array of players playing topicId
  */
  this.getGamePlayers = function( topicId ) {
  	return this.games.get( topicId );
  };

  /**
  ** @param gamePlayer as Obj
  ** @return Array of topics gamePlayer is playing
  */
  this.getPlayerTopics = function( gamePlayer ) {
  	return this.players.get( gamePlayer.userId );
  };

  /**
  ** @param topicId as String
  ** @return true if the game was successfully popped; otherwise false
  */
  this.popGame = function( topicId ) {
    var gamePlayers = this.games.get( topicId ),
        self = this;
    if ( gamePlayers && gamePlayers.length ) {
      gamePlayers.forEach( function( gamePlayer ) { // before deleting the game delete the gameId entry in all the players
        var playerTopics = self.players.get( gamePlayer.userId );
        if ( playerTopics && playerTopics.length ) { // player is playing some topics
          var index = playerTopics.indexOf( topicId );
          if ( index != -1 ) { // if player is playing the topicId to be popped
            console.log( playerTopics.splice( index, 1 ) + ' was removed from ' + gamePlayer.userId );
          }
          if ( playerTopics && !playerTopics.length ) { // remove the player mapping if the player is not playing any topic
            self.players.delete( gamePlayer.userId );
          }
        }
      });
    }
    if ( this.games.has( topicId ) ) {
      this.games.delete( topicId ); // pop the game if it exists
      return true;
    }
    return false; // game doesn't exist
  }

  /**
  ** @param gamePlayer as Object
  ** @return true if the gamePlayer was successfully popped; otherwise false
  */
  this.popPlayer = function( gamePlayer ) {
    var playerTopics = this.players.get( gamePlayer.userId ),
        self = this,
        removedFromTopicsCount = 0,
        topicRemoved = false;
    if ( playerTopics && playerTopics.length ) {
      playerTopics.forEach( function( topicId ) { // before popping the player, delete the gamePlayer entry in all the games
        var topicPlayers = self.games.get( topicId ); // to check where if gamePlayer entry is there in games
        if ( topicPlayers && topicPlayers.length ) { // topic has some players
          topicRemoved = topicPlayers.some( function( topicPlayer, index ) {
            if ( topicPlayer.userId == gamePlayer.userId ) {
              console.log( topicPlayers.splice( index, 1 ) , ' was removed from ' + topicId );
              removedFromTopicsCount++ ;
              return true;
            }
            return false;
          });
          if ( topicPlayers && !topicPlayers.length ) { // cleanup
            self.games.delete( topicId );
          }
        }
      });
      if ( removedFromTopicsCount == playerTopics.length ) { // gamePlayer was removed from all the games he was part of
        if ( this.players.has( gamePlayer.userId ) ) {
          this.players.delete( gamePlayer.userId ); // delete the player mapping
          return true;
        }
      }
      return false; // gamePlayer was removed from a few games but not from all he was part of
    }
  }
}

module.exports = new GameManager();
