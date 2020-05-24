
CREATE TABLE IF NOT EXISTS Login(
id int(200) NOT NULL AUTO_INCREMENT,
email varchar(255) NOT NULL,
password varchar(255) NOT NULL,
role varchar(255) NOT NULL,
PRIMARY KEY (id)
)ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1;

insert into Login values(1,'guard@gmail.com','guard','guard');
insert into Login values(2,'warden@gmail.com','warden','warden');
insert into Login values(3,'shashank.agarwal@iiitb.org','shashank','student');
insert into Login values(4,'mohit.bansal@iiitb.org','mohit','student');
insert into Login values(5,'archit.semwal@iiitb.org','archit','student');

CREATE TABLE IF NOT EXISTS Student(
roll_no varchar(255) NOT NULL,
name varchar(255) NOT NULL,
email varchar(255) NOT NULL,
contact bigint NOT NULL,
hostel_name varchar(255) NOT NULL,
room_no int(100) NOT NULL,
parents_email varchar(255) NOT NULL,
PRIMARY KEY (roll_no),
CONSTRAINT fk_email FOREIGN KEY (email) REFERENCES Login(email)
ON DELETE CASCADE
)ENGINE=MyISAM  DEFAULT CHARSET=latin1;

insert into Student values('MT2019026','archit semwal','archit.semwal@iiitb.org',3232323232,'Bhaskara',470,'archit.semwal@iiitb.org');
insert into Student values('MT2019100','shashank agarwal','shashank.agarwal@iiitb.org',9149266884,'Bhaskara',747,'shashank.agarwal@iiitb.org');
insert into Student values('MT2019048','mohit bansal','mohit.bansal@iiitb.org',8585858585,'Bhaskara',628,'mohit.bansal@iiitb.org');



CREATE TABLE IF NOT EXISTS Apply_Leave(
id int(255) NOT NULL AUTO_INCREMENT,
roll_no varchar(255) NOT NULL,
destination varchar(255) NOT NULL,
mode_travel varchar(255) NOT NULL,
ticket_no varchar(255) NOT NULL,
reason varchar(3000) NOT NULL,
parents_contact bigint NOT NULL,
departure DATETIME NOT NULL,
entry_time DATETIME,
exit_time DATETIME,
status varchar(200) NOT NULL,
PRIMARY KEY (id),
CONSTRAINT fk_roll FOREIGN KEY (roll_no) REFERENCES Student(roll_no)
ON DELETE CASCADE
)ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS Record_InOut(
id int(255) NOT NULL AUTO_INCREMENT,
roll_no varchar(255) NOT NULL,
entry_time DATETIME,
exit_time DATETIME,
PRIMARY KEY (id),
CONSTRAINT fk_roll1 FOREIGN KEY (roll_no) REFERENCES Student(roll_no)
ON DELETE CASCADE
)ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1;


CREATE TABLE IF NOT EXISTS Visitor(
id int(200) NOT NULL AUTO_INCREMENT,
visitor_id varchar(255) NOT NULL,
name varchar(255) NOT NULL,
email varchar(255),
parking_no int(255) ,
vehicle_no varchar(200),
reason varchar(3000),
entry_time DATETIME,
exit_time DATETIME,
PRIMARY KEY (id)
)ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1;