function hideall(){
  homepage.style.display="none";
  inout.style.display="none";
  leave_outpass.style.display="none";
  stud_details.style.display="none";
  leave_outpass.style.display="none";
  leave_details.style.display="none";
  visitor_search.style.display="none";
  dvVehicle.style.display="none";
  contact.reset();
  $('#entry').val('');
}

function showup(id) {
  var x=document.getElementById(id);
  hideall();
  x.style.display="block";
}

var roll_no="";

$("#menu-toggle").click(function(e) {
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
});

function my_signout() {
  window.location.href='/login';
}


function disable_back(){
  console.log($("#enter_roll").val());
  var roll = $("#enter_roll").val();
  var name="",room="",hostel="";
  $.ajax({
    method: "POST",
    url: "/userdetails",
    data: {roll: roll},
    success:function( result ) {
      $.ajax({
        method: "POST",
        url: "/Guard_fetch_leave",
        data: {
          rollno: result[0]['roll_no'],
          depdate: (new Date().toISOString().split('T')[0]).slice(0,10)
          },
        success:function( data ) {
          var date=new Date(data[0]['departure']);
          date= date.toISOString().split('T')[0] + ' '  
                      + date.toTimeString().split(' ')[0];
          date=date.slice(0,10);          
          name=result[0]['name'];
          room=result[0]['room_no'];
          hostel=result[0]['hostel_name'];
          document.getElementById('roll').value=data[0]['roll_no'];
          document.getElementById('name').value=name;
          document.getElementById('Hostel').value=hostel;
          document.getElementById('Room').value=room;
          document.getElementById('ticket').value=data[0]['ticket_no'];
          document.getElementById('mode').value=data[0]['mode_travel'];
          document.getElementById('destination').value=data[0]['destination'];
          document.getElementById('date').value=date;
          if(data[0]['status']==1)
            document.getElementById('warden_status').value="Approved By Warden";
          else if(data[0]['status']==-1)
            document.getElementById('warden_status').value="Rejected By Warden";
          else
              document.getElementById('warden_status').value="Pending to Warden";
          if(data[0]['status']=='0'||data[0]['status']=='-1'){
            document.getElementById("dep_button").disabled = true;
            document.getElementById("ret_button").disabled = true;
          }
          else if(data[0]['exit_time']==null){
            document.getElementById("ret_button").disabled = true;
            document.getElementById("dep_button").disabled = false;
          }
          else if(data[0]['entry_time']==null){
            document.getElementById("dep_button").disabled = true;
            document.getElementById("ret_button").disabled = false;
          }
          document.getElementById("dep_button").onclick=function(){home_out(data[0]['id'])};
          document.getElementById("ret_button").onclick=function(){home_in(data[0]['id'])};
          $("#enter_roll").val("");
          $("#leave_details").show();
          $("#leave_details").modal({backdrop: 'static', keyboard: false}) ;  
        },
        error: function (request, status) {
          alert("Request Leave not found");
          $("#enter_roll").val("");
        }   
      });     
    },
    error: function (request, status) {
      alert("Roll Number not found");
      $("#enter_roll").val("");   
    }
  });
}

function home_out(id){
  $.ajax({
    method: "POST",
    url: "/home_checkout",
    data: {id:id},
    success:function( result ) {
      $("#leave_details").fadeOut();
    }
  });
}

function home_in(id){
  $.ajax({
    method: "POST",
    url: "/home_checkin",
    data: {id:id},
    success:function( result ) {
      $("#leave_details").fadeOut();
    }
  });
}

function showdetails(){
  var val=$("#entry").val();
  console.log(val);
  $.ajax({
    method: "POST",
    url: "/userdetails",
    data: {roll:val},
    success:function( result ) {
      $.ajax({
        method: "POST",
       url: "/checkinout",
       data: {roll:val},
        success:function( data ){
          console.log(typeof(data));
          roll_no=result[0]['roll_no'];
          var str="";
          if(data=="OUT"){
            str='<div class="card card-body"><p>Roll : '+result[0]['roll_no']+ '</p><p>Name : '+ result[0]['name']+'</p><p>Hostel : '+result[0]['hostel_name']+'</p><p>Room No : '+result[0]['room_no']+'</p><button id="incoming" class="btn btn-primary" type="submit"  disabled>In</button><button id="outgoing" class="btn btn-warning" type="submit"  onclick="OUT()" >Out</button></div>';
          }
          else{
            str='<div class="card card-body"><p>Roll : '+result[0]['roll_no']+ '</p><p>Name : '+ result[0]['name']+'</p><p>Hostel : '+result[0]['hostel_name']+'</p><p>Room No : '+result[0]['room_no']+'</p><button id="incoming" class="btn btn-primary" type="submit"  onclick="IN('+data[0]['id']+')" >In</button><button id="outgoing" class="btn btn-warning" type="submit" disabled>Out</button></div>';
          }
          $("#stud_details").fadeIn();
          $("#stud_details").html(str);
        }
      });
    },
    error: function (request, status) {
      alert("Roll Number not found");
      $('#entry').val('');
    }
  }); 
}

function IN(id){
  $.ajax({
   method: "POST",
   url: "/localcheckin",
   data: {id:id},
    success:function( result ) {
      $('#entry').val('');
      $("#stud_details").fadeOut();
    }
  });
}

function OUT(){
  $.ajax({
   method: "POST",
   url: "/localcheckout",
   data: {roll:roll_no},
    success:function( result ) {
       $('#entry').val('');
      $("#stud_details").fadeOut();
    }
  });  
}

function vistior_park(id){
  var x=document.getElementById(id);
  hideall();
  x.style.display="block";
  $.ajax({
    method: "GET",
    url: "/fetchparking_no",
    success:function( result ) {
      $('#txtParkSlot').val(result);
    }
  });
}
// function to show visitor form
function visitor_exit(){
  var visitor_id=$('#visitorid').val();
  console.log(visitor_id);
  $.ajax({
    method:"POST",
    url: "/visitorexit",
    data: {visitor:visitor_id},
    success: function(data){
      $('#visitorid').val('');
   hideall();
        homepage.style.display="block";
      alert("Visitor exit successfully");
    },
    error: function (request, status) {
      $('#visitorid').val('');
      alert("visitor id not found");
    } 
  });
}

function visitor_entry(){
  var name,email,reason,parking_no="0",vehicle_no="0";
  if(chkVehicle.checked && ($('#txtVehicleNumber').val())=="0"){
    alert("no parking available");
   }
  else{
    if(chkVehicle.checked){
      parking_no= $('#txtParkSlot').val();
      vehicle_no=$('#txtVehicleNumber').val();
    }
    name=$('#visitorname').val();
    email=$('#visitoremail').val();
    reason=$('#rsn').val();
    var data={name:name,email:email,reason:reason,parking:parking_no,vehicle:vehicle_no};
    $.ajax({
      method: "POST",
      url: "/visitorentry",
      data: data,
      success:function( result ) {
        hideall();
        homepage.style.display="block";
        alert("Visitor recorded successfully");
      }
    });
  }  
}
