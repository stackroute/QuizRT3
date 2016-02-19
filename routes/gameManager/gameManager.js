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
//   Name of Developers  Raghav Goel, Kshitij Jain, Lakshay Bansal, Ayush Jain, Saurabh Gupta, Akshay Meher
//											+ Anil Sawant



var GameManager = function() {
  this.games = new Map(); // to map topicId to [players]
  this.players = new Map();// to map userId to [topicIds]

  /**
  ** @param topicId as String, gamePlayer as String/Obj
  ** @return true if user was added to a game; otherwise false
  */
  this.addPlayerToGame = function( topicId, gamePlayer ) {
    var player = this.players.get( gamePlayer.userId ),
        game = this.games.get( topicId );

  	if ( game && game.length ) { // game with topicId exists, and already has player(s)
      if ( player && player.length ) { // gamePlayer is already playing some game(s)
        if( player.indexOf( topicId ) != -1 ) // gamePlayer is playing the same topicId
          return false;

        player.push( topicId ); // add the topicId to gamePlayer's array of playing-topics
        game.push( gamePlayer ); // add the gamePlayer to topicId's array of players
        return true;
      } else { // gamePlayer is not playing any game(s) so far
        this.players.set( gamePlayer.userId, [topicId] ); // set the topicId as the first game gamePlayer is playing i.e. set it in the map
        game.push( gamePlayer ); // since the game already exists, add gamePlayer to topicId's array of players
      }
  	} else { // game with topicId doesn't exist, or doesn't have any player(s)
  		this.games.set( topicId, [gamePlayer] ); // set the gamePlayer as the first player of the topicId
      if ( player && player.length ) { // player is already playing some other game
        player.push( topicId ); // push the topicId to his previous playing-topics array
        return true;
      }
      this.players.set( gamePlayer.userId, [topicId] ); // this is the first topic for the player, hence set it in map
      return true;
  	}
  };

  this.leaveGame = function( topicId, gamePlayer ) {
    var player = this.players.get( gamePlayer ),
        game = this.games.get( topicId );

    if ( game && game.length ) {
      console.log( game.splice( game.indexOf( gamePlayer ), 1 ) , ' left ' + topicId );
    }
    if ( game && !game.length ) {
      this.games.delete( topicId );
    }
    if ( player && player.length ) {
      console.log( player.splice( player.indexOf( topicId), 1 ), ' was removed from ' + gamePlayer + "'s array");
    }
    if ( player && !player.length ) {
      this.players.delete( gamePlayer )
    }
  };

  this.getGamePlayers = function( topicId ) {
  	return this.games.get( topicId );
  };
  this.getPlayerTopics = function( gamePlayer ) {
  	return this.players.get( gamePlayer );
  };
  this.popGame = function( topicId ) {
  	this.games.delete( topicId ); // pop the game from games
  }
  this.popPlayer = function( gamePlayer ) {
  	this.players.delete( gamePlayer ); // pop the player from players
  }
}

module.exports = new GameManager();
