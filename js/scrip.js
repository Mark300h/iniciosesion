/*
 - Expresiones regulares: las funciones validateEmail, validateMobile y validatePassword usan regex
   para comprobar formatos. validatePassword ahora exige mínimo 8 caracteres, al menos una mayúscula,
   una minúscula, un dígito y un símbolo (carácter no alfanumérico) para aumentar la seguridad.

 - Manejo de bloqueo: la variable `attempts` cuenta intentos fallidos de contraseña. Tras 3
   intentos (`attempts >= 3`) se marca `locked = true` y se impide el login hasta que se recupere
   y actualice la contraseña. No se usan objetos ni almacenamiento persistente.

 - Actualizar contraseña: en `recoverPassword` se valida la nueva contraseña con la misma
   regla que durante el registro. Al actualizarla, `locked` se pone a `false` y `attempts` a 0,
   lo que desbloquea la cuenta y permite iniciar sesión con la nueva contraseña.
*/
// Variables que guardan el estado de la cuenta
var registeredEmail = '';
var registeredPassword = '';
var registeredName = '';
var registeredMobile = '';
var accountCreated = false;
var attempts = 0; // intentos fallidos
var locked = false; // cuenta bloqueada tras 3 intentos

// Helper: mostrar mensajes al usuario 
function showMessage(text, type) {
	var el = document.getElementById('message');
	el.textContent = text;

	// Si el mensaje es el de bienvenida, usar fondo azul y texto naranja
	if (typeof text === 'string' && text.indexOf('Bienvenido al sistema') === 0) {
		el.style.background = '#0b3d91'; // azul oscuro
		el.style.color = '#ff8a00'; // naranja brillante
		el.style.border = '1px solid rgba(255,138,0,0.25)';
	} else if (type === 'error') {
		// Mensaje de error: fondo claro rojizo y texto oscuro para contraste sobre el fondo azul
		el.style.background = '#ffe5e5';
		el.style.color = '#6b0000';
		el.style.border = '1px solid #f5c2c2';
	} else if (type === 'success') {
		// Mensaje general de éxito: fondo verde claro y texto oscuro
		el.style.background = '#e8ffe8';
		el.style.color = '#0b3d91';
		el.style.border = '1px solid #b7eeb7';
	} else {
		// Valor por defecto (neutral)
		el.style.background = '';
		el.style.color = '';
		el.style.border = '';
	}
}

// Mostrar u ocultar formularios
function hideAllForms(){
	document.getElementById('registerForm').classList.add('hidden');
	document.getElementById('loginForm').classList.add('hidden');
	document.getElementById('recoverForm').classList.add('hidden');
}

function showRegister(){ hideAllForms(); document.getElementById('registerForm').classList.remove('hidden'); }
function showLogin(){ hideAllForms(); document.getElementById('loginForm').classList.remove('hidden'); }
function showRecover(){ hideAllForms(); document.getElementById('recoverForm').classList.remove('hidden'); }

//*********  Función para alternar visibilidad de contraseña en inputs
function toggleShowPassword(checkboxId, inputId){
	var cb = document.getElementById(checkboxId);
	var inp = document.getElementById(inputId);
	cb.addEventListener('change', function(){
		inp.type = cb.checked ? 'text' : 'password';
	});
}

// --- Validaciones con expresiones regulares ---
// validateEmail: valida formato básico de correo usando regex.
// RegEx: cualquier cadena sin espacios antes/depues de '@', contiene un punto en el dominio.
function validateEmail(email){
	var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email);
}

function validateMobile(mobile){
	var re = /^\+?\d{7,15}$/;
	return re.test(mobile);
}

// validatePassword: requiere al menos 8 caracteres, al menos una letra y un dígito.
// validatePassword: requiere al menos 8 caracteres, y al menos una minúscula, una mayúscula,
// un dígito y un símbolo (carácter no alfanumérico). Se usan lookahead en la expresión regular:
//  - (?=.*[a-z])  -> al menos una letra minúscula
//  - (?=.*[A-Z])  -> al menos una letra mayúscula
//  - (?=.*\d)    -> al menos un dígito
//  - (?=.*[^A-Za-z0-9]) -> al menos un símbolo (no alfanumérico)
//  - .{8,}        -> longitud mínima 8 (cualquier carácter)
function validatePassword(pw){
  var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return re.test(pw);
}

// --- Registro ---
function registerUser(e){
	e.preventDefault();
	var name = document.getElementById('regName').value.trim();
	var email = document.getElementById('regEmail').value.trim();
	var mobile = document.getElementById('regMobile').value.trim();
	var pw = document.getElementById('regPassword').value;

	if(!name || !email || !mobile || !pw){ showMessage('Todos los campos son requeridos.', 'error'); return; }
	if(!validateEmail(email)){ showMessage('Email no válido.', 'error'); return; }
	if(!validateMobile(mobile)){ showMessage('Número móvil no válido.', 'error'); return; }
	if(!validatePassword(pw)){ showMessage('La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y símbolo.', 'error'); return; }

	// Guardamos en variables
	registeredName = name;
	registeredEmail = email;
	registeredMobile = mobile;
	registeredPassword = pw;
	accountCreated = true;
	attempts = 0;
	locked = false;

	hideAllForms();
	showMessage('Cuenta creada correctamente. Ahora puede iniciar sesión.', 'success');
}

// --- Inicio de sesión ---
function loginUser(e){
	e.preventDefault();
	var email = document.getElementById('loginEmail').value.trim();
	var pw = document.getElementById('loginPassword').value;

	if(!accountCreated){ showMessage('Primero crear cuenta.', 'error'); return; }
	if(locked){
		showMessage('Cuenta bloqueada por intentos fallidos. Puede recuperar contraseña.', 'error');
		showRecover();
		return;
	}

	if(email !== registeredEmail){
		// El usuario no está registrado
		showMessage('Cuenta no registrada.', 'error');
		return;
	}

	if(pw === registeredPassword){
		// Inicio correcto: se muestra el nombre completo
		attempts = 0;
		showMessage('Bienvenido al sistema ' + registeredName, 'success');
		hideAllForms();
	} else {
		// Contraseña incorrecta: manejo de intentos
		attempts = attempts + 1;
		if(attempts >= 3){
			locked = true;
			showMessage('Cuenta bloqueada por intentos fallidos. Recuperar contraseña.', 'error');
			showRecover();
		} else {
			showMessage('Usuario y contraseña incorrectos. Intentos: ' + attempts, 'error');
		}
	}
}

// --- Recuperar / actualizar contraseña ---
function recoverPassword(e){
	e.preventDefault();
	if(!accountCreated){ showMessage('Primero crear cuenta.', 'error'); return; }

	var newPw = document.getElementById('newPassword').value;
	var confirm = document.getElementById('confirmPassword').value;
	if(newPw !== confirm){ showMessage('Las contraseñas no coinciden.', 'error'); return; }
	if(!validatePassword(newPw)){ showMessage('La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y símbolo.', 'error'); return; }

	// Actualizamos la contraseña, se desbloquea y se reinician intentos
	registeredPassword = newPw;
	locked = false;
	attempts = 0;
	hideAllForms();
	showMessage('Contraseña actualizada. Ahora puede iniciar sesion .', 'success');
}

// Inicialización de eventos al cargar la página
document.addEventListener('DOMContentLoaded', function(){
	document.getElementById('btnRegister').addEventListener('click', showRegister);
	document.getElementById('btnLogin').addEventListener('click', showLogin);

	document.getElementById('registerForm').addEventListener('submit', registerUser);
	document.getElementById('loginForm').addEventListener('submit', loginUser);
	document.getElementById('recoverForm').addEventListener('submit', recoverPassword);

	// show/hide password toggles: usa la misma función genérica
	toggleShowPassword('regShow','regPassword');
	toggleShowPassword('loginShow','loginPassword');
	toggleShowPassword('recoverShow','newPassword');
	toggleShowPassword('recoverShow','confirmPassword');
});


