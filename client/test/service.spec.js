/* eslint prefer-arrow-callback: 0,
func-names: 0, no-undef: 0, no-unused-vars: 0, no-var: 0 */

describe('Service', function () {
  describe('Global', function () {
    var $rootScope, $scope, httpBackend, global;

    beforeEach(function () {
      module('mean.system');

      inject(function (_$rootScope_, _$httpBackend_, _$http_, $injector) {
        global = $injector.get('Global');
        $rootScope = _$rootScope_;
        $http = _$http_;
        httpBackend = _$httpBackend_;
      });

      $scope = $rootScope.$new();
    });

    it('exists', function () {
      expect(global.getUser).toBeDefined();
      expect(typeof global.getUser).toEqual('function');
    });

    it('returns data when getUser() method is successful', function () {
      httpBackend.whenGET('/api/profile').respond(200, { user });

      global.getUser().then(function (response) {
        expect(response.user.username).toEqual('test');
      });
      httpBackend.flush();
    });

    it('returns error when getUser() method is unsuccessful', function () {
      httpBackend.whenGET('/api/profile').respond(401, { message: 'error' });

      global.getUser().then(function (response) {
        expect(response.user).toEqual(null);
      });
      httpBackend.flush();
    });
  });

  describe('Leaderboard', function () {
    var $rootScope, $scope, httpBackend, leaderboard;

    beforeEach(function () {
      module('mean.system');

      inject(function (_$rootScope_, _$httpBackend_, _$http_, $injector) {
        leaderboard = $injector.get('LeaderboardService');
        $rootScope = _$rootScope_;
        $http = _$http_;
        httpBackend = _$httpBackend_;
      });

      $scope = $rootScope.$new();
    });

    it('exists', function () {
      expect(leaderboard.getLeaderboard).toBeDefined();
      expect(typeof leaderboard.getLeaderboard).toEqual('function');
    });

    it('returns data when getLeaderboard() method is successful', function () {
      httpBackend.whenGET('/api/leaderboard').respond(200, { check: 'test' });

      leaderboard.getLeaderboard().then(function (response) {
        expect(response.check).toEqual('test');
      });
      httpBackend.flush();
    });

    it('returns error when getLeaderboard() method is unsuccessful',
      function () {
        httpBackend
          .whenGET('/api/leaderboard').respond(401, { players: [] });

        leaderboard.getLeaderboard().then(function (response) {
          expect(response.players.length).toEqual(0);
        });
        httpBackend.flush();
      });
  });

  describe('Donations', function () {
    var $rootScope, $scope, httpBackend, donations;

    beforeEach(function () {
      module('mean.system');

      inject(function (_$rootScope_, _$httpBackend_, _$http_, $injector) {
        donations = $injector.get('DonationService');
        $rootScope = _$rootScope_;
        $http = _$http_;
        httpBackend = _$httpBackend_;
      });

      $scope = $rootScope.$new();
    });

    it('donate method exists', function () {
      expect(donations.donate).toBeDefined();
      expect(typeof donations.donate).toEqual('function');
    });

    it('getDonations method exists', function () {
      expect(donations.getDonations).toBeDefined();
      expect(typeof donations.getDonations).toEqual('function');
    });

    it('returns data when donate() method is successful', function () {
      httpBackend
        .whenPOST('/api/donations').respond(201, { check: 'test' });

      donations.donate().then(function (response) {
        expect(response.check).toEqual('test');
      });
      httpBackend.flush();
    });

    it('returns data when getDonations() method is successful', function () {
      httpBackend
        .whenGET('/api/donations').respond(200, { check: 'test' });

      donations.getDonations().then(function (response) {
        expect(response.check).toEqual('test');
      });
      httpBackend.flush();
    });

    it('returns error when donate() method is unsuccessful', function () {
      httpBackend
        .whenPOST('/api/donations').respond(401, { message: 'error' });

      donations.donate().then(function (response) {
        expect(response.message).toEqual('Something Happened');
      });
      httpBackend.flush();
    });

    it('returns error when donate() method is unsuccessful', function () {
      httpBackend
        .whenGET('/api/donations').respond(401, {
          user: {
            donations: []
          }
        });

      donations.getDonations().then(function (response) {
        expect(response.user.donations.length).toEqual(0);
      });
      httpBackend.flush();
    });
  });

  describe('Games', function () {
    var $rootScope, $scope, httpBackend, games;

    beforeEach(function () {
      module('mean.system');

      inject(function (_$rootScope_, _$httpBackend_, _$http_, $injector) {
        games = $injector.get('GamesService');
        $rootScope = _$rootScope_;
        $http = _$http_;
        httpBackend = _$httpBackend_;
      });

      $scope = $rootScope.$new();
    });

    it('exists', function () {
      expect(games.getHistory).toBeDefined();
      expect(typeof games.getHistory).toEqual('function');
    });

    it('returns data when getHistory() method is successful', function () {
      httpBackend
        .whenGET('/api/games/history').respond(200, { check: 'test' });

      games.getHistory().then(function (response) {
        expect(response.check).toEqual('test');
      });
      httpBackend.flush();
    });

    it('returns error when getHistory() method is unsuccessful', function () {
      httpBackend
        .whenGET('/api/games/history').respond(401, { games: [] });

      games.getHistory().then(function (response) {
        expect(response.games.length).toEqual(0);
      });
      httpBackend.flush();
    });
  });

  describe('Avatar', function () {
    var $rootScope, $scope, httpBackend, avatars;

    beforeEach(function () {
      module('mean.system');

      inject(function (_$rootScope_, _$httpBackend_, _$http_, $injector) {
        avatars = $injector.get('AvatarService');
        $rootScope = _$rootScope_;
        $http = _$http_;
        httpBackend = _$httpBackend_;
      });

      $scope = $rootScope.$new();
    });

    it('exists', function () {
      expect(avatars.getAvatars).toBeDefined();
      expect(typeof avatars.getAvatars).toEqual('function');
    });

    it('returns data when getAvatars() method is successful', function () {
      httpBackend
        .whenGET('/avatars').respond(200, { check: 'test' });

      avatars.getAvatars().then(function (response) {
        expect(response.check).toEqual('test');
      });
      httpBackend.flush();
    });

    it('returns error when getAvatars() method is unsuccessful', function () {
      httpBackend
        .whenGET('/avatars').respond(401, { avatars: [] });

      avatars.getAvatars().then(function (response) {
        expect(response.avatars).toEqual([]);
      });
      httpBackend.flush();
    });
  });

  describe('MakeAWishFacts', function () {
    var $rootScope, $scope, httpBackend, facts;

    beforeEach(function () {
      module('mean.system');

      inject(function (_$rootScope_, $injector) {
        facts = $injector.get('MakeAWishFactsService');
        $rootScope = _$rootScope_;
      });

      $scope = $rootScope.$new();
    });

    it('exists', function () {
      expect(facts.getMakeAWishFacts).toBeDefined();
      expect(typeof facts.getMakeAWishFacts).toEqual('function');
    });

    it('returns data when getMakeAWishFacts() method is successful',
      function () {
        const factList = facts.getMakeAWishFacts();

        expect(factList.length).toEqual(24);
      });
  });
});
