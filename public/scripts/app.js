
// Client facing scripts here
$(document).ready(function() {

//---------------- HIDE USERNAME AND PASSWORD ON EDIT PAGE -----------------------------
  $('.hide-form').hide();
  $('.edit-submit').hide();
})

// SHOW USER NAME AND PASSWORD ON EDIT PAGE ---------------------------------------------
 $(".show").on("click", function(event){
  $(".hide-form").show();
  $(".show").hide();
  $('.edit-submit').show();
});
