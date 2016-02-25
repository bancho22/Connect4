angular.module('connect4', [])

  .controller('connect4', function($scope, $timeout, $http) {
    var RED = 'R', BLACK = 'B', MOVES = 0, FREE = '-',
      boardWidth = 7, boardHeight = 6,
      tokenIndex = 0, IN_DROP = false;

    var game;  //Refactor into a service

    $scope.username = "";

    $scope.newGame = function() {
      MOVES = 0, tokenIndex = 0;
      if($scope.username.length <2){
        $scope.error = "You must provide your user name (2 characters min.)";
        return;
      }
      var user = {playerName: $scope.username};
      $http({method: "POST", url : "/gameapi/newgame",data: user}).
        then(function ok(response){
          $scope.error = null;
          game = response.data;
          $scope.board = game.board;
          $scope.turn = game.turn;
          $scope.opponent = game.player2;
          $scope.winner = null;
        }, function err(response){
          console.log("Error: "+response.status +", "+response.statusText  );
          $scope.error = response.data.error.message;
        });
    }

    function sendMoveToServer(col, row, player){
      moveData = {"gameId" : game.gameId, "row": row, "col" : col, "player" : player};
      $http({method: "PUT", url : "/gameapi/move",data: moveData}).
        then(function ok(response){
          $scope.error  = null;
          game = response.data;
          $scope.board = game.board;
          $scope.turn = game.turn;
          $scope.winner = game.winner;
          //Use the $timeout function to automatically get a server move when "Play against the Server" is chosen
         }, function err(response){
          console.log("Error: "+response.status +", "+response.statusText  );
          $scope.error = response.data.error.message;
        });
    }
    $scope.computersTurn = false;

    $scope.initComputerGame = function(){
      $http({method: "POST", url : "/gameapi/init_computer_opponent",data: {id: game.gameId}}).
        then(function ok(response){
          game = response.data;
          $scope.opponent = response.data.player2;
          $scope.error = null;
        }, function err(response){
          $scope.error = response.data.error.message;
        });
    }

    $scope.getServerMove = function(){
      $http({method: "PUT", url : "/gameapi/computerMove",data: {id: game.gameId}}).
        then(function ok(response){
          game = response.data;
         //We don't use the updated board from the server. Only the lastMove and winner status is used
         //This is done, to get the animation of a black piece being placed.
          $scope.winner = game.winner;
          $scope.placeToken(game.lastMove.col,true);
        }, function err(response){
          $scope.error = response.data.error.message;
        });
    }

    $scope.setStyling = function(value) {
      if (value === 'R') {
        return {"backgroundColor": "#FF0000"};
      }
      else if (value === 'B') {
        return {"backgroundColor": "#000000"};
      }
      return {"backgroundColor": "white"};
    }

    $scope.placeToken = function(column,remoteMove) {
      $scope.error = null;
      if($scope.winner != null && remoteMove === undefined){
        return;
      }
      if((remoteMove === undefined) && (game.turn ==='B')){
        $scope.error = "Not your turn to move";
        return;
      }
      if(game !== undefined && (game.player1 === null || game.player2 === null )){
        $scope.error = "No opponent found for this game";
        return;
      }
      if (!IN_DROP && $scope.board[column][0] === FREE) {
        MOVES++;
        tokenIndex = 0;
        $scope.board[column][tokenIndex] = $scope.turn;
        IN_DROP = true;
        dropToken(column, $scope.turn,remoteMove);
        $scope.turn = $scope.turn === 'R' ? 'B' : 'R';
      }
    }

    function dropToken(column, player, remoteMove) {

      if ($scope.board[column][tokenIndex+1] === FREE) {
        $timeout(function() {
          $scope.board[column][tokenIndex] = FREE;
          $scope.board[column][++tokenIndex] = player;
          dropToken(column, player,remoteMove);

        },75);
      } else
      {
        if(remoteMove === undefined) {
          sendMoveToServer(column, tokenIndex, player);
        }
        IN_DROP = false;
      }
    }
  });