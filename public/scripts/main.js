/**
 * @fileoverview
 * Provides interactions for all pages in the UI.
 *
 * @author 
 */

/** namespace. */
var rh = rh || {};

/** globals */
//Collections for Order, Item, User

rh.fbOrderManager = null;
rh.fbUserManager = null;
rh.fbItemManager = null;

rh.Order = class{
	constructor(id, item, price, quantity){
		this.id = id;
		this.item = item;
		this.price = price;
		this.quantity = quantity;
	}
}

rh.Item = class {
	constructor(id, name, image, ingredients){
		this.id = id;
		this.name = name;
		this.image = image;
		this.ingredients = ingredients;
	}
}

rh.User = class {
	constructor(id, name, email, meals, dB) {
		this.id = id;
		this.name = name;
		this.email = email;
		this.meals = meals;
		this.dB = dB;
	}
}

rh.LogInPageController = class {
	/** constructor */
	constructor() {
		$("#rosefire-button").click((event) => {
			console.log("You have clicked Log In");
			// rh.fbAuthManager.signIn();
			// this.enableEmailPassword();
			window.location.href = `/main.html`;
		});
	}
	enableEmailPassword() {
	const email = new mdc.textField.MDCTextField(document.querySelector('.email'));
	const password = new mdc.textField.MDCTextField(document.querySelector('.password'));

	// new mdc.ripple.MDCRipple(document.querySelector('#createAccount'));
	new mdc.ripple.MDCRipple(document.querySelector('#login'));

	// $("#createAccount").click((event) => {
	// 	const emailValue = $("#email-input").val();
	// 	const passwordValue = $("#password-input").val();

	// 	console.log("Create new user", emailValue, passwordValue);

	// 	firebase.auth().createUserWithEmailAndPassword(emailValue, passwordValue).catch(function (error) {
	// 		// Handle Errors here.
	// 		var errorCode = error.code;
	// 		var errorMessage = error.message;
	// 		//CONSIDER: in REAL APP tell user what is wrong
	// 		console.log(`Error ${error.code}: ${error.message}`);
	// 	});

	// });

	$("#login").click((event) => {
		const emailValue = $("#email-input").val();
		const passwordValue = $("#password-input").val();

		console.log("Log in exsisting user");

		firebase.auth().signInWithEmailAndPassword(emailValue, passwordValue).catch(function (error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			//CONSIDER: in REAL APP tell user what is wrong
			console.log(`Error ${error.code}: ${error.message}`);
		});
		console.log("Welcome back : ", emailValue);
	});

	}
}
rh.MainPageController = class {
	/** constructor */
	constructor() {
		$("#union-cafe").click(function() {
			console.log("You have clicked Union Cafe");
			window.location.href = `/union-cafe.html`;
			return false;
		});
		$("#rose-gardens").click((event) => {
			console.log("You have clicked Union Cafe");
			window.location.href = `/rose-gardens.html`;
		});
		$("#moench-cafe").click((event) => {
			console.log("You have clicked Union Cafe");
			window.location.href = `/moench-cafe.html`;
		});
		$("#chaunceys").click((event) => {
			console.log("You have clicked Union Cafe");
			window.location.href = `/chaunceys.html`;
		});
		$("#beanies").click((event) => {
			console.log("You have clicked Union Cafe");
			window.location.href = `/beanies.html`;
		});
		$("#settings").click((event) => {
			console.log("You have clicked Union Cafe");
			window.location.href = "/settings.html";
		});

	}
	methodName() {

	}
}
rh.ChaunceysPageController = class {
	/** constructor */
	constructor() {

	}
	methodName() {

	}
}
rh.UnionPageController = class {
	/** constructor */
	constructor() {
		

	}
	methodName() {

	}
}



/* Main */
$(document).ready(() => {
	console.log("Ready Now");
	if($("#login-page").length){
		console.log("On log in page");

		new rh.LogInPageController();
	} else if($("#main-page").length){
		console.log("On Main page");
		new rh.MainPageController();
	} else if($("#chaunceys-page").length){
		console.log("On Chauncey's page");
		new rh.ChaunceysPageController();
	} else if($("#union-page").length){
		console.log("On Union Cafe page");
		new rh.UnionPageController();
	} else if($("#rg-page").length){
		console.log("On Rose Gardens page");
		new rh.RGPageController();
	} else if($("#mc-page").length){
		console.log("On Moench Cafe page");
		new rh.MCPageController();
	} else if($("#beanies-page").length){
		console.log("On Beanies page");
		new rh.BeaniesPageController();
	} else if($("#settings-page").length){
		console.log("On Settings page");
		new rh.SettingsPageController();
	}
	
});
