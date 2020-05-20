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
var d=new Date();
console.log(d);

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
			var list="These students are late for today after 10pm ";
			for(i=0;i<result.length;i++){
				var q = "Select * FROM Student where roll_no = ?";
				connection.query(q, [result[i]['roll_no']], function(err,result1){
					if(err){

					}
					else{
						var list1 = result1[0]['roll_no']+'  '+result1[0]['name']+' ';
						let mailOptions = {
    						 from: 'rathore.rs.sameer@gmail.com',
	     				 	 to: result1[0]['email'] ,
	      					 subject: 'Hostel Reminder',
	      					 text: 'Dear '+ result1[0]['name']+',\n you are late, kindly reach hostel ASAP.'
						};
						sendmail(mailOptions);
						list.concat(list1);
					}
				});
				
			}
			console.log('Sending email to warden');
			let mailOptions = {
        						 from: 'rathore.rs.sameer@gmail.com',
		     				 	 to: 'mohit.bansal@iiitb.org' ,
		      					 subject: 'Hostel Reminder',
		      					 text: list
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
				res.set('Content-Type', 'text/html')
   				res.sendFile(__dirname + '/public/student_dashboard.html');
   				}
   			else if(result[0].role=='warden'){
   				console.log('warden has logged in');
				res.set('Content-Type', 'text/html')
   				res.sendFile(__dirname + '/public/warden_dashboard.html');
   			}
   			else if(result[0].role=='guard'){
   				console.log('warden has logged in');
				res.set('Content-Type', 'text/html')
   				res.sendFile(__dirname + '/public/guard_dashboard.html');
   				}
			}
			else
				{
					console.log('user not found');
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
				console.log("i am he");
				res.sendStatus(404);
			}
		}	
	});
});	

// Apply leave for this student
app.post('/request_leave', function (req, res) {
	console.log('Inside request leave');
	var roll_number=req.body.roll;
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
			res.send("done");
		}
	});
});


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
			res.send("done");
		}
	});
});

app.post('/Guard_fetch_leave', function (req, res) {
	console.log('guard fetch the leave request of student');
	var q = "SELECT roll_no,MAX(id) as id from Apply_Leave where roll_no= ? GROUP BY roll_no";
	connection.query(q, [req.body.rollno], function (err, result) {
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
					res.end();
				}
			});
			res.send("done");
		}
	});
});

var server = app.listen(5555, function () {
    console.log('Node server is running..');
    console.log('Browser to http://127.0.0.1: 5555');
});

module.exports = app; // for testing