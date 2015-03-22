var hoursApp = angular.module('hoursApp', ['ng', 'ngCookies', 'ui.router', 'ui.bootstrap', 'hoursControllers', 'hoursFactory', 'hoursLoginFactory']);

hoursApp.config(function($stateProvider, $urlRouterProvider) {
	
	$urlRouterProvider.otherwise('/');

	$stateProvider
	.state('home', {
		url: '/',
		templateUrl: 'views/queues.html',
		controller: 'QueuesCtrl'
	})
	.state('home.login', {
		url: 'login',
		templateUrl: 'views/loginModal.html',
		controller: 'LoginCtrl'
	})
	.state('admin', {
		url: '/admin',
		templateUrl: 'views/admin.html',
		controller: 'AdminCtrl'
	})
	.state('staff', {
		url: '/staff',
		templateUrl: 'views/staff.html',
		controller: 'StaffCtrl'
	})
	.state('staff.queues', {
		url: '/queues',
		templateUrl: 'views/staffQueues.html',
		controller: 'StaffQueuesCtrl'
	})
	.state('staff.history', {
		url: '/history',
		templateUrl: 'views/staffHistory.html',
		controller: 'StaffHistoryCtrl'
	});


});
