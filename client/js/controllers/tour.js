/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0 wrap-iife: 0 */
/* eslint vars-on-top: 0, no-var: 0, object-shorthand: 0, no-plusplus: 0 */
/* eslint prefer-template: 0, quote-props: 0, no-else-return: 0 no-console: 0 */
/* eslint max-len: 0 */
angular.module('mean.system')
  .controller(
    'TourController',
    ['$scope', '$window', 'ngIntroService',
      function ($scope, $window, ngIntroService) {
        $scope.IntroOptions = {
          steps: [
            {
              element: '#timer-tour',
              intro: 'This is the game timer. A round lasts for 20 seconds.'
            },
            {
              element: '#question-tour',
              intro: 'This is a sample question for the game.'
            },
            {
              element: '#cards-board-tour',
              intro: 'You can click on any of these cards to select your answer to the current question.',
              position: 'top'
            },
            {
              element: '#score-board-tour',
              intro: 'This is the score board for all players.',
              position: 'left'
            },
            {
              element: '#czar-score-card-tour',
              intro: 'This is the Czar. The Czar picks the correct answer for the current round.',
              position: 'top'
            },
            {
              element: '#user-score-card-tour',
              intro: 'This is your score card. It shows you how many rounds you have played and how many rounds you have won.',
              position: 'left'
            },
            {
              intro: '<p class="tour-intro">Thanks For Taking the Tour</p>',
              position: 'right'
            },
          ],
          showStepNumbers: false,
          showBullets: true,
          exitOnOverlayClick: true,
          exitOnEsc: true,
          nextLabel: '<span style="color:green">Next</span>',
          prevLabel: '<span style="color:red">Previous</span>',
          skipLabel: 'Skip Tour',
          doneLabel: '<span style="color:#015E7B; font-weight: 500">Go Back to Game Page</span>'
        };

        const redirectToApp = function () {
          $window.location.href = './#!/app';
        };

        ngIntroService.clear();
        ngIntroService.setOptions($scope.IntroOptions);
        ngIntroService.onComplete(redirectToApp);
        ngIntroService.onExit(redirectToApp);
      }]);
