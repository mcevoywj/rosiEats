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
rh.ROSEFIRE_REGISTRY_TOKEN = "c648eb43-6c3c-432f-8e8d-76daaf8f0c3a";

rh.COLLECTION_USERS = "Users";
rh.KEY_NAME = "name";
rh.KEY_MEALS = 0;
rh.KEY_DB = 0;
rh.KEY_USERNAME = "username";
rh.KEY_GROUP = "group";



rh.fbOrderManager = null;
rh.fbUserManager = null;
rh.fbItemManager = null;
rh.fbAuthManager = null;

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

rh.FbAuthManager = class {
	constructor() {
		this._user = null;
	}
	get uid() {
		if (this._user) {
			return this._user.uid;
		}
		console.log("There is no user!");
		return "";
	}

	get isSignIn() {
		return !!this._user;
	}

	get group() {
		if(this._user){
			return this._user.group;
		}
		console.log("This user has no group!");
		return "";
	}

	beginListening(changeListener) {
		console.log("Listen for auth state changes");
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
		});
	}

	signIn() {
		return new Promise((resolve, reject) => {
			console.log("Rosefire Sign in");
			Rosefire.signIn(rh.ROSEFIRE_REGISTRY_TOKEN, (err, rfUser) => {
				if (err) {
					console.log("Rosefire error.", err);
					reject();
					return;
				}
				console.log("Rosefire login worked!", rfUser);
				this.rfUser = rfUser;
				// Option #1 (won't be implementing): Use rfUser NOW and set a document in Firebase!
				firebase.auth().signInWithCustomToken(rfUser.token).then((authData) => {
					// User logged in successfully 
					console.log("Firebase auth worked too!");
					// resolve();
					rh.fbUserManager.setUser(rfUser).then(() => {
						console.log("student");
						console.log(this.rfUser.group);
						rh.KEY_GROUP = this.rfUser.group;
						rh.KEY_NAME = this.rfUser.name;
						rh.KEY_USERNAME = this.rfUser.username;
						// console.log(rh.KEY_GROUP);
						resolve();
					})

				}, function (error) {
					// User not logged in!
					console.log("Firebase auth failed.  Dr. Fisher has never seen this happen.");
					reject();
				});
			});
		});
	}

	signOut() {
		firebase.auth().signOut();
	}
}

rh.FbUserManager = class {
	constructor() {
		this._collectionRef = firebase.firestore().collection(rh.COLLECTION_USERS);
		this._document = {};
		this._unsubscribe = null;
		this.rfUser = null;
	}

	beginListening(uid, changeListener) {
		//TODO : Test this function
		console.log("Listening for user", uid);
		this._unsubscribe = this._collectionRef.doc(uid).onSnapshot((doc) => {
			if (doc.exists) {
				this._document = doc;
				console.log('doc.data() :', doc.data());
				if (changeListener) {
					changeListener();
				}
			} else {
				console.log("This user does not exist");
			}
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	setUser(rfUser) {
		// TODO : Set the User then return a promise, so that the Promise chain can continue
		console.log("Set the user for ", rfUser.username);
		this.rfUser = rfUser;
		console.log(rfUser.group);
		// Check to see if User already exists
		const userRef = this._collectionRef.doc(rfUser.username);
		return userRef.get().then((document) => {
			if(document.exist) {
				// This user already exists. This is a second login. Do nothing.
				return;
			} else {
				//Create this User and set the values in the Firestore
				return userRef.set({
					[rh.KEY_NAME]: rfUser.name,
					[rh.KEY_USERNAME]: rfUser.username,
					[rh.KEY_GROUP]: rfUser.group,
				});
			}
		})

	}

	updateName(name) {
		const userRef = this._collectionRef.doc(rh.fbAuthManager.uid);
		userRef.update ({
			[rh.KEY_NAME] : name
		});
	}

	updatePhotoUrl(photoUrl) {
		const userRef = this._collectionRef.doc(rh.fbAuthManager.uid);
		userRef.update ({
			[rh.KEY_PHOTO_URL] : photoUrl
		});

	}

	get name() {
		return this._document.get(rh.KEY_NAME);
	}

	get photoUrl() {
		return this._document.get(rh.KEY_PHOTO_URL);
	}

	get group() {
		return this.rfUser.group;
	}

	get isListening() {
		return !!this._unsubscribe;
	}

}

rh.LogInPageController = class {
	/** constructor */
	constructor() {
		// $("#rosefire-button").click((event) => {
		// 	console.log("You have clicked Log In");
		// 	window.location.href = `/main.html`;
		// });
		$("#rosefire-button").click((event) => {
			rh.fbAuthManager.signIn().then(() => {
				console.log("Move to next page because of promise");
				window.location.href = "/main.html";
			});
		});
	}


}

rh.MainPageController = class {
	/** constructor */
	constructor(userId) {
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
		//Dropdown Menu Actions
		$("#menuSignOut").click((event) => {
			console.log("Sign out.");
			rh.fbAuthManager.signOut();
		});
		// this.isStudent(rh.fbUserManager.group);
		// this.isStudent(rh.fbUserManager.rfUser.group);
		// console.log(rh.fbUserManager.group);
		this.isStudent(rh.KEY_GROUP);
		console.log("meals: ", rh.KEY_MEALS);

	}
	isStudent(userGroup) {
		console.log(userGroup);
		if(userGroup == "STUDENT"){
			[rh.KEY_MEALS] = 120;
			rh.KEY_DB = 60;
			return;
		} 
		rh.KEY_MEALS = 90;
		rh.KEY_DB = 45;
		return;
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

rh.checkForRedirects = function () {
	// Redirects
	if ($("#login-page").length && rh.fbAuthManager.isSignIn && !rh.fbAuthManager.rfUser) {
		window.location.href = "/main.html";
	}
	if (!$("#login-page").length && !rh.fbAuthManager.isSignIn) {
		window.location.href = "/";
	}
}

rh.initializePage = function () {
	var urlParams = new URLSearchParams(window.location.search);
	if($("#login-page").length){
		console.log("On the login page.");
		new rh.LogInPageController();
	} else if($("#main-page").length){
		console.log("On the main menu page.");
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

}



/* Main */
$(document).ready(() => {
	console.log("Ready Now");
	rh.fbAuthManager = new rh.FbAuthManager();
	rh.fbUserManager = new rh.FbUserManager();
	rh.fbAuthManager.beginListening(() => {
		console.log("Auth state changed. isSignedIn = ", rh.fbAuthManager.isSignIn);
		rh.checkForRedirects();
		rh.initializePage();
	});	
});
