var leader= new Map();

module.exports={
  leaderBoard: leader,

  addPlayer: function(gameId, sid, client, name, score, imageUrl){
    var clientData={
      'sid': sid,
      'name': name,
      'imageUrl': imageUrl,
      'score': score,
      'client': client
    };

    if(leader.get(gameId)==null){
			var temp= [];
			temp.push(clientData);
		 	leader.set(gameId, temp);
		}
		else{
			leader.get(gameId).push(clientData);
    }
	},

  getGamePlayers: function(gameId){
    return leader.get(gameId);
  },

  updateScore: function(gameId, sid, score){
    for(var i=0; i<leader.get(gameId).length; i++){
      if(leader.get(gameId)[i].sid== sid){
        leader.get(gameId)[i].score= score;
        break;
      }
    }

    leader.get(gameId).sort(function(a,b){
      return b.score-a.score;
    });
  }
};
