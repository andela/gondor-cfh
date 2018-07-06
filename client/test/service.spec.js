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

      spyOn(global, 'getUser').and.callThrough();
    });

    it('exists', function () {
      expect(global.getUser).toBeDefined();
      expect(typeof global.getUser).toEqual('function');
    });

    it('returns a user', function () {
      httpBackend.whenGET('/api/profile').respond(200, user);

      global.getUser().then(function (response) {
        httpBackend.flush();
        expect(response.data.user.username).to.equal('test');
      });
    });

    it('returns error', function () {
      httpBackend.whenGET('/api/profile').respond(401, { message: 'error' });

      global.getUser().then(function (response) {
        httpBackend.flush();
        expect(response.data.message).to.equal('error');
      });
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

      spyOn(leaderboard, 'getLeaderboard').and.callThrough();
    });

    it('exists', function () {
      expect(leaderboard.getLeaderboard).toBeDefined();
      expect(typeof leaderboard.getLeaderboard).toEqual('function');
    });

    it('returns data', function () {
      httpBackend.whenGET('/api/leaderboard').respond(200, { check: 'test' });

      leaderboard.getLeaderboard().then(function (response) {
        httpBackend.flush();
        expect(response.data.check).to.equal('test');
      });
    });

    it('returns error', function () {
      httpBackend
        .whenGET('/api/leaderboard').respond(401, { message: 'error' });

      leaderboard.getLeaderboard().then(function (response) {
        httpBackend.flush();
        expect(response.data.message).to.equal('error');
      });
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

      spyOn(donations, 'userDonated').and.callThrough();
    });

    it('exists', function () {
      expect(donations.userDonated).toBeDefined();
      expect(typeof donations.userDonated).toEqual('function');
    });

    it('returns data', function () {
      httpBackend
        .whenGET('/api/leaderboard').respond(200, { check: 'test' });

      donations.userDonated().then(function (response) {
        httpBackend.flush();
        expect(response.data.check).to.equal('test');
      });
    });

    it('returns error', function () {
      httpBackend
        .whenGET('/api/leaderboard').respond(401, { message: 'error' });

      donations.userDonated().then(function (response) {
        httpBackend.flush();
        expect(response.data.message).to.equal('error');
      });
    });
  });
});
