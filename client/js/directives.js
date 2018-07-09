/* eslint prefer-arrow-callback: 0,
func-names: 0, no-undef: 0, no-unused-vars: 0, no-var: 0,
object-shorthand: 0, vars-on-top: 0, prefer-template: 0 */

angular.module('mean.directives', [])
  .directive('player', function () {
    return {
      restrict: 'EA',
      templateUrl: '/views/player.html',
      link: function (scope, elem, attr) {
        scope.colors = ['#7CE4E8', '#FFFFa5', '#FC575E',
          '#F2ADFF', '#398EC4', '#8CFF95'];
      }
    };
  }).directive('answers', function () {
    return {
      restrict: 'EA',
      templateUrl: '/views/answers.html',
      link: function (scope, elem, attr) {
        scope.$watch('game.state', function () {
          if (scope.game.state === 'winner has been chosen') {
            var curQ = scope.game.curQuestion;
            var curQuestionArr = curQ.text.split('_');
            var startStyle = "<span style='color: "
            + scope.colors[scope.game.players[scope
              .game.winningCardPlayer].color]
            + "'>";
            var endStyle = '</span>';
            var shouldRemoveQuestionPunctuation = false;
            var removePunctuation = function (cardIndex) {
              var cardText = scope.game.table[scope.game.winningCard]
                .card[cardIndex].text;
              if (cardText.indexOf('.', cardText.length - 2)
                === cardText.length - 1) {
                cardText = cardText.slice(0, cardText.length - 1);
              } else if ((cardText.indexOf('!', cardText.length - 2)
                === cardText.length - 1
                || cardText.indexOf('?', cardText.length - 2)
                  === cardText.length - 1)
                && cardIndex === curQ.numAnswers - 1) {
                shouldRemoveQuestionPunctuation = true;
              }
              return cardText;
            };
            if (curQuestionArr.length > 1) {
              var cardText = removePunctuation(0);
              curQuestionArr.splice(1, 0, startStyle + cardText + endStyle);
              if (curQ.numAnswers === 2) {
                cardText = removePunctuation(1);
                curQuestionArr.splice(3, 0, startStyle + cardText + endStyle);
              }
              curQ.text = curQuestionArr.join('');
              // Clean up the last punctuation mark in the question
              // if there already is one in the answer
              if (shouldRemoveQuestionPunctuation) {
                if (curQ.text.indexOf('.', curQ.text.length - 2)
                === curQ.text.length - 1) {
                  curQ.text = curQ.text.slice(0, curQ.text.length - 2);
                }
              }
            } else {
              curQ.text += ' ' + startStyle
              + scope.game.table[scope.game.winningCard].card[0].text
              + endStyle;
            }
          }
        });
      }
    };
  }).directive('question', function () {
    return {
      restrict: 'EA',
      templateUrl: '/views/question.html',
      link: function (scope, elem, attr) {}
    };
  })
  .directive('timer', function () {
    return {
      restrict: 'EA',
      templateUrl: '/views/timer.html',
      link: function (scope, elem, attr) {}
    };
  })
  .directive('landing', function () {
    return {
      restrict: 'EA',
      link: function (scope, elem, attr) {}
    };
  })
  .directive('comparePassword', function () {
    return {
      restrict: 'EA',
      require: 'ngModel',
      link: function (scope, element, attribute, modelController) {
        // function to compare passwords
        /* eslint-disable */
        function compare(password, $scope) {
          const actualPassword = scope.signupForm.password.$viewValue;
          const confirmPassword = scope.signupForm.confirmPassword.$viewValue;
          const samePassword = actualPassword === confirmPassword;
          scope.signupForm.confirmPassword.$setValidity('samePassword', samePassword);
          return password;
        }
        // adds function to the list of functions that are called when input value changes.
        modelController.$parsers.push(compare);
      }
    };
  });
