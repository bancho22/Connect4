var express = require('express');
var router = express.Router();
var gameApi = require("../game/conncect4");

var sillyGlobalGameContainer = {
  waitingGame :null,
  game : null
}

router.post("/newgame",function(req,res, next){
   var playerObj = req.body;
  console.log(req.body);
   res.json(gameApi.newGame(playerObj.playerName,sillyGlobalGameContainer));
});

router.post("/init_computer_opponent",function(req,res, next){
   var obj = req.body;
  console.log(obj.id);
   res.json(gameApi.initServerPlayer(obj.id,sillyGlobalGameContainer));
});

router.put("/computerMove",function(req,res,next){
  var obj = req.body;
  var gameId = obj.gameId;
  var game = sillyGlobalGameContainer.game;
  game = gameApi.randomMove(game,'B'); //Computer is always black
  res.json(game);
});


router.put("/move",function(req,res,next){
  var move = req.body;
  console.log(move.gameId);
  var game = sillyGlobalGameContainer.game;
  try {
    game = gameApi.placeToken(move.col, move.row, move.player, game);
    res.json( game);
  }
  catch(error){
    res.json({error : {message : error.message}});
  }

});

module.exports = router;