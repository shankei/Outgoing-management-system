$("#menu-toggle").click(function(e) {
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
});

  function hideall(){
      homepage.style.display="none";
      requestbox.style.display="none";
    }
    function showup(id) {
      var x=document.getElementById(id);
      hideall();
      x.style.display="block";
    }

var name="",room="",hostel="";
$.ajax({
   method: "GET",
   url: "/getLeaves",

    success:function( data ) {

     for(let i=0;i<data.length;i++){
        $.ajax({
           method: "POST",
           url: "/userdetails",
           data: {roll: data[i]['roll_no']},
            success:function( result ) {
             var date=new Date(data[i]['departure']);
             date= date.toISOString().split('T')[0] + ' '  
                        + date.toTimeString().split(' ')[0];
              date=date.slice(0,10);          
             console.log(date);
             name=result[0]['name'];
             room=result[0]['room_no'];
             hostel=result[0]['hostel_name'];
             var str='<li class="col-md-12 no-bullets"><div class="card" id="'+data[i]['id']+'" name="'+data[i]['id']+'"><h3 style="text-align: center;">'+name+'</h3><div class="form-row"><div class="lg-6 col"><fieldset>';
                str+='<label for="roll">Roll Number : </label><input type="text"  tabindex="1" value="'+data[i]['roll_no']+'" disabled></fieldset></div>';
                str+='<div class="lg-6 col"><fieldset><label for="hostel">Hostel : </label><input type="text" tabindex="2" value="'+hostel+'" disabled></fieldset></div></div>';
                str+='<div class="form-row"><div class="lg-6 col"><fieldset><label for="room">Room Number : </label><input type="number"  tabindex="3" value="'+room+'" disabled></fieldset></div>';
                str+='<div class="lg-6 col"><fieldset><label for="room">Ticket Number : </label><input type="text"  tabindex="4" value="'+data[i]['ticket_no']+'" disabled></fieldset></div></div>';
                str+='<div class="form-row"><div class="lg-6 col"><fieldset><label for="room">Mode of Travel : </label><input type="text"  tabindex="5" value="'+data[i]['mode_travel']+'" disabled></fieldset></div>';
                str+='<div class="lg-6 col"><fieldset><label for="room">Destination : </label><input type="text"  tabindex="6" value="'+data[i]['destination']+'" disabled></fieldset></div></div>';
                str+='<fieldset><label for="room">Guardian conatct : </label><input type="number"  tabindex="7" value="'+data[i]['parents_contact']+'" disabled></fieldset>';
                str+='<fieldset><label for="date">Departure Date : </label><input type="date"  tabindex="8" value="'+date+'" disabled></fieldset>';
                str+='<fieldset><label for="reason">Reason for Leave : </label><textarea  tabindex="9"  disabled>'+data[i]['reason']+'</textarea></fieldset>';
                str+='<a id="yesbtn" class="vanish1 btn btn-info waves-effect waves-light" onclick="allow('+data[i]['id']+')">Allow</a><a id="nobtn" class="vanish2 btn btn-outline-info waves-effect" onclick="reject('+data[i]['id']+')">Reject</a></div></li>';
           $('#showRequest').append(str);

           }
           
        });
         
   }
 }
});

function allow(id){
  $.ajax({
   method: "POST",
   url: "/allow_leave",
   data: {request_no: id},
    success:function( result ) {
      console.log('allowed');
      $('#'+id).hide(1000,'swing', function(){ $('id').remove(); 
      }); 
    }
  });

}
function reject(id){
$.ajax({
   method: "POST",
   url: "/reject_leave",
   data: {request_no: id},
    success:function( result ) {
     $('#'+id).hide(1000,'swing', function(){ $('id').remove(); 
      }); 
    }
  });
}
function my_signout() {

  window.location.href='/login';
}