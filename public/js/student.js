$("#menu-toggle").click(function(e) {
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
});
 var roll_number;
$.ajax({
   method: "GET",
   url: "/getdetails"
})
 .done(function( data ) {
   var course_h='<div class="row"><div class="col-6"><div class="form-group"><labelfor="name">ID:</label><input type="text" class="form-control" id="occ" placeholder='+data[0]['roll_no']+' disabled></div></div></div><div class="row"><div class="col-6"><div class="form-group"><labelfor="name">Name:</label><input type="text" class="form-control" id="name" placeholder='+data[0]['name']+' disabled></div></div></div><div class="row"><div class="col-6"><div class="form-group"><label for="gmail">Email:</label><input class="form-control" id="gmail" type="text" placeholder='+data[0]['email']+' disabled></div></div></div><div class="row"><div class="col-6"><div class="form-group"><label for="phn">Phone Number:</label><input type="text" class="form-control" id="phn" placeholder='+data[0]['contact']+' disabled></div></div></div><div class="row"><div class="col-6"><div class="form-group"><labelfor="name">Hostel:</label><input type="text" class="form-control" id="occ" placeholder='+data[0]['hostel_name']+' disabled></div></div></div><div class="row"><div class="col-6"><div class="form-group"><labelfor="name">Room number:</label><input type="text" class="form-control" id="occ" placeholder='+data[0]['room_no']+' disabled></div></div></div><div class="row"><div class="col-6"><div class="form-group"><labelfor="name">Parents Email:</label><input type="text" class="form-control" id="occ" placeholder='+data[0]['parents_email']+' disabled></div></div></div>'
   document.getElementById("existing_profile").innerHTML = course_h;
     roll_number =data[0]['roll_no'];
    console.log(roll_number);
      document.getElementById("roll").value = roll_number;
      document.getElementById("stud_name").value = data[0]['name'];
      document.getElementById("stud_hostel").value = data[0]['hostel_name'];
      document.getElementById("stud_room").value = data[0]['room_no'];
      document.getElementById("navbarDropdown").innerHTML = 'Welcome   '+data[0]['name'];
});



function hideall(){
    homepage.style.display="none";
    leaveform.style.display="none";
    shareloc.style.display="none";
    existing_profile.style.display="none";
}
function showup(id) {
  var x=document.getElementById(id);

  if(id =='leaveform'){
    $.ajax({
      method: "POST",
      url: "/checkleave",
      data:{roll:roll_number},
      success:function( result ) {
        if(result=='no'){
          hideall();
          homepage.style.display="block";
          alert("sorry you have already send a request");
        }
      }
    });
  }
    hideall();
  x.style.display="block";
}

function initMap() {
  var uluru = {lat: 28.501859, lng: 77.410320};
  var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 4,
      center: uluru
  });
  var marker = new google.maps.Marker({
      position: uluru,
      map: map
  });
}



function my_signout() {

  window.location.href='/login';
}

