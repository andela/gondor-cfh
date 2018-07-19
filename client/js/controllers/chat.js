angular.module('mean.system')
  .controller('ChatController', [
    '$scope', '$firebaseArray', 'game',
    ($scope, $firebaseArray, game) => {
      const ref = new Firebase(`https://gondor-cfh.firebaseio.com/${
        game.gameID}`);
      // firebase chat messages
      $scope.messages = $firebaseArray(ref);
      $scope.inputText = '';
      $scope.open = 'arrow_drop_up';
      $scope.name = '';
      $scope.disable = true;
      $scope.showNotifications = false;
      // handle chat notifications
      let prevMessages = 0,
        newMessages = 0,
        unreadMessages = 0,
        chatIsOpen = false;
        // click on up and down logo
      $('.chat-header').click(() => {
        if ($('.chat-container').hasClass('is-up')) {
          $('.chat-container').removeClass('is-up').addClass('is-down');
          $scope.open = 'arrow_drop_up';
          chatIsOpen = false;
        } else {
          $('.chat-container').removeClass('is-down').addClass('is-up');
          $scope.open = 'arrow_drop_down';
          chatIsOpen = true;
        }
      });
      // scroll to new user input
      $scope.scrollToNew = () => {
        $('.chat-messages').stop().animate({
          scrollTop: $('.chat-messages')[0].scrollHeight
        }, 1000);
      };
      $scope.edit = () => {
        $scope.disable = false;
      };
      // check for changes on chat notifications
      $scope.$watch(() => {
        if (!chatIsOpen) {
          newMessages = $scope.messages.length;
          unreadMessages = newMessages - prevMessages;
          $scope.unreadMessages = unreadMessages < 1
            ? null : unreadMessages;
          $scope.showNotifications = unreadMessages > 0;
        } else {
          prevMessages = $scope.messages.length;
          $scope.unreadMessages = null;
          $scope.showNotifications = false;
        }
      });
      // send message to firebase
      $scope.sendMessage = () => {
        $scope.participant = game.players[game.playerIndex];
        // user data
        $scope.payload = {
          avatar: $scope.participant.avatar,
          username: $scope.participant.username,
          text: $scope.newMessageText,
          date: new Date(Date.now()).toLocaleTimeString('en-US')
            .replace(/:\d+ /, ' ')
        };
        $scope.name = $scope.payload.username;
        $scope.messages.$add($scope.payload);
        $scope.newMessageText = '';
        $scope.scrollToNew();
      };
      // send message via Enter key
      $scope.enterEvent = event => (event.which === 13 && $scope.newMessageText
         !== '' ? $scope.sendMessage() : '');
      $scope.addMessage = () => ($scope.newMessageText !== ''
        ? $scope.sendMessage() : '');
      $(document).ready(() => {
        const emoji = $('#emoji').emojioneArea({
          autoHideFilters: true,
          hidePickerOnBlur: true,
          pickerPosition: 'top',
          recentEmojis: true,
          search: true,
          placeholder: 'Type a message',
          hideSource: true,
          inline: true,
          events: {
            keyup: (editor, event) => {
              if (event.which === 13 && $scope.newMessageText !== '') {
                editor.focus();
                $('#submit').click();
                $('html').click();
                emoji.data('emojioneArea').hidePicker();
              } else {
                $scope.newMessageText = emoji.data('emojioneArea').getText();
              }
            }
          }
        });
        $('#submit').on('click', () => {
          $scope.newMessageText = emoji.data('emojioneArea').getText();
          if ($scope.newMessageText !== '') {
            emoji.data('emojioneArea').setText('');
            $scope.sendMessage();
          }
        });
      });
    }]);
