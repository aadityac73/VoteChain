var loc = window.location.href;
if(/results/.test(loc))
    $('#results').addClass('clicked');

else if(/admin/.test(loc))
    $('#admin').addClass('clicked');

else if(/login/.test(loc))
    $('#login').addClass('clicked');

else if(/register/.test(loc))
    $('#register').addClass('clicked');

else if(/vote/.test(loc))
    $('#vote').addClass('clicked');

else
    $('.navbar-brand').addClass('clicked');


