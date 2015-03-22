<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

session_start();
include_once("connection.php");

$action = $_GET['action'];

switch ($action) {
	case 'getActiveQueues':
		$query = "SELECT S.*, Q.FullName FROM staff as S LEFT JOIN (SELECT * FROM queue_entries WHERE Date(Date)=CURDATE() AND Seen=0) as Q ON S.StaffName = Q.StaffName WHERE S.Active=1 ORDER BY S.StaffName";
		mysqli_real_escape_string($conn, $query);
		$result = mysqli_query($conn, $query);

		// Create JSON form MySQL output to return to factory call
		$oldStaff = "";
		$output = "[";
		while ($row = mysqli_fetch_assoc($result)) {
			if ($oldStaff != $row["StaffName"]) {
				if ($output != "[") {
					$output .= "]},";
				}
				$oldStaff = $row["StaffName"];
				$output .= '{"StaffName":"'.$row["StaffName"] . '","Students":[';
				if ($row["FullName"] != "") {
					$output .= '"'.$row["FullName"].'"';
				}
			}else {
				$output .= ',"'.$row["FullName"].'"';
			}
		}
		if($output != "[") {
			$output .= "]}";
		}
		$output .= "]";
		break;
	

	case 'getAdminQueues':
		if(!isset($_SESSION['role'])) {
			$output = '{"status":"fail"}';
		} else {
			$query = "SELECT S.StaffName, Q.FullName, Q.Date, Q.UNI, Q.StudentType, Q.Reason, Q.Comments, Q.Seen FROM staff as S LEFT JOIN (SELECT * FROM queue_entries WHERE Date(Date)=CURDATE() AND Seen=0 ORDER BY StaffName) as Q ON S.StaffName = Q.StaffName ORDER BY StaffName, Q.Date";
			mysqli_real_escape_string($conn, $query);
			$result = mysqli_query($conn, $query);
			$oldStaff = "";
			$output = '{"status":"success", "queues":[';
			while ($row = mysqli_fetch_assoc($result)) {
				if ($oldStaff != $row["StaffName"]) {
					if ($output != '{"status":"success", "queues":[') {
						$output .= "]},";
					}
					$oldStaff = $row["StaffName"];
					$output .= '{"StaffName":"'.$row["StaffName"] . '","Students":[';
					if ($row["FullName"] != "") {
						$output .= '{"StudentName":"'.$row["FullName"].'",';
						$output .= '"StaffName":"'.$row["StaffName"].'",';
						$output .= '"Date":"'.$row["Date"].'",';
						$output .= '"UNI":"'.$row["UNI"].'",';
						$output .= '"StudentType":"'.$row["StudentType"].'",';
						$output .= '"Reason":"'.$row["Reason"].'",';
						$output .= '"Comments":"'.$row["Comments"].'",';
						$output .= '"Seen":"'.$row["Seen"].'"}';
					}
				}else {
						$output .= ',{"StudentName":"'.$row["FullName"].'",';
						$output .= '"StaffName":"'.$row["StaffName"].'",';
						$output .= '"Date":"'.$row["Date"].'",';
						$output .= '"UNI":"'.$row["UNI"].'",';
						$output .= '"StudentType":"'.$row["StudentType"].'",';
						$output .= '"Reason":"'.$row["Reason"].'",';
						$output .= '"Comments":"'.$row["Comments"].'",';
						$output .= '"Seen":"'.$row["Seen"].'"}';
				}
			}
			if($output != '{"status":"success", "queues":[') {
				$output .= "]}";
			}
			$output .= "]}";
		}
		break;
	


	case 'getHistory':
		if($_SESSION['role'] != "staff") {
			$output = '{"status":"fail"}';
		} else {
			$query = "SELECT UNIX_TIMESTAMP(Date) as Date, UNI, FullName, StudentType, StaffName, Reason, Comments, Seen FROM queue_entries";
			mysqli_real_escape_string($conn, $query);
			$result = mysqli_query($conn, $query);

			$output = '{"status":"success", "history":[';
			while ($row = mysqli_fetch_assoc($result)) {
				if ($output != '{"status":"success", "history":[') {$output .= ",";}
				$output .= '{"Date":"'				. $row["Date"]				. '",';
				$output .= '"UNI":"'					. $row["UNI"]					. '",';
				$output .= '"FullName":"'			. $row["FullName"] 		. '",';
				$output .= '"StudentType":"'	. $row["StudentType"] . '",';
				$output .= '"StaffName":"'		. $row["StaffName"] 	. '",';
				$output .= '"Reason":"'				. $row["Reason"]			. '",';
				$output .= '"Comments":"'			. $row["Comments"]		. '",';
				$output .= '"Seen":"'					. $row["Seen"]				. '"}';
			}
			$output .= "]}";
		}
		break;
	


	case 'getAllStaff':
		if($_SESSION['role'] != 'admin') {
			$output = '{"status":"fail"}';
		} else {
			// Query database for all staff members
			$query = "SELECT * FROM staff Order By staff.StaffName";
			mysqli_real_escape_string($conn, $query);
			$result = mysqli_query($conn, $query);

			// Create JSON output from MySQL output
			$output = '{"status":"success", "staffList":[';
			while ($row = mysqli_fetch_assoc($result)) {
				if ($output != '{"status":"success", "staffList":[') {$output .= ",";}
				$output .= '{"StaffName":"'			. $row["StaffName"]			. '",';
				$output .= '"Active":"'					. $row["Active"]				. '"}';
			}
			$output .= "]}";
		}
		break;
	


	case 'removeFromQueue':
		// Grad POST data from factory call
		$data = json_decode(file_get_contents("php://input"));
		$uni = $data->uni;
		$staffName = $data->staffName;

		// Update statement to change student's state to seen
		$query = "UPDATE queue_entries SET Seen=1 WHERE StaffName='{$staffName}' AND UNI='{$uni}' AND DATE(Date)=CURDATE()";
		mysqli_real_escape_string($conn, $query);
		mysqli_query($conn, $query);
		break;
	


	case 'changeStaffStatus':
		if(!isset($_SESSION['role']))
			header("Location: http://localhost/~davidfig93/Hours/#/login");
		// Grab POST data from factory call
		$data = json_decode(file_get_contents("php://input"));
		$active = $data->active;
		$staffName = $data->staffName;

		// Update statement to give Staff member desired Active state
		$query = "UPDATE staff SET Active={$active} WHERE StaffName='{$staffName}'";
		mysqli_real_escape_string($conn, $query);
		mysqli_query($conn, $query);
		break;
	


	case 'addStudentQueueEntry':
		if($_SESSION['role'] != 'admin')
			header("Location: http://localhost/~davidfig93/Hours/#/login");
		$data = json_decode(file_get_contents("php://input"));
		$fullName = $data->fullName;
		$uni = $data->uni;
		$studentType = $data->studentType;
		$staffName = $data->staffName;
		$reason = $data->reason;
		$comments = $data->comments;

		$query = "INSERT INTO queue_entries values(CURRENT_TIMESTAMP, '{$uni}', '{$fullName}', '{$studentType}', '{$staffName}', '{$reason}', '{$comments}', 0)";
		mysqli_real_escape_string($conn, $query);
		mysqli_query($conn, $query);
		break;
	


	default:
		break;
}

mysqli_close($conn);
switch ($action) {
	case 'getActiveQueues':
	case 'getAdminQueues':
	case 'getHistory':
	case 'getAllStaff':
		echo($output);
		break;
	
	default:
		break;
}

?>