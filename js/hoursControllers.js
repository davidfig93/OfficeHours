var hoursControllers = angular.module('hoursControllers', []);

// Controller for queues to be displayed.
hoursControllers.controller('QueuesCtrl', ['$scope', '$interval', '$state', 'queues', function($scope, $interval, $state, queues) {
	
	$scope.refreshQueues = function() {
		queues.getActive(function(queues) {
			$scope.queues = queues;
			$scope.rowsOfQueues = chunkForRows(queues, 12/$scope.columnWidth());
		});
	}

	// Get initial state of queues when loading page
	$scope.refreshQueues();

	// Refresh queues every specifies amount of milliseconds
	$interval(function() {
		if($state.is('home')) {
			$scope.refreshQueues();
		}
	}, 2000);

	// Function to return size of columns according to number of active queues
	$scope.columnWidth = function() {
		switch($scope.queues.length) {
			case 0:
				break;
			case 1:
			case 2:
				return 6;
				break;
			case 3:
			case 6:
				return 4;
				break;
			default:
				return 3;
				break;
		}
	}
}]);


// Controller for Login Modal view
hoursControllers.controller('LoginCtrl', ['$scope', '$location', '$cookieStore', 'loginService', function($scope, $location, $cookieStore, loginService){
	
	// Set initial no error state
	$scope.displayErrorMessage = false;

	// Function to attempt login
	$scope.attemptLogin = function() {
		loginService.login($scope.login, function(loginService) {
			$scope.statusMessage = loginService;
			if(loginService.status == "success") {
				$scope.displayErrorMessage = false;
				$cookieStore.put('role', loginService.role);
				$cookieStore.put('user', $scope.login.username);
				$cookieStore.put('time', new Date());
				if($cookieStore.get('role') == 'admin') {
					$location.path('admin');	
				} else if($cookieStore.get('role') == 'staff') {
					$location.path('staff/queues');
				}
				
			} else {
				// On login incorrect, display error message
				$scope.displayErrorMessage = true;
			}
		});
	}
}]);



// Controller for Admin view where one can input new student entries for office hours
// Admin user also has the ability to control what queues to display
// Admin user also has the ability to remove entries in specific queues
hoursControllers.controller('AdminCtrl', ['$scope', '$interval', '$location', '$state', 'queues', 'loginService', function($scope, $interval, $location, $state, queues, loginService) {


	// Function to refresh queues
	$scope.refreshQueues = function() {
		queues.getAdminQueues(function(queues) {
			if(queues.status == "fail") {
				$location.path('login');
			} else {
				$scope.rowsOfQueues = chunkForRows(queues.queues, 4);
			}
		});
	};

	// Function refresh staff list
	$scope.refreshStaffList = function() {
		queues.getAllStaff(function(queues) {
			if(queues.status == "fail") {
				$location.path('login');
			}
			$scope.staffList = queues.staffList;
		});
	};

	// Function to remove individual student from specific queue
	$scope.removeStudent = function(student) {
		queues.removeFromQueue(student.UNI, student.StaffName, function() {
			$scope.wasCompleted = queues;
			$scope.refreshQueues();
		});
	};

	// Function to add student to queue in database
	$scope.addStudent = function() {
		queues.addQueueEntry($scope.newEntry, function() {
			// On success reset inputs
			$scope.newEntry = {};
			$scope.refreshQueues();
		});
	};

	// Function to flip Active status for staff member
	$scope.changeStaffStatus = function(staff) {
		queues.changeStaffStatus(staff.StaffName, staff.Active, function() {
			$scope.refreshStaffList();
		});
	};

	$scope.logout = function() {
		loginService.logout();
	}

	// Get list of staff members
	$scope.refreshStaffList();

	// Get initial state of queues when loading page
	$scope.refreshQueues();

	//Refresh state of queues every 5 seconds
	$interval(function() {
		if($state.is('admin')) {
			$scope.refreshQueues();
		}
	}, 5000);

}]);



// Controller for staff view
// Staff user can see comments for entries in queues
// Staff user can remove entries from specific queues
hoursControllers.controller('StaffCtrl', ['$scope', 'loginService', function($scope, loginService){
	// Function for logout button click
	$scope.logout = function() {
		loginService.logout();
	}
}]);

hoursControllers.controller('StaffHistoryCtrl', ['$scope', 'queues',  function($scope, queues) {
	queues.getHistory(function(queues) {
		if(queues.status == "fail") {
			$location.path('login');
		}
		$scope.historyTable = queues.history;
	});
}]);

hoursControllers.controller('StaffQueuesCtrl', ['$scope', '$interval', '$location', '$state', 'queues', function($scope, $interval, $location, $state, queues){
	$scope.refreshQueues = function() {
		queues.getAdminQueues(function(queues) {
		
			if(queues.status == "fail") {
				$location.path('login');
			} else {
					$scope.rowsOfQueues = chunkForRows(queues.queues, 4);
			}	
		
			
		});
	};

	// Function to remove student from queue
	$scope.removeStudent = function(student) {
		queues.removeFromQueue(student.UNI, student.StaffName, function() {
			$scope.wasCompleted = queues;
			$scope.refreshQueues();
		});
	};

	// Initial loading of queues
	$scope.refreshQueues();

	// Refresh queues data every indicated number of milliseconds
	$interval(function() {
		if($state.is('staff.queues')) {
			$scope.refreshQueues();
		}
	}, 5000);
}]);


/* Formatting functions */

// Function to split array into array of subarrays for formatting purposes
function chunkForRows(array, chunkSize) {
	var chunks = [];
	var i = 0;

	 while (i < array.length) {
    chunks.push(array.slice(i, i += chunkSize));
  }
  return chunks;
}