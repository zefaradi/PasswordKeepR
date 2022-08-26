
// Random password on edit page
function randPassword(letters, numbers, special) {
  var chars = [
   "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", // letters
   "0123456789", // numbers
   "~!@-#$" // either
  ];

  return [letters, numbers, special].map(function(len, i) {
    return Array(len).fill(chars[i]).map(function(x) {
      return x[Math.floor(Math.random() * x.length)];
    }).join('');
  }).concat().join('').split('').sort(function(){
    return 0.5-Math.random();
  }).join('')
}

//---------------------------------------------

// Client facing scripts here
$(document).ready(function() {
console.log('button id', $(".random-button"))
$(".random-button").on("click", function(event) {
  event.preventDefault();
  const randPass = randPassword(5, 2, 1);
  $('.password-field').attr("value", randPass);
  console.log($('.password-field'))
})

//---------------- HIDE USERNAME AND PASSWORD ON EDIT PAGE -----------------------------

$('.hide-user').hide();
$('.hide-password').hide();
let hiddenStatus = true;
// $('.hide-form').hide();
// $('.edit-submit').hide();


// SHOW USER NAME AND PASSWORD ON EDIT PAGE ---------------------------------------------
 $(".edit").on("click", function(event){
  if (hiddenStatus === true) {
  $('.hide-user').show();
$('.hide-password').show();
    hiddenStatus = false;
    return
  }
  $('.hide-user').hide();
  $('.hide-password').hide();
  hiddenStatus = true;
  // // event.preventDefault();
  // $('.hide-user').show();
  // $(".hide-form").show();
  // // $(".show-user").hide();
  // $('.edit-submit').show();
});

// $('#copy').on('click', function(event) {
//   navigator.clipboard.writeText(document.getElementById('copy-text').innerText)
//   .then(function() {
//     console.log('text has been copied!')
//   })
// })

$('#copy').on('click', function(event) {
  const copyText = document.getElementById("copy-text");

  copyText.select();

  navigator.clipboard.writeText(copyText.innerText);

  alert("Copied the text: " + copyText.value);
})

});


