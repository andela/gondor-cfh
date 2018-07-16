/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0 wrap-iife: 0 */
/* eslint vars-on-top: 0, no-var: 0, object-shorthand: 0, no-plusplus: 0 */
/* eslint prefer-template: 0, quote-props: 0, no-else-return: 0 no-console: 0 */
/* eslint max-len: 0 */
angular.module('mean.system')
  .controller(
    'GameController',
    ['$scope', 'game', '$window', '$timeout', '$location',
      'MakeAWishFactsService', '$dialog', '$http', 'Global', 'DonationService',
      function ($scope, game, $window, $timeout, $location, MakeAWishFactsService,
        $dialog, $http, Global, DonationService) {
        $scope.hasPickedCards = false;
        $scope.winningCardPicked = false;
        $scope.showTable = false;
        $scope.modalShown = false;
        $scope.game = game;
        $scope.pickedCards = [];
        $scope.search = '';
        $scope.match = [];
        var makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
        $scope.makeAWishFact = makeAWishFacts.pop();
        game.getRegions();

        (function (timer, delay) {
          $scope.searchUsers = function () {
            if (timer) {
              $timeout.cancel(timer);
            }
            timer = $timeout(function () {
              $http({
                url: '/api/search/users',
                method: 'GET',
                params: { search: $scope.search }
              })
                .success(function (data) {
                  if (data.message === 'No matching user') {
                    $scope.match = [];
                  }
                  $scope.match = data.users;
                })
                .error(function (data) {
                  console.log('error:', data);
                  $scope.match = [];
                });
            }, delay);
          };
        })(false, 1000);

        $scope.inviteUsers = function (receiver) {
          var link = document.URL;
          var httpMessage = '<h2> Join the game' + link + '</h2>';
          if (game.players.length < 12) {
            return $http.post('/api/mail', {
              receiver: receiver,
              subject: 'Game Invitation',
              html: httpMessage
            })
              .success(function (data) {
                game.inviteMessage = data.message;
                game.successMailNotify();
                $timeout(function () { game.inviteMessage = ''; }, 3000);
              })
              .error(function (data) {
                console.log(data);
              });
          }
          game.notifyMaxUsers();
        };

        $scope.pickCard = function (card) {
          if (!$scope.hasPickedCards) {
            if ($scope.pickedCards.indexOf(card.id) < 0) {
              $scope.pickedCards.push(card.id);
              if (game.curQuestion.numAnswers === 1) {
                $scope.sendPickedCards();
                $scope.hasPickedCards = true;
              } else if (game.curQuestion.numAnswers === 2
                && $scope.pickedCards.length === 2) {
              // delay and send
                $scope.hasPickedCards = true;
                $timeout($scope.sendPickedCards, 300);
              }
            } else {
              $scope.pickedCards.pop();
            }
          }
        };

        $scope.pointerCursorStyle = function () {
          if ($scope.isCzar()
          && $scope.game.state === 'waiting for czar to decide') {
            return { 'cursor': 'pointer' };
          }
          return {};
        };

        $scope.sendPickedCards = function () {
          game.pickCards($scope.pickedCards);
          $scope.showTable = true;
        };

        $scope.cardIsFirstSelected = function (card) {
          if (game.curQuestion.numAnswers > 1) {
            return card === $scope.pickedCards[0];
          }
          return false;
        };

        $scope.cardIsSecondSelected = function (card) {
          if (game.curQuestion.numAnswers > 1) {
            return card === $scope.pickedCards[1];
          }
          return false;
        };

        $scope.firstAnswer = function ($index) {
          if ($index % 2 === 0 && game.curQuestion.numAnswers > 1) {
            return true;
          }
          return false;
        };

        $scope.secondAnswer = function ($index) {
          if ($index % 2 === 1 && game.curQuestion.numAnswers > 1) {
            return true;
          }
          return false;
        };

        $scope.showFirst = function (card) {
          return game.curQuestion.numAnswers > 1
          && $scope.pickedCards[0] === card.id;
        };

        $scope.showSecond = function (card) {
          return game.curQuestion.numAnswers > 1
          && $scope.pickedCards[1] === card.id;
        };

        $scope.isCzar = function () {
          return game.czar === game.playerIndex;
        };

        $scope.isPlayer = function ($index) {
          return $index === game.playerIndex;
        };

        $scope.currentPlayer = function () {
          return game.players[game.playerIndex];
        };

        $scope.isCustomGame = function () {
          return !(/^\d+$/).test(game.gameID)
          && game.state === 'awaiting players';
        };

        $scope.isPremium = function ($index) {
          return game.players[$index].premium;
        };

        $scope.currentCzar = function ($index) {
          return $index === game.czar;
        };

        $scope.winningColor = function ($index) {
          if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
            return $scope.colors[game.players[game.winningCardPlayer].color];
          }
          return '#f9f9f9';
        };

        $scope.pickWinning = function (winningSet) {
          if ($scope.isCzar()) {
            game.pickWinning(winningSet.card[0]);
            $scope.winningCardPicked = true;
          }
        };

        $scope.winnerPicked = function () {
          return game.winningCard !== -1;
        };

        $scope.startGame = function () {
          game.startGame();
        };

        $scope.abandonGame = function () {
          game.leaveGame();
          $location.path('/');
        };

        $scope.sideNavAbandonGame = function () {
          $scope.sideNav = false;
          $('.sidenav').sidenav('close');
          $scope.abandonGame();
        };

        // Catches changes to round to update when no players pick card
        // (because game.state remains the same)
        $scope.$watch('game.round', function () {
          $scope.hasPickedCards = false;
          $scope.showTable = false;
          $scope.winningCardPicked = false;
          $scope.makeAWishFact = makeAWishFacts.pop();
          if (!makeAWishFacts.length) {
            makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
          }
          $scope.pickedCards = [];
        });

        // In case player doesn't pick a card in time, show the table
        $scope.$watch('game.state', function () {
          if (game.state === 'waiting for czar to decide'
            && $scope.showTable === false) {
            $scope.showTable = true;
          }
        });

        $scope.$watch('game.gameID', function () {
          if (game.gameID && game.state === 'awaiting players') {
            if (!$scope.isCustomGame() && $location.search().game) {
            // If the player didn't successfully enter the request room,
            // reset the URL so they don't think they're in the requested room.
              $location.search({});
            } else if ($scope.isCustomGame() && !$location.search().game) {
            // Once the game ID is set,
            // update the URL if this is a game with friends,
            // where the link is meant to be shared.
              $location.search({ game: game.gameID });
              if (!$scope.modalShown) {
                setTimeout(function () {
                  var link = document.URL;
                  var txt = 'Give the following link to your'
                  + 'friends so they can join your game: ';
                  $('#lobby-how-to-play').text(txt);
                  $('#oh-el').css({
                    'text-align': 'center',
                    'font-size': '22px',
                    'background': 'white',
                    'color': 'black'
                  }).text(link);
                }, 200);
                $scope.modalShown = true;
              }
            }
          }
        });

        /**
         * Method to initial game when player selects a region
         * @returns {null} - null
         */
        $scope.initialGame = function () {
          if ($scope.selectedRegion) {
            game.joinGame('joinGame', null, null, $scope.selectedRegion);
            $('#region-modal').modal('close');
          }
        };

        /**
         * Shows modal on game page
         * @param {String} modalClassName
         * @returns {null} - null
         */
        $scope.showModal = function (modalClassName) {
          console.log('show modal');
          document.querySelector(modalClassName).classList.remove('hide');
        };

        /**
         * Close modal on game page
         * @param {String} modalClassName
         * @returns {null} - null
         */
        $scope.closeModal = function (modalClassName) {
          document.querySelector(modalClassName).classList.add('hide');
        };


        /**
         *
         * @param {boolean} condition  condition must either be a boolean or
         * return a boolean
         * @param {string} isFalseClass  class returned if conditon is false
         * @param {string} isTrueClass   class returned if conditon is false
         * @returns {string} class
         */
        $scope.toggleClassName = function (condition, isFalseClass, isTrueClass) {
          if (condition) return isTrueClass;
          return isFalseClass;
        };

        /**
         * Handles donation on game page
         * @returns {null} null
         */
        $scope.donate = function () {
          var now = new Date();
          const currentMonth = now.toLocaleString('en-us', { month: 'long' });
          var donation = {
            date: `${currentMonth} ${now.getDate()}, ${now.getFullYear()}`,
            amount: 5
          };

          Global.getUser().then(function (response) {
            if (response.authenticated) {
              console.log(response.authenticated);
              console.log(donation);
              DonationService.donate(donation).then(function () {
                $window.location.href = 'https://www.crowdrise.com/cfhio/fundraiser/cards4humanity';
              });
            } else {
              $window.location.href = 'https://www.crowdrise.com/cfhio/fundraiser/cards4humanity';
            }
          });
        };

        $('.sidenav').sidenav();

        /**
         * Function to start game once page loads
         */
        /*
        if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
          console.log('joining custom game');
          game.joinGame('joinGame', $location.search().game);
        } else if ($location.search().custom) {
          game.joinGame('joinGame', null, true);
        } else {
          game.joinGame();
        }
        */
      }]);
