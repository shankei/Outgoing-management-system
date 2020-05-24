var express = require('express');
var app = express();  
const http=require('http');
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
var mysql = require('mysql');
var path = require('path');
var fs = require('fs');
var myModule = require('./public/scripts/script');
var cors = require('cors');
const multer = require('multer');
app.use(express.static(path.join(__dirname, 'public')))
let cron = require('node-cron');
let nodemailer = require('nodemailer');
var parking_array = new Array(51).fill(0);
var id = 0;
var no_students='\n';
// e-mail transport configuration
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'rathore.rs.sameer@gmail.com',
      pass: '8868091709@s'
    }
});

// send email from gmail
function sendmail(mailOptions){
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } 
        else {
          console.log('Email sent: ' + info.response);
        }
    });
}

//mysql connection
var connection = mysql.createConnection({
   	host:process.env.DATABASE_HOST,
    user: 'root',
    password:'root',
    database:'Outgoing'
});
connection.connect(function(err) {
	if (err) throw err
	console.log('You are now connected...');
});

//cron job for automatic mail send
cron.schedule('00 22 * * *', () => {
  // Send e-mail
    console.log('10 pm cron job starts and send email to late students');
	var q = "Select roll_no FROM Record_InOut WHERE entry_time IS NULL";
	connection.query(q, function (err, result) {
		if (err){
			
		} 
		else{
			var i=0;
			for(let j=0;j<result.length;j++){
			no_students+='\n'+result[j]['roll_no'];	
			}
			
			for(i=0;i<result.length;i++){
				var q = "Select * FROM Student where roll_no = ?";
				connection.query(q, [result[i]['roll_no']], function(err,result1){
					if(err){

					}
					else{
						let mailOptions = {
    						 from: 'rathore.rs.sameer@gmail.com',
	     				 	 to: result1[0]['email'] ,
	      					 subject: 'Hostel Reminder',
	      					 text: 'Dear '+ result1[0]['name']+',\n you are late, kindly reach hostel ASAP.'
						};
						sendmail(mailOptions);
					}
				});
				
			}
			console.log('Sending email to warden');
			let mailOptions = {
        						 from: 'rathore.rs.sameer@gmail.com',
		     				 	 to: 'mohit.bansal@iiitb.org' ,
		      					 subject: 'Hostel Reminder',
		      					 text: 'These students are late for today after 10pm '+ no_students
							};
			sendmail(mailOptions);
		}
	});
});

var session = require('express-session')

//app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

app.use(bodyParser.json());
app.use(cors({origin: 'http://localhost:5555'}));

var sess;

app.get('/', (req, res) => {
	
     res.redirect('/login');
});

app.route('/login')
    .get((req, res) => {
	res.set('Content-Type', 'text/html')
    res.sendFile(__dirname + '/public/index.html');
});

// login index.html checks who has logged in and corresponding response page is sent to him
app.route('/checkrole')
	.post((req, res) => {		
	email=req.body.email;
	pass=req.body.pass;
	var q = "SELECT role from Login WHERE email = ? AND password = ?";
	connection.query(q, [email,pass], function (err, result) {
		if (err){
			res.end(err);
		} 
		else {       	
			if (result.length){
				sess = req.session;
				sess.email=req.body.email;
				if(result[0].role=='student'){
					var p="SELECT roll_no FROM Student WHERE email = ?";
					connection.query(p,[sess.email], function(err,result1){
						if(err){res.end(err);}
						else{
							sess.roll_no=result1[0]['roll_no'];
							console.log('student has logged in');
						}
					});
                    
					logstore('/checkrole','POST','Student login '+email);
				res.set('Content-Type', 'text/html')
   				res.sendFile(__dirname + '/public/student_dashboard.html');
   				}
   			else if(result[0].role=='warden'){
   				console.log('warden has logged in');
   				logstore('/checkrole','POST','warden login');
				res.set('Content-Type', 'text/html')
   				res.sendFile(__dirname + '/public/warden_dashboard.html');
   			}
   			else if(result[0].role=='guard'){
   				console.log('guard has logged in');
   				logstore('/checkrole','POST','Guard login');
				res.set('Content-Type', 'text/html')
   				res.sendFile(__dirname + '/public/guard_dashboard.html');
   				}
			}
			else
				{
					console.log('user not found');
					logstore('/checkrole','POST','user not found login ');
				res.set('Content-Type', 'text/html')
			    res.sendFile(__dirname + '/public/index.html');	
			}
		 }
	});			
			
});

// return details of a student who is logged in
app.get('/getdetails', function (req, res) {
	var q = "SELECT * from Student WHERE  roll_no = ?";
	connection.query(q, [sess.roll_no], function (err, result) {
		if (err){
			res.end(err);
		} 
		else {
			logstore('/getdetails','GET','Get student details of'+ result[0]['name']);
			console.log('all details picked up picked up for this student');
				res.send(result);
		}
	});
});

// return all applied leaves where status = 0 
app.get('/getLeaves', function (req, res) {
	var q = "SELECT * from Apply_Leave WHERE  status = ?";
	connection.query(q, ['0'], function (err, result) {
		if (err){
			res.end(err);
		} 
		else {
			logstore('/getLeaves','GET','Fetch all leaves which status is 0');
			console.log('All applied leaves are picked up');
			res.send(result);
		}
	});
});	

	
// return student details for given roll number
app.post('/userdetails', function (req, res) {
	var q = "SELECT * from Student WHERE  roll_no = ?";
	connection.query(q, [req.body.roll], function (err, result) {
		if (err){
			res.end(err);
		} 
		else {
			console.log('data for given roll number picked up');
			if(result.length>0)
				res.send(result);

			else{
				res.sendStatus(404);
			}
		}	
	});
});	

// check leave request can happen or not
app.post('/checkleave',function(req,res){
	var q = "SELECT roll_no,MAX(id) as id from Apply_Leave where roll_no= ? and ((exit_time IS NOT NULL and entry_time IS NULL) or status = '0') GROUP BY roll_no";
	connection.query(q, [req.body.roll], function (err, result) {
		if (err){
			res.end(err);
		}
		else{
			if(result.length){
				res.send("no");
			}
			else{
                res.send("yes");
			}	 
		}
	});
});

// Apply leave for this student
app.post('/request_leave', function (req, res) {
	console.log('Inside request leave');
	var roll_number=sess.roll_no;
	var parent=req.body.gdnphn;
	var depart=new Date(req.body.depdate);
	depart= depart.toISOString().split('T')[0] + ' '  
                        + depart.toTimeString().split(' ')[0];

	var resn=req.body.rsn;
	var status="0";
	var dest= req.body.stud_dest;
	var md_travel=req.body.stud_mod;
	var tkt_no=req.body.stud_tkt;
	var q = "INSERT INTO Apply_Leave (roll_no,destination,mode_travel,ticket_no,reason,parents_contact,departure,status) VALUES(?,?,?,?,?,?,?,?)";
	connection.query(q, [roll_number,dest,md_travel,tkt_no,resn,parent,depart,status], function (err, result) {
		if (err){

			console.log("problem in inserting leave info");
		} 
		else {

			console.log("leave info inserted successfully");
		}
	});
	logstore('/request_leave','POST','Insert Leave application in database');
	res.set('Content-Type', 'text/html')
	res.sendFile(__dirname + '/public/student_dashboard.html');
});

// function to accept leave by warden
app.post('/allow_leave', function (req, res) {
		var q = "UPDATE Apply_Leave set status = ? where id = ?";
		connection.query(q, ["1",req.body.request_no], function (err, result) {
		if (err){
			res.end(err);
		} 
		else {
			console.log('Leave accepted by warden successfully');
			var q = "Select * from Student where roll_no= (select roll_no from Apply_Leave where id = ?)";
			connection.query(q, [req.body.request_no], function (err, result) {
				if (err){
					res.end(err);
				} 
				else{
					let mailOptions = {
		        		from: 'rathore.rs.sameer@gmail.com',
				        to: result[0]['email'] ,
				        subject: 'Permission Granted',
				        text: 'Dear '+ result[0]['name']+',\n you can go on leave.'
					};
					sendmail(mailOptions);
					logstore('/allow_leave','POST','Leave grnated by warden');
					res.end();
				}
			});
		}
	});
});	

// function to reject leave by warden
app.post('/reject_leave', function (req, res) {
		var q = "UPDATE Apply_Leave set status = ? where id = ?";
		connection.query(q, ["-1",req.body.request_no], function (err, result) {
		if (err){
			res.end(err);
		} 
		else {
			console.log('Leave rejected by warden');
			var q = "Select * from Student where roll_no= (select roll_no from Apply_Leave where id = ?)";
			connection.query(q, [req.body.request_no], function (err, result) {
				if (err){
					res.end(err);
				} 
				else{
					let mailOptions = {
		        		from: 'rathore.rs.sameer@gmail.com',
				        to: result[0]['email'] ,
				        subject: 'Permission Rejected',
				        text: 'Dear '+ result[0]['name']+',\n Sorry , You can not go on leave.'
					};
					sendmail(mailOptions);
					logstore('/allow_leave','POST','Leave rejected by warden');
					res.end();
				}
			});
			res.end();
		}
	});
});	

// function to find details for student who is locally going out
app.post('/checkinout', function (req, res) {
	var q = "SELECT roll_no,MAX(id) as id from Record_InOut where roll_no= ? GROUP BY roll_no";
	connection.query(q, [req.body.roll], function (err, result) {
		if (err){
			res.end(err);
		} 
		else {
			if(!result.length){
				console.log("no record found for this student");
				res.send("OUT");
			}
            else{
                var q = "SELECT * from Record_InOut where id= ? and entry_time IS NULL ";
				connection.query(q, [result[0]['id']], function (err, result1) {
					if (err){
						res.end(err);
					}
					else{
						if(result1.length){
							res.send(result1);
						}
						else{
							res.send("OUT");
						}
					} 
				});
            }
		}
	});
});	

// student is going out of college
app.post('/localcheckout', function (req, res) {
	console.log(req.body.roll);
	var date= new Date();
	var exittime=date.toISOString().split('T')[0] + ' '  
                        + date.toTimeString().split(' ')[0]; 
	console.log(exittime);
	var q = "INSERT INTO Record_InOut (roll_no,exit_time) VALUES(?,?)";
	console.log("into local check out for student");
	connection.query(q, [req.body.roll,exittime], function (err, result) {
		if (err){
			res.end(err);
		} 
		else {
			logstore('/localcheckout','POST',req.body.roll+' is local out');
			res.send("done");
		}
	});
});

//check in college function
app.post('/localcheckin', function (req, res) {
	var date= new Date();
	var entrytime=date.toISOString().split('T')[0] + ' '  
                        + date.toTimeString().split(' ')[0]; 
	
	var q = "UPDATE Record_InOut SET entry_time=? where id=?";
	console.log("into local check in for student");
	connection.query(q, [entrytime,req.body.id], function (err, result) {
		if (err){
			res.end(err);
		} 
		else {
			logstore('/localcheckin','POST',sess.roll_no+' is local in');
			res.send("done");
		}
	});
});

//fetch leave details of student on guard
app.post('/Guard_fetch_leave', function (req, res) {
	console.log('guard fetch the leave request of student');
	var depart=new Date(req.body.depdate);
	depart= depart.toISOString().split('T')[0] + ' '  
                        + depart.toTimeString().split(' ')[0];

                        console.log(depart);
	var q = "SELECT roll_no,MAX(id) as id from Apply_Leave where roll_no= ? and departure = ? GROUP BY roll_no";
	connection.query(q, [req.body.rollno,depart], function (err, result) {
		if (err){
			res.end(err);
		} 
		else {
			if(result.length>0){
			 	var q = "SELECT * from Apply_Leave where id= ? and entry_time IS NULL ";
				connection.query(q, [result[0]['id']], function (err, result1) {
					if (err){
						res.end(err);
					}
					else{
						if(result1.length>0){
							logstore('/Guard_fetch_leave','POST','Guard fetch leave details of'+req.body.rollno);
							res.send(result1);
						}
						else{
							console.log("i am he");
							res.sendStatus(404);
						}
					}
				});	
			}
			else{
				res.sendStatus(404);
			}	
		}
	});
});

// student is leaving for home
app.post('/home_checkout', function (req, res) {
	var date= new Date();
	var exittime=date.toISOString().split('T')[0] + ' '  
                        + date.toTimeString().split(' ')[0]; 
	var q = "UPDATE Apply_Leave SET exit_time = ? where id =?";
	console.log("into home check out");
	connection.query(q, [exittime,req.body.id], function (err, result) {
		if (err){
			res.end(err);
		} 
		else {

			console.log('Student left for home');
			var q = "Select * from Student where roll_no= (select roll_no from Apply_Leave where id = ?)";
			connection.query(q, [req.body.id], function (err, result) {
				if (err){
					res.end(err);
				} 
				else{
					let mailOptions = {
		        		from: 'rathore.rs.sameer@gmail.com',
				        to: result[0]['parents_email'] ,
				        subject: 'Your Ward is leaving for home',
				        text: 'Dear Parent, Your ward '+ result[0]['name']+', has left for home. Please be informed.'
					};
					sendmail(mailOptions);
					logstore('/home_checkout','POST', result[0]['name']+' is home out');
					res.end();
				}
			});
			res.send("done");
		}
	});
});
// student came back from home
app.post('/home_checkin', function (req, res) {
	var date= new Date();
	var entrytime=date.toISOString().split('T')[0] + ' '  
                        + date.toTimeString().split(' ')[0]; 
	var q = "UPDATE Apply_Leave SET entry_time = ? where id =?";
	console.log("into home check in");
	connection.query(q, [entrytime,req.body.id], function (err, result) {
		if (err){
			res.end(err);
		} 
		else {
			console.log('Student joined college again');
			var q = "Select * from Student where roll_no= (select roll_no from Apply_Leave where id = ?)";
			connection.query(q, [req.body.id], function (err, result) {
				if (err){
					res.end(err);
				} 
				else{
					let mailOptions = {
		        		from: 'rathore.rs.sameer@gmail.com',
				        to: result[0]['parents_email'] ,
				        subject: 'Your Ward has arrived college',
				        text: 'Dear Parent, Your ward '+ result[0]['name']+', has arrived in college. Please be informed.'
					};
					
					sendmail(mailOptions);
					logstore('/home_checkin','POST', result[0]['name']+' is home in');
					res.end();
				}
			});
			res.send("done");
		}
	});
});

//fetch all parking slot which is fill
function parkingnumber(){
	var q = "SELECT parking_no from Visitor WHERE exit_time IS NULL";
	connection.query(q, function (err, result) {
		if (err){
			
		} 
		else {
			if(result.length){
				for(let i=0;i<result.length;i++){
					parking_array[result[i]['parking_no']]=1;
				}
			}
			
		}
	});
}
//one time function run when server run
parkingnumber();
app.get('/fetchparking_no', function (req, res) {
	var parking_slot=0;
	for(let i=1;i<50;i++){
		if(parking_array[i]==0){
			parking_slot=i;
			break;
		}
	}
	res.send(parking_slot.toString());
});

//visitor entry function
app.post('/visitorentry', function (req, res) {
	
	var visitor_id='visitor_';
	var parking_slot=Number(req.body.parking);
	var vehicle_no=req.body.vehicle;
	var name=req.body.name;
	var email=req.body.email;
	var reason=req.body.reason;
	var date= new Date();
	var entrytime=date.toISOString().split('T')[0] + ' '  
                        + date.toTimeString().split(' ')[0]; 
    parking_array[parking_slot]=1;
    var q="select max(id) as id from Visitor";
    connection.query(q, function (err, result){
    	if(result[0]['id']==null){
    		visitor_id=visitor_id+'1';
    	}
    	else{
    		visitor_id=visitor_id+(result[0]['id']+1).toString();
    	}
	    var q = "INSERT INTO Visitor (visitor_id,name,email,parking_no,vehicle_no,reason,entry_time) VALUES(?,?,?,?,?,?,?)";
		connection.query(q, [visitor_id,name,email,parking_slot,vehicle_no,reason,entrytime], function (err, result1) {
			if (err){
				res.end(err);
			} 
			else {
				var text= 'hello '+name+',\n'+'Your visiting id  :'+visitor_id+'\n'+'Your parking no  :'+parking_slot;
				
				let mailOptions = {
	        		from: 'rathore.rs.sameer@gmail.com',
			        to: email ,
			        subject: 'Your visiting entry details',
			        text: text
				};
				sendmail(mailOptions);
				logstore('/visitorentry','POST', visitor_id+' is Enter');
				console.log("visitor successfully enter");
				res.send("done");
			}
		});	
	});                    
	
});

//visitor exit function
app.post('/visitorexit', function (req, res) {
	var visitor=req.body.visitor;
	var date= new Date();
	var exittime=date.toISOString().split('T')[0] + ' '  
                        + date.toTimeString().split(' ')[0]; 
    var q="select parking_no from Visitor where visitor_id = ?";
    connection.query(q,[visitor], function (err, result){
    	if(result.length){
    		parking_array[result[0]['parking_no']]=0;
    		var q = "UPDATE Visitor SET exit_time = ? where visitor_id = ?";
    		connection.query(q,[exittime,visitor], function (err, result1){
    			console.log("visitor successfully exit");
    			logstore('/visitorexit','POST', visitor+' is Exit');
    			res.send("done");
    		});
    	}
    	else{
    		res.sendStatus(404);
    	}  
	});                    	
});
//const Nexmo = require('nexmo');
// function sendsms(text,number){
// 	const nexmo = new Nexmo({
// 	  apiKey: 'd2493ae3',
// 	  apiSecret: 'J69JI8g9FBgO3z6k',
// 	});
// 	console.log(text);
// 	console.log(number);
// 	// nexmo.message.sendSms("Nexmo","917060747896", text, {
// 	//    		type: "unicode"
//  //        }, (err, responseData) => {
// 	//     if (err) {
// 	//     	console.log(err);
// 	//     } 
// 	//     else {
// 	// 	    if (responseData.messages[0]['status'] === "0") {
// 	// 	    	console.log("Message sent successfully.");
// 	// 	    } 
// 	// 	    else {
// 	// 	    	console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
// 	// 	    }
// 	// 	  }
// 	// });
	
// 	 nexmo.message.sendSms(
//     '917060747896', number, text, {type: 'unicode'},
//     (err, responseData) => {
//       if (err) {
//         console.log(err);
//       } else {
//         console.dir(responseData);
//         // Optional: add socket.io -- will explain later
//       }
//     }
//   );
// }

var server = app.listen(5555, function () {
    console.log('Node server is running..');
    console.log('Browser to http://127.0.0.1: 5555');
});

const winston = require('winston');
const Elasticsearch = require('winston-elasticsearch');
var esTransportOpts = {
  level: 'info'
};
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    		winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
          	winston.format.json()
	),
  
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    new winston.transports.File({ filename: 'combined.log' }),
    //new Elasticsearch(esTransportOpts)
  ]
});

function logstore(caller,method,text){
	id = id +1;
	logger.info({"index":{"index":"Outgoing", "_id":id}, "level":'info', 'message':""});
	logger.info({"type":'api-call', "call_name":caller, "method":method, "text_entry":text});

}
module.exports = app; // for testing
