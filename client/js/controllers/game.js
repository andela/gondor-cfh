/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0 wrap-iife: 0 */
/* eslint vars-on-top: 0, no-var: 0, object-shorthand: 0, no-plusplus: 0 */
/* eslint prefer-template: 0, quote-props: 0, no-else-return: 0 no-console: 0 */
/* eslint max-len: 0, prefer-destructuring: 0 */
angular.module('mean.system')
  .controller(
    'GameController',
    ['$scope', 'game', '$window', '$timeout', '$location',
      'MakeAWishFactsService', '$dialog', '$http', 'Global', 'socket', 'DonationService', 'FriendService', 'ngIntroService',
      function ($scope, game, $window, $timeout, $location, MakeAWishFactsService,
        $dialog, $http, Global, socket, DonationService, FriendService, ngIntroService) {
        $scope.hasPickedCards = false;
        $scope.winningCardPicked = false;
        $scope.showTable = false;
        $scope.modalShown = false;
        $scope.game = game;
        $scope.pickedCards = [];
        $scope.searchType = 'all';
        $scope.selected = '';
        $scope.match = [];
        $scope.messageLength = 0;
        var makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
        $scope.makeAWishFact = makeAWishFacts.pop();
        game.getRegions();
        Global.getUser().then(function (authUser) {
          $scope.global = authUser;
          var notificationList = [];
          if ($scope.global.user) {
            const payload = { username: $scope.global.user.username, email: $scope.global.user.email };
            socket.emit('userConnected', payload);
          }
          socket.on('onlineInvitation', (data) => {
            $scope.notificationData = data;
            const message = `<div>${data.username} has invited you to play a game as friends. Accept?</div>`;
            notificationList.push(data);
            if (typeof notificationList !== 'undefined'
            && notificationList.length > 0) {
              $scope.notifications = notificationList;
            }
            $scope.messageLength = $scope.notifications.length;
            M.toast({ html: message, displayLength: 2000, classes: 'cfh-toast' });
          });
        });

        $scope.getFriends = function () {
          FriendService.getFriends().then(function (response) {
            $scope.friends = response.user.friends.map(friend => ({ email: friend.email, username: friend.username }));
          });
        };
        $scope.addFriend = function (index, user) {
          if (user && user.username) {
            const username = user.username;
            const email = user.email;
            FriendService.addFriend({ username: username, email: email });
          }
          $scope.notifications.splice(index, 1);
          $scope.messageLength = $scope.notifications.length;
        };
        $scope.selected = undefined;

        socket.on('onlinePlayers', function (players) {
          $scope.fullUsers = players;
          $scope.users = players.filter(function (player) { return player.username !== $scope.global.user.username; });
        });
        $scope.clearSearch = function () {
          $scope.selected = '';
          $scope.search = '';
          $scope.match = [];
        };
        $scope.searchOnlinePlayers = function () {
          if ($scope.selected !== '') {
            var gameUrl = $location.$$absUrl;
            var messageData = {
              gameUrl,
              target: $scope.selected,
              username: $scope.global.user.username,
              email: $scope.global.user.email
            };
            socket.emit('invitePlayer', messageData);
            M.toast({ html: '<p>Your friend has been invited</p>', displayLength: 2000, classes: 'cfh-toast' });
          }
          $scope.selected = '';
        };
        (function (timer, delay) {
          $scope.searchUsers = function () {
            if (timer) {
              $timeout.cancel(timer);
            }
            timer = $timeout(function () {
              $http({
                url: '/api/search/users',
                method: 'GET',
                params: { search: $scope.search },
                headers: {
                  'x-access-token': localStorage.getItem('token')
                }
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

        $scope.czarHasSelectedQuestion = false;
        $scope.flipQuestionCard = function (index) {
          if (!$scope.czarHasSelectedQuestion) {
            $scope.czarHasSelectedQuestion = true;
            const nth = index + 1;
            const selector = `.question-card:nth-child(${nth})`;
            $(`${selector} .back`).css({
              'visibility': 'hidden'
            });
            $(`${selector} .front`).css({
              'visibility': 'visible',
              'z-index': 1
            });
            $timeout(function () {
              $('#czar-question-selection').modal('close');
              $scope.czarHasSelectedQuestion = false;
              game.czarSelectedQuestion(index);
            }, 2000);
          }
        };
        $scope.inviteUsers = function (receiver) {
          var link = document.URL;
          var httpMessage = '</div><h2> You have been invited to join a Cards for Humanity game. Click the link below to join</h2></br>'
        + link + '</div>';
          if (game.players.length < 12) {
            return $http({
              url: '/api/mail',
              method: 'POST',
              data: {
                receiver: receiver,
                subject: 'Game Invitation',
                html: httpMessage
              },
              headers: {
                'x-access-token': localStorage.getItem('token')
              }
            })
              .success(function (data) {
                $scope.search = '';
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
              } else {
                $scope.pickedCards.pop();
              }
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

          if (game.state === 'czar is selecting a question' && $scope.isCzar()) {
            $('#czar-question-selection').modal('open');
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

        // Tour
        $scope.IntroOptions = {
          steps: [
            {
              intro: '<p class="text-center tour-intro">Welcome to <br> <span>Cards For Humanity</span>.</p>You can click on the control buttons below to take a tour of the game.'
            },
            {
              element: '#interaction-board-tour',
              intro: 'This is the game interaction board where the game instructions and current question for each round will appear.'
            },
            {
              element: '#searching-for-players-text-tour',
              intro: 'When there are less than 6 players, the game keeps searching for more players.'
            },
            {
              element: '#players-found-text-tour',
              intro: 'This is where you see how many players have joined the game.'
            },
            {
              element: '#invite-players-btn-tour',
              intro: 'You can click here to invite players to the game instead of just waiting for more players to join.'
            },
            {
              element: '#start-game-btn-tour',
              intro: 'You can click here to start a game when there are enough players.'
            },
            {
              element: '#score-board-tour',
              intro: 'This is where you see your game avatar and game info.',
              position: 'left'
            },
            {
              element: '#instructions-board-tour',
              intro: 'These are the instructions for playing the game.',
              position: 'top'
            },
          ],
          showStepNumbers: false,
          showBullets: true,
          exitOnOverlayClick: true,
          exitOnEsc: true,
          nextLabel: '<span style="color:green">Next</span>',
          prevLabel: '<span style="color:red">Previous</span>',
          skipLabel: 'Skip Tour',
          doneLabel: '<span style="color:#015E7B; font-weight: 500">Tour a Live Game Page</span>'
        };

        ngIntroService.setOptions($scope.IntroOptions);

        $scope.takeTour = function () {
          game.joinGame('joinGame', null, null, 'Africa');
          $('#region-modal').modal('close');
          ngIntroService.start();
        };

        ngIntroService.onComplete(function () {
          $window.location.href = './#!/tourapp';
        });
        ngIntroService.onExit(function () {
          $('#region-modal').modal('open');
        });
      }]);
