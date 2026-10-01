<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'POST required']); exit; }
$input=json_decode(file_get_contents('php://input'),true);
if(!is_array($input)){ http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid booking data']); exit; }
$required=['name','phone','email','pickup','destination','date','time','passengers','journeyType','estimatedFare'];
foreach($required as $field){ if(empty(trim((string)($input[$field]??'')))){ http_response_code(422); echo json_encode(['success'=>false,'message'=>'Please complete all required fields.']); exit; } }
$email=filter_var($input['email'],FILTER_VALIDATE_EMAIL);
if(!$email){ http_response_code(422); echo json_encode(['success'=>false,'message'=>'Please enter a valid email address.']); exit; }
function clean($v){ return trim(strip_tags((string)$v)); }
$type=clean($input['journeyType']);
$typeLabel=['standard'=>'Standard journey','event'=>'Event journey','airport'=>'Airport transfer'][$type]??'Journey';
$subject='AAA Travel booking request — '.clean($input['date']).' '.clean($input['time']);
$lines=[
 'NEW AAA TRAVEL BOOKING REQUEST','',
 'Journey type: '.$typeLabel,
 'Pick-up postcode: '.clean($input['pickup']),
 'Destination postcode: '.clean($input['destination']),
 'Date: '.clean($input['date']),
 'Pick-up time: '.clean($input['time']),
 'Passengers: '.clean($input['passengers']),
 'Journey: '.(clean($input['returnJourney']??'oneway')==='return'?'Return':'One way'),
 'Estimated miles: '.clean($input['estimatedMiles']??'Not available'),
 'Estimated fare: '.clean($input['estimatedFare']),
 'Payment: CASH ON ARRIVAL',''
];
if($type==='event'){
 $lines[]='EVENT DETAILS'; $lines[]='Event / venue: '.clean($input['eventName']??''); $lines[]='Return collection time: '.clean($input['returnTime']??''); $lines[]='Collection point: '.clean($input['meetingPoint']??''); $lines[]='';
}
$lines[]='CUSTOMER'; $lines[]='Name: '.clean($input['name']); $lines[]='Phone: '.clean($input['phone']); $lines[]='Email: '.clean($input['email']); $lines[]='Additional information: '.clean($input['notes']??'');
$body=implode("\r\n",$lines);
$to='aaa_travel@outlook.com';
$headers='From: AAA Travel Website <no-reply@'.($_SERVER['SERVER_NAME']??'localhost').">\r\n";
$headers.='Reply-To: '.$email."\r\n";
$headers.='MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n';
$sent=@mail($to,$subject,$body,$headers);
if(!$sent){ http_response_code(500); echo json_encode(['success'=>false,'message'=>'Your web host did not accept the email. PHP mail() may need enabling by the hosting provider.']); exit; }
// Optional confirmation email to customer. If the host blocks outbound mail, the booking to AAA may still have been accepted.
$customerSubject='AAA Travel booking request received';
$customerBody="Thank you for your booking request with AAA Travel.\n\nYour requested journey:\n".clean($input['pickup'])." → ".clean($input['destination'])."\nDate: ".clean($input['date'])."\nTime: ".clean($input['time'])."\nEstimated fare: ".clean($input['estimatedFare'])."\nPayment: Cash on arrival\n\nAAA Travel will contact you to confirm your journey and fare.\n\nPlease do not reply if any details are incorrect; contact AAA Travel directly.";
@mail($email,$customerSubject,$customerBody,'From: AAA Travel Website <no-reply@'.($_SERVER['SERVER_NAME']??'localhost').">\r\nContent-Type: text/plain; charset=UTF-8\r\n");
echo json_encode(['success'=>true,'message'=>'Booking sent']);
