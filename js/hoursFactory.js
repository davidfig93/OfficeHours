angular.module('hoursFactory', [])
			 .factory('queues', ['$http', function($http){
	return {
		getActive: function(callback) {
			$http({
				method: 'GET',
				url: 'php/officeHoursService.php?action=getActiveQueues'
			}).success(callback);
		},
		getAdminQueues: function(callback) {
			$http({
				method: 'GET',
				url: 'php/officeHoursService.php?action=getAdminQueues'
			}).success(callback);
		},
		getHistory: function(callback) {
			$http({
				method: 'GET',
				url: 'php/officeHoursService.php?action=getHistory'
			}).success(callback);
		},
		getAllStaff: function(callback) {
			$http({
				method: 'GET',
				url: 'php/officeHoursService.php?action=getAllStaff'
			}).success(callback);
		},
		removeFromQueue: function(uni, staffName, callback) {
			$http({
				method:'POST',
				url: 'php/officeHoursService.php?action=removeFromQueue',
				data: {'uni':uni, 'staffName':staffName}
			}).success(callback);
		},
		changeStaffStatus: function(staffName, status, callback) {
			var newStatus = status == 1 ? 0 : 1;
			$http({
				method:'POST',
				url: 'php/officeHoursService.php?action=changeStaffStatus',
				data: {'staffName':staffName, 'active': newStatus}
			}).success(callback);
		},
		addQueueEntry: function(student, callback) {
			$http({
				method: 'POST',
				url: 'php/officeHoursService.php?action=addStudentQueueEntry',
				data: {'fullName':student.fullName, 'uni':student.uni, 'studentType':student.studentType, 'staffName':student.staffName, 'reason':student.reason, 'comments':student.comments}
			}).success(callback);
		}
	}
}])