
// Client facing scripts here
$(document).ready(function() {

//---------------- HIDE USERNAME AND PASSWORD ON EDIT PAGE -----------------------------
// $('.hide-user').hide();
$('.hide-password').hide();
$('.hide-form').hide();
$('.edit-submit').hide();
})

// SHOW USER NAME AND PASSWORD ON EDIT PAGE ---------------------------------------------
 $(".show-user").on("click", function(event){
  $('.hide-user').show();
  $(".hide-form").show();
  $(".show-user").hide();
  $('.edit-submit').show();
});

$(".show-password").on("click", function(event){
  $('.hide-password').show();
  $(".hide-form").show();
  $(".show-password").hide();
  $('.edit-submit').show();
});
// ----------------------------------------------------------------------------------------
