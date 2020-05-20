function hideall(){
      homepage.style.display="none";
      inout.style.display="none";
      leave_outpass.style.display="none";
      stud_details.style.display="none";
      leave_outpass.style.display="none";
      leave_details.style.display="none";
      visitor_search.style.display="none";
      visitor_form.style.display="none";
      // parking.style.display="none";
       $('#entry').val('');
}
function showup(id) {
  var x=document.getElementById(id);
  hideall();
  x.style.display="block";
}

var roll_no="";
var date= new Date();
  var exittime= date.toISOString().split('T')[0] + ' '  
                        + date.toTimeString().split(' ')[0]; 
  console.log(exittime);
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
           data: {rollno: result[0]['roll_no']},
            success:function( data ) {
             var date=new Date(data[0]['departure']);
             date= date.toISOString().split('T')[0] + ' '  
                        + date.toTimeString().split(' ')[0];
              date=date.slice(0,10);          
             console.log(date);
             name=result[0]['name'];
             room=result[0]['room_no'];
             hostel=result[0]['hostel_name'];
                     console.log(data[0]);
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

              if(data[0]['exit_time']==null)
              {
                document.getElementById("ret_button").disabled = true;
                document.getElementById("dep_button").disabled = false;
              }
              else if(data[0]['entry_time']==null)
              {
                document.getElementById("dep_button").disabled = true;
                document.getElementById("ret_button").disabled = false;
              }
              else if(data[0]['status']=='0'||data[0]['status']=='-1')
              {
              document.getElementById("dep_button").disabled = true;
              document.getElementById("ret_button").disabled = true;
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
        //$("#leave_details").fadeOut();
    }
           
        });
      
 },
 error: function (request, status) {
        alert("Roll Number not found");
        $("#enter_roll").val("");
        //$("#leave_details").fadeOut();
    }
});
}



    function home_out(id)
    {
       $.ajax({
     method: "POST",
     url: "/home_checkout",
     data: {id:id},
     success:function( result ) {
      $("#leave_details").fadeOut();
    }
});
    }

 function home_in(id)
    {
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

// function to show visitor form
function showvisitorform(id)
{
var x=document.getElementById(id);
x.style.display="block";
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