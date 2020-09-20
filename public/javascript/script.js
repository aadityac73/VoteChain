(function() {
	'use strict';
	window.addEventListener(
		'load',
		function() {
			// Fetch all the forms we want to apply custom Bootstrap validation styles to
			var forms = document.getElementsByClassName(
				'needs-validation'
			);
			// Loop over them and prevent submission
			var validation = Array.prototype.filter.call(
				forms,
				function(form) {
					form.addEventListener(
						'submit',
						function(event) {
							if (form.checkValidity() === false) {
								event.preventDefault();
								event.stopPropagation();
							}
							form.classList.add('was-validated');
						},
						false
					);
				}
			);
		},
		false
	);
})();

var loc = window.location.pathname;
if (loc === '/vote') {
	document.title = 'Vote';
	$('#vote').toggleClass('active');
} else if (loc === '/results') {
	document.title = 'Results';
	$('#results').toggleClass('active');
} else if (
	loc === '/login/admin' ||
	loc === '/voters' ||
	loc === '/candidates' ||
	loc === '/candidates/add'
) {
	document.title = 'Admin';
	$('#admin').toggleClass('active');
} else if (loc === '/login') {
	document.title = 'Login';
	$('#login').toggleClass('active');
} else if (loc === '/register') {
	document.title = 'Register';
	$('#register').toggleClass('active');
}
