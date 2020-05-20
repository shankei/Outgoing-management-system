let chai = require('chai');
let chaiHttp = require('chai-http');
let expect=chai.expect;
let server = require('../server');
let assert=require('chai').assert;
chai.use(chaiHttp);
 // afterAll(done => {
 //    server.close(done);
 //  });

describe('/Get student details', function() {
	it('Main page content',  function(done){
	    chai.request(server)
	    .post('/userdetails')
	    .send({roll:'MT2019048'})
	    .end(function(err,res){
	        expect(res).to.have.status(200);
	        expect(res.body[0].name).to.equal('mohit bansal');
	        done();
	    });
	});
});

describe('successful checkout', function() {
	it('Main page content',  function(done){
	    chai.request(server)
	    .post('/localcheckout')
	    .send({roll:'MT2019048'})
	    .end(function(err,res){
	        expect(res).to.have.status(200);
	     
	        expect(res.text).to.equal('done');
	        done();
	    });
	});
});
describe('successful checkin', function() {
	it('Main page content',  function(done){
		chai.request(server)
	    .post('/checkinout')
	    .send({roll:'MT2019048'})
	    .end(function(err,res){
	    	console.log(res.body[0].id);
	       chai.request(server)
	    	.post('/localcheckin')
	    	.send({id:res.body[0].id})
	    	.end(function(err,res1){
	        expect(res1).to.have.status(200);
	     
	        expect(res1.text).to.equal('done');
	        done();
	    });
	       
	    });
	    
	});
});
