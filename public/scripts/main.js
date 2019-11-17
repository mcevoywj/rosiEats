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

rh.COLLECTION_CHAUNCEY_ITEMS = "Chaunceys";
rh.KEY_ITEM_NAME = "item name";
rh.KEY_ITEM_IMAGE_URL = "imageUrl";
rh.KEY_INGREDIENTS = "ingredients";
rh.KEY_CALORIES = 0;
rh.KEY_SHORT = "short";
rh.KEY_MENU_TYPE = "menuType";
rh.KEY_LAST_TOUCHED = "lastTouched";




rh.fbOrderManager = null;
rh.fbUserManager = null;
rh.fbItemManager = null;
rh.fbAuthManager = null;
rh.fbChaunceyManager = null;

rh.Order = class {
	constructor(id, item, price, quantity) {
		this.id = id;
		this.item = item;
		this.price = price;
		this.quantity = quantity;
	}
}

rh.Item = class {
	constructor(id, name, image, ingredients, calPer, calories) {
		this.id = id;
		this.name = name;
		this.image = image;
		this.ingredients = ingredients;
		this.calPer = calPer;
		this.calories = calories;
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
		if (this._user) {
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
						if(rh.KEY_GROUP == "STUDENT") {
							rh.KEY_MEALS = 120;
							rh.KEY_DB = 250;
						}
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
				rh.KEY_NAME = doc.data().name;
				rh.KEY_GROUP = doc.data().group;
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
			if (document.exist) {
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
		userRef.update({
			[rh.KEY_NAME]: name
		});
	}

	updatePhotoUrl(photoUrl) {
		const userRef = this._collectionRef.doc(rh.fbAuthManager.uid);
		userRef.update({
			[rh.KEY_PHOTO_URL]: photoUrl
		});

	}

	get name() {
		return this._document.data();
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
		$("#union-cafe").click(function () {
			console.log("You have clicked Union Cafe");
			window.location.href = `/union-cafe.html?uid=${rh.fbAuthManager.uid}`;
			return false;
		});
		$("#rose-gardens").click((event) => {
			console.log("You have clicked Rose Gardens");
			window.location.href = `/rose-gardens.html?uid=${rh.fbAuthManager.uid}`;
		});
		$("#moench-cafe").click((event) => {
			console.log("You have clicked Moench Cafe");
			window.location.href = `/moench-cafe.html?uid=${rh.fbAuthManager.uid}`;
		});
		$("#chaunceys").click((event) => {
			console.log("You have clicked Chauncey's");
			window.location.href = `/chaunceys.html?uid=${rh.fbAuthManager.uid}`;
		});
		$("#beanies").click((event) => {
			console.log("You have clicked Beanies");
			window.location.href = `/beanies.html?uid=${rh.fbAuthManager.uid}`;
		});
		$("#settings").click((event) => {
			console.log("You have clicked Settings");
			window.location.href = `/settings.html?uid=${rh.fbAuthManager.uid}`;
		});
		// //Dropdown Menu Actions
		// $("#menuSignOut").click((event) => {
		// 	console.log("Sign out.");
		// 	rh.fbAuthManager.signOut();
		// });
	}
	
}

rh.RestuarantPageController = class {
	/** constructor */
	constructor() {

	}
	methodName() {

	}
}

rh.SettingsPageController = class {
	/** constructor */
	constructor() {
		console.log(rh.KEY_NAME);
		console.log(rh.KEY_GROUP);
		rh.fbUserManager.beginListening(rh.fbAuthManager.uid, this.isStudent.bind(this));
		$("#logOut").click((event) => {
			console.log("Sign out.");
			rh.fbAuthManager.signOut();
		});

	}
	isStudent() {
		$("#name").html(`${rh.KEY_NAME}`);
		if(rh.KEY_GROUP == "STUDENT") {
			rh.KEY_MEALS = 120;
			rh.KEY_DB = 360.00;
			console.log("here");
			$("#meals").html(`Meals : ${rh.KEY_MEALS}`);
			$("#dB").html(`DB : $ ${rh.KEY_DB}`);
		} else {
			rh.KEY_MEALS = 90;
			rh.KEY_DB = 120;
			$("#meals").html(`Meals : ${rh.KEY_MEALS}`);
			$("#dB").html(`DB : ${rh.KEY_DB}`);
		}
	}
}

rh.FbSettingsManager = class {
	constructor(uid) {
		this._ref = firebase.firestore().collection(rh.COLLECTION_PHOTOCAPS);
		this._documentSnapshots = [];
		this._unsubscribe = null;
		this._uid = uid;
	}
}

rh.FbChaunceyManager = class {
	constructor(uid) {
		this._collectionRef = firebase.firestore().collection(rh.COLLECTION_CHAUNCEY_ITEMS);
		this._documentSnapshots = [];
		this._unsubscribe = null;
		this._uid = uid;
		rh.fbUserManager.beginListening(this._uid, this.addToOrder.bind(this));
		console.log(rh.KEY_GROUP);
	}

	beginListening(changeListener) {
		console.log("Listening for menu items");
		let query = this._collectionRef.orderBy(rh.KEY_LAST_TOUCHED, "desc").limit(3);
		if(this._uid) {
			query = query.where(rh.KEY_UID, "==", this._uid);
		}
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			console.log("Update " + this._documentSnapshots.length + "menu items");
			if(changeListener) {
				changeListener();
			}
		})
	}
	
	stopListening() {
		this._unsubscribe();
	}

	addToOrder() {
		console.log("Added to Order!");
	}
	getMennuItemAtIndex(index) {
		return new rh.Item(
			this._documentSnapshots[index].id,
			this._documentSnapshots[index],
		)
	}
}

rh.ChaunceysPageController = class {
	/** constructor */
	constructor() {
		rh.fbChaunceyManager.beginListening(this.updateView.bind(this));
		$("#shoppingCart").click((event) => {
			console.log("clicked on cart");
			window.location.href ="/shopping-cart.html";
		});

	}
	updateView() {
		$("#items").removeAttr("id").hide();
		let $newMenu = $("<div></div>").attr("id", "items");

		for (let k = 0; k < rh.fbChaunceyManager.length; k++) {
			const $newItem = this.createMenuItem(
				rh.fbChaunceyManager.getMennuItemAtIndex(k)
			);
			$newMenu.append($newItem);
		}
		$("#chauncey-page").append($newMenu);
	}
	createMenuItem(menuItem) {
		const $newItem = $(
			`<div class="icon col" >
				<img src="${menuItem.imageUrl}" alt="${menuItem.name}">
				<h6>${menuItem.name}</h6>
			</div>`
		);
		
	}
}

rh.checkForRedirects = function () {
	// Redirects
	if ($("#login-page").length && rh.fbAuthManager.isSignIn && !rh.fbAuthManager.rfUser) {
		window.location.href = `/main.html`;
	}
	if (!$("#login-page").length && !rh.fbAuthManager.isSignIn) {
		window.location.href = "/";
	}
}

rh.initializePage = function () {
	var urlParams = new URLSearchParams(window.location.search);
	if ($("#login-page").length) {
		console.log("On the login page.");
		new rh.LogInPageController();
	} else if ($("#main-page").length) {
		console.log("On the main menu page.");
		const urlUid = urlParams.get('uid');
		new rh.MainPageController();
	} else if ($("#chaunceys-page").length) {
		console.log("On Chauncey's page");
		const urlUid = urlParams.get('uid');
		rh.fbChaunceyManager = new rh.FbChaunceyManager(urlUid);
		new rh.ChaunceysPageController();
	} else if ($("#union-cafe-page").length) {
		console.log("On Union Cafe page");
		new rh.UnionPageController();
	} else if ($("#rose-gardens-page").length) {
		console.log("On Rose Gardens page");
		new rh.RGPageController();
	} else if ($("#moenhc-cafe-page").length) {
		console.log("On Moench Cafe page");
		new rh.MCPageController();
	} else if ($("#beanies-page").length) {
		console.log("On Beanies page");
		new rh.BeaniesPageController();
	} else if ($("#settings-page").length) {
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
		console.log(rh.KEY_NAME);
		rh.initializePage();
	});
});