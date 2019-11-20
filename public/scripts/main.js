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

rh.COLLECTION_CHAUNCEYS = "Chaunceys";
rh.COLLECTION_ROSE_GARDEN = "Rose Gardens";
rh.COLLECTION_UNION_CAFE = "Union Cafe";
rh.COLLECTION_MOENCH_CAFE = "Moench Cafe";
rh.COLLECTION_BEANIES = "Beanies";
rh.KEY_ITEM_NAME = "itemName";
rh.KEY_ITEM_IMAGE_URL = "imageUrl";
rh.KEY_INGREDIENTS = "ingredients";
rh.KEY_CALORIES = 0;
rh.KEY_SHORT = "short";
rh.KEY_MENU_TYPE = "menuType";
rh.KEY_LAST_TOUCHED = "lastTouched";

rh.COLLECTION_CART = "Shopping Cart";
rh.KEY_USER = "user";
rh.KEY_MENU = "menu";

rh.fbOrderManager = null;
rh.fbUserManager = null;
rh.fbItemManager = null;
rh.fbAuthManager = null;
rh.fbResturantManager = null;
rh.fbShoppingCartManager = null;

rh.Order = class {
	constructor(uid, item, menu, imageUrl) {
		this.uid = uid;
		this.item = item;
		this.menu = menu;
		this.imageUrl = imageUrl;
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

	get name() {
		if (this._user) {
			return this._user.name;
		}
		console.log("This user has no name!");
		return "";
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
				this._user = rfUser;
				// Option #1 (won't be implementing): Use rfUser NOW and set a document in Firebase!
				firebase.auth().signInWithCustomToken(rfUser.token).then((authData) => {
					// User logged in successfully 
					console.log("Firebase auth worked too!");
					// resolve();
					rh.fbUserManager.setUser(rfUser).then(() => {
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
		// this.rfUser = null;
	}

	beginListening(uid, changeListener) {
		console.log("Listening for user", uid);
		this._unsubscribe = this._collectionRef.doc(uid).onSnapshot((doc) => {
			if (doc.exists) {
				this._document = doc;
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
		// this.rfUser = rfUser;
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
		return this._document.get(rh.KEY_NAME);
	}

	get photoUrl() {
		return this._document.get(rh.KEY_PHOTO_URL);
	}

	get group() {
		return this._document.get(rh.KEY_GROUP);
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
			window.location.href = `/union-cafe.html`;
			return false;
		});
		$("#rose-gardens").click((event) => {
			console.log("You have clicked Rose Gardens");
			window.location.href = `/rose-gardens.html`;
		});
		$("#moench-cafe").click((event) => {
			console.log("You have clicked Moench Cafe");
			window.location.href = `/moench-cafe.html`;
		});
		$("#chaunceys").click((event) => {
			console.log("You have clicked Chauncey's");
			window.location.href = `/chaunceys.html`;
		});
		$("#beanies").click((event) => {
			console.log("You have clicked Beanies");
			window.location.href = `/beanies.html`;
		});
		$("#settings").click((event) => {
			console.log("You have clicked Settings");
			window.location.href = `/settings.html`;
		});
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
rh.SettingsPageController = class {
	/** constructor */
	constructor() {
		rh.fbUserManager.beginListening(rh.fbAuthManager.uid, this.isStudent.bind(this));
		rh.fbUserManager.beginListening(rh.fbAuthManager.uid, this.updateStudentInfo.bind(this));
		$("#logOut").click((event) => {
			console.log("Sign out.");
			rh.fbAuthManager.signOut();
		});
	}
	isStudent() {
		$("#name").html(`${rh.fbUserManager.name}`);
		if (rh.fbUserManager.group == "STUDENT") {
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
	updateStudentInfo() {
		rh.updateStudentInfo();
	}
}
rh.FbResturantManager = class {
	constructor(uid, menu) {
		this._collectionRef = firebase.firestore().collection(menu);
		this._documentSnapshots = [];
		this._unsubscribe = null;
		this._uid = uid
		this._menuType = null;
		this._name = menu;
	}

	beginListening(menuType, changeListener) {
		console.log("Listening for menu items");
		this._menuType = menuType;
		let query = this._collectionRef.orderBy(rh.KEY_LAST_TOUCHED, "desc").limit(3);
		if (this._uid) {
			query = query.where('menu', "==", menuType);
		}
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			console.log("Update " + this._documentSnapshots.length + " menu items");
			if (changeListener) {
				changeListener();
			}
		})
	}

	stopListening() {
		this._unsubscribe();
	}
	get length() {
		return this._documentSnapshots.length;
	}
	getMenuItemAtIndex(index) {
		return new rh.Item(
			this._documentSnapshots[index].id,
			this._documentSnapshots[index]._document.proto.fields.name.stringValue,
			this._documentSnapshots[index]._document.proto.fields.imageUrl.stringValue,
			this._documentSnapshots[index]._document.proto.fields.ingredients.stringValue,
			this._documentSnapshots[index]._document.proto.fields.calPer.stringValue,
			this._documentSnapshots[index]._document.proto.fields.calories.integerValue,
		)
	}
}
rh.ChaunceysPageController = class {
	/** constructor */
	constructor() {
		rh.fbResturantManager.beginListening("fav", this.updateFavView.bind(this));
		rh.fbResturantManager.beginListening("special", this.updateSpecialView.bind(this));
		// rh.fbChaunceyManager.beginListening("item", this.updateView.bind(this));
		rh.fbResturantManager.beginListening("fav", this.updateFavModals.bind(this));
		rh.fbResturantManager.beginListening("special", this.updateSpecialModals.bind(this));
		rh.fbUserManager.beginListening(rh.fbAuthManager.uid, this.updateStudentInfo.bind(this));
		$("#shoppingCart").click((event) => {
			console.log("clicked on cart");
			window.location.href = "/shopping-cart.html";
		});
		$(document).on('click', '#addToOrder', function () {
			// alert(`Added To Order!`);
			$(this).html("ADDED TO ORDER");
			// $("#addToOrder").html("ADDED TO ORDER");
			rh.addToOrder(rh.fbAuthManager.uid, $(this).attr("name"), rh.COLLECTION_CHAUNCEYS);
		});
	}
	updateFavView() {
		$("#fav").removeAttr("id").hide();
		let $newMenu = $("<div></div>").attr("id", "fav").addClass("row");
		for (let k = 0; k < rh.fbResturantManager.length; k++) {
			const $newItem = this.createMenuItem(
				rh.fbResturantManager.getMenuItemAtIndex(k)
			);
			$newMenu.append($newItem);
		}
		$("#fav-menu").append($newMenu);
	}
	// updateView() {
	// 	// $("#fav").removeAttr("id").hide();
	// 	let $newMenu = $("<div></div>").attr("id", "item").addClass("row");
	// 	for (let k = 0; k < rh.fbChaunceyManager.length; k++) {
	// 		const $newItem = this.createMenuItem(
	// 			rh.fbChaunceyManager.getMenuItemAtIndex(k)
	// 		);
	// 		$newMenu.append($newItem);
	// 	}
	// 	console.log($newMenu);
	// 	$("#fav").append($newMenu);
	// }
	updateSpecialView() {
		$("#special").removeAttr("id").hide();
		let $newMenu = $("<div></div>").attr("id", "special").addClass("row");
		for (let k = 0; k < rh.fbResturantManager.length; k++) {
			const $newItem = this.createMenuItem(
				rh.fbResturantManager.getMenuItemAtIndex(k)
			);
			$newMenu.append($newItem);
		}
		$("#special-menu").append($newMenu);
	}
	updateFavModals() {
		let $newModals = $("<div></div>").attr("id", "chaunceys-modal").addClass("container");
		for (let k = 0; k < rh.fbResturantManager.length; k++) {
			const $newItemModal = this.createItemModal(
				rh.fbResturantManager.getMenuItemAtIndex(k)
			);
			$newModals.append($newItemModal);
		}
		$("#chaunceys-page").append($newModals);
	}
	updateSpecialModals() {
		let $newModals = $("<div></div>").attr("id", "chaunceys-modal").addClass("container");
		for (let k = 0; k < rh.fbResturantManager.length; k++) {
			const $newItemModal = this.createItemModal(
				rh.fbResturantManager.getMenuItemAtIndex(k)
			);
			$newModals.append($newItemModal);
		}
		$("#chaunceys-page").append($newModals);
	}
	createMenuItem(menuItem) {
		const $newItem = $(
			`<div class="icon col" data-toggle="modal" data-target="#${menuItem.name}" >
				<img src="${menuItem.image}" alt="${menuItem.name}">
				<h6>${menuItem.name}</h6>
			</div>
			`
		);
		$newItem.click((event) => {
			console.log("You have clicked ", menuItem.name);
			$(`#${menuItem.name}`).modal('show');
		})
		// $(`#${menuItem.name}`).modal('hide');
		return $newItem;

	}
	createItemModal(menuItem) {
		const $newModal = $(
			`<div class="modal" data-backdrop="true" id="${menuItem.name}" tabindex="-1" role="dialog" aria-labelledby="add photo"
		aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">${menuItem.name}</h5>
				</div>
				<div class="modal-body">
					<div class="modal-box row justify-content-center">
						<div class="modal-icon col">

							<img src="${menuItem.image}"
								alt="${menuItem.name}">
						</div>
						<div class="col">
							<h3>Calories: ${menuItem.calories}</h3>
							<p>*Calories per ${menuItem.calPer}</p>
						</div>
					</div>
					<div class="modal-box row">
						<h6>Ingredients:</h6>
						<p>${menuItem.ingredients}</p>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-outline-danger"
						data-dismiss="modal">CANCEL</button>
					<button type="button" name="${menuItem.id}" id="addToOrder" class="btn btn-outline-danger"
						>ADD TO ORDER</button>
				</div>
			</div>
		</div>
	</div>`
		);
		return $newModal;
	}
	updateStudentInfo() {
		rh.updateStudentInfo();
	}
}
rh.RoseGardenPageController = class {
	/** constructor */
	constructor() {
		rh.fbResturantManager.beginListening("fav", this.updateFavView.bind(this));
		rh.fbResturantManager.beginListening("special", this.updateSpecialView.bind(this));
		// rh.fbRoseGardenManager.beginListening("item", this.updateView.bind(this));
		rh.fbResturantManager.beginListening("fav", this.updateFavModals.bind(this));
		rh.fbResturantManager.beginListening("special", this.updateSpecialModals.bind(this));
		rh.fbUserManager.beginListening(rh.fbAuthManager.uid, this.updateStudentInfo.bind(this));
		$("#shoppingCart").click((event) => {
			console.log("clicked on cart");
			window.location.href = "/shopping-cart.html";
		});
		$(document).on('click', '#addToOrder', function () {
			// alert(`Added To Order!`);
			$(this).html("ADDED TO ORDER");
			// $("#addToOrder").html("ADDED TO ORDER");
			rh.addToOrder(rh.fbAuthManager.uid, $(this).attr("name"), rh.COLLECTION_ROSE_GARDEN);
		});
	}
	updateFavView() {
		console.log("hide");
		$("#fav").removeAttr("id").hide();
		let $newMenu = $("<div></div>").attr("id", "fav").addClass("row");
		for (let k = 0; k < rh.fbResturantManager.length; k++) {
			const $newItem = this.createMenuItem(
				rh.fbResturantManager.getMenuItemAtIndex(k)
			);
			$newMenu.append($newItem);
		}
		$("#fav-menu").append($newMenu);
	}
	// updateView() {
	// 	// $("#fav").removeAttr("id").hide();
	// 	let $newMenu = $("<div></div>").attr("id", "item").addClass("row");
	// 	for (let k = 0; k < rh.fbResturantManager.length; k++) {
	// 		const $newItem = this.createMenuItem(
	// 			rh.fbResturantManager.getMenuItemAtIndex(k)
	// 		);
	// 		$newMenu.append($newItem);
	// 	}
	// 	console.log($newMenu);
	// 	$("#fav").append($newMenu);
	// }
	updateSpecialView() {
		$("#special").removeAttr("id").hide();
		let $newMenu = $("<div></div>").attr("id", "special").addClass("row");
		for (let k = 0; k < rh.fbResturantManager.length; k++) {
			const $newItem = this.createMenuItem(
				rh.fbResturantManager.getMenuItemAtIndex(k)
			);
			$newMenu.append($newItem);
		}
		$("#special-menu").append($newMenu);
	}
	updateFavModals() {
		let $newModals = $("<div></div>").attr("id", "rose-gardens-modal").addClass("container");
		for (let k = 0; k < rh.fbResturantManager.length; k++) {
			const $newItemModal = this.createItemModal(
				rh.fbResturantManager.getMenuItemAtIndex(k)
			);
			$newModals.append($newItemModal);
		}
		$("#rose-gardens-page").append($newModals);
	}
	updateSpecialModals() {
		let $newModals = $("<div></div>").attr("id", "rose-gardens-modal").addClass("container");
		for (let k = 0; k < rh.fbResturantManager.length; k++) {
			const $newItemModal = this.createItemModal(
				rh.fbResturantManager.getMenuItemAtIndex(k)
			);
			$newModals.append($newItemModal);
		}
		$("#rose-gardens-page").append($newModals);
	}
	createMenuItem(menuItem) {
		const $newItem = $(
			`<div class="icon col" data-toggle="modal" data-target="#${menuItem.name}" >
				<img src="${menuItem.image}" alt="${menuItem.name}">
				<h6>${menuItem.name}</h6>
			</div>
			`
		);
		$newItem.click((event) => {
			console.log("You have clicked ", menuItem.name);
			$(`#${menuItem.name}`).modal('show');
		})
		// $(`#${menuItem.name}`).modal('hide');
		return $newItem;

	}
	createItemModal(menuItem) {
		const $newModal = $(
			`<div class="modal" data-backdrop="true" id="${menuItem.name}" tabindex="-1" role="dialog" aria-labelledby="add photo"
		aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">${menuItem.name}</h5>
				</div>
				<div class="modal-body">
					<div class="modal-box row justify-content-center">
						<div class="modal-icon col">

							<img src="${menuItem.image}"
								alt="${menuItem.name}">
						</div>
						<div class="col">
							<h3>Calories: ${menuItem.calories}</h3>
							<p>*Calories per ${menuItem.calPer}</p>
						</div>
					</div>
					<div class="modal-box row">
						<h6>Ingredients:</h6>
						<p>${menuItem.ingredients}</p>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-outline-danger"
						data-dismiss="modal">CANCEL</button>
					<button type="button" name="${menuItem.id}" id="addToOrder" class="btn btn-outline-danger"
						>ADD TO ORDER</button>
				</div>
			</div>
		</div>
	</div>`
		);
		return $newModal;
	}
	updateStudentInfo() {
		rh.updateStudentInfo();
	}
}
rh.UnionCafePageController = class {
	/** constructor */
	constructor() {
		rh.fbResturantManager.beginListening("fav", this.updateFavView.bind(this));
		rh.fbResturantManager.beginListening("special", this.updateSpecialView.bind(this));
		// rh.fbRoseGardenManager.beginListening("item", this.updateView.bind(this));
		rh.fbResturantManager.beginListening("fav", this.updateFavModals.bind(this));
		rh.fbResturantManager.beginListening("special", this.updateSpecialModals.bind(this));
		rh.fbUserManager.beginListening(rh.fbAuthManager.uid, this.updateStudentInfo.bind(this));
		$("#shoppingCart").click((event) => {
			console.log("clicked on cart");
			window.location.href = "/shopping-cart.html";
		});
		$(document).on('click', '#addToOrder', function () {
			// alert(`Added To Order!`);
			$(this).html("ADDED TO ORDER");
			// $("#addToOrder").html("ADDED TO ORDER");
			rh.addToOrder(rh.fbAuthManager.uid, $(this).attr("name"), rh.COLLECTION_UNION_CAFE);
		});
	}
	updateFavView() {
		console.log("hide");
		$("#fav").removeAttr("id").hide();
		let $newMenu = $("<div></div>").attr("id", "fav").addClass("row");
		for (let k = 0; k < rh.fbResturantManager.length; k++) {
			const $newItem = this.createMenuItem(
				rh.fbResturantManager.getMenuItemAtIndex(k)
			);
			$newMenu.append($newItem);
		}
		$("#fav-menu").append($newMenu);
	}
	// updateView() {
	// 	// $("#fav").removeAttr("id").hide();
	// 	let $newMenu = $("<div></div>").attr("id", "item").addClass("row");
	// 	for (let k = 0; k < rh.fbResturantManager.length; k++) {
	// 		const $newItem = this.createMenuItem(
	// 			rh.fbResturantManager.getMenuItemAtIndex(k)
	// 		);
	// 		$newMenu.append($newItem);
	// 	}
	// 	console.log($newMenu);
	// 	$("#fav").append($newMenu);
	// }
	updateSpecialView() {
		$("#special").removeAttr("id").hide();
		let $newMenu = $("<div></div>").attr("id", "special").addClass("row");
		for (let k = 0; k < rh.fbResturantManager.length; k++) {
			const $newItem = this.createMenuItem(
				rh.fbResturantManager.getMenuItemAtIndex(k)
			);
			$newMenu.append($newItem);
		}
		$("#special-menu").append($newMenu);
	}
	updateFavModals() {
		let $newModals = $("<div></div>").attr("id", "union-cafe-modal").addClass("container");
		for (let k = 0; k < rh.fbResturantManager.length; k++) {
			const $newItemModal = this.createItemModal(
				rh.fbResturantManager.getMenuItemAtIndex(k)
			);
			$newModals.append($newItemModal);
		}
		$("#union-cafe-page").append($newModals);
	}
	updateSpecialModals() {
		let $newModals = $("<div></div>").attr("id", "union-cafe-modal").addClass("container");
		for (let k = 0; k < rh.fbResturantManager.length; k++) {
			const $newItemModal = this.createItemModal(
				rh.fbResturantManager.getMenuItemAtIndex(k)
			);
			$newModals.append($newItemModal);
		}
		$("#union-cafe-page").append($newModals);
	}
	createMenuItem(menuItem) {
		const $newItem = $(
			`<div class="icon col" data-toggle="modal" data-target="#${menuItem.name}" >
			<img src="${menuItem.image}" alt="${menuItem.name}">
			<h6>${menuItem.name}</h6>
		</div>
		`
		);
		$newItem.click((event) => {
			console.log("You have clicked ", menuItem.name);
			$(`#${menuItem.name}`).modal('show');
		})
		// $(`#${menuItem.name}`).modal('hide');
		return $newItem;

	}
	createItemModal(menuItem) {
		const $newModal = $(
			`<div class="modal" data-backdrop="true" id="${menuItem.name}" tabindex="-1" role="dialog" aria-labelledby="add photo"
	aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">${menuItem.name}</h5>
			</div>
			<div class="modal-body">
				<div class="modal-box row justify-content-center">
					<div class="modal-icon col">

						<img src="${menuItem.image}"
							alt="${menuItem.name}">
					</div>
					<div class="col">
						<h3>Calories: ${menuItem.calories}</h3>
						<p>*Calories per ${menuItem.calPer}</p>
					</div>
				</div>
				<div class="modal-box row">
					<h6>Ingredients:</h6>
					<p>${menuItem.ingredients}</p>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-outline-danger"
					data-dismiss="modal">CANCEL</button>
				<button type="button" name="${menuItem.id}" id="addToOrder" class="btn btn-outline-danger"
					>ADD TO ORDER</button>
			</div>
		</div>
	</div>
</div>`
		);
		return $newModal;
	}
	updateStudentInfo() {
		rh.updateStudentInfo();
	}
}
rh.BeaniesPageController = class {
	/** constructor */
	constructor() {
		rh.fbResturantManager.beginListening("fav", this.updateFavView.bind(this));
		// rh.fbRoseGardenManager.beginListening("item", this.updateView.bind(this));
		rh.fbResturantManager.beginListening("fav", this.updateFavModals.bind(this));
		rh.fbUserManager.beginListening(rh.fbAuthManager.uid, this.updateStudentInfo.bind(this));
		$("#shoppingCart").click((event) => {
			console.log("clicked on cart");
			window.location.href = "/shopping-cart.html";
		});
		$(document).on('click', '#addToOrder', function () {
			// alert(`Added To Order!`);
			$(this).html("ADDED TO ORDER");
			// $("#addToOrder").html("ADDED TO ORDER");
			rh.addToOrder(rh.fbAuthManager.uid, $(this).attr("name"), rh.COLLECTION_BEANIES);
		});
	}
	updateFavView() {
		console.log("hide");
		$("#fav").removeAttr("id").hide();
		let $newMenu = $("<div></div>").attr("id", "fav").addClass("row");
		for (let k = 0; k < rh.fbResturantManager.length; k++) {
			const $newItem = this.createMenuItem(
				rh.fbResturantManager.getMenuItemAtIndex(k)
			);
			$newMenu.append($newItem);
		}
		$("#fav-menu").append($newMenu);
	}
	// updateView() {
	// 	// $("#fav").removeAttr("id").hide();
	// 	let $newMenu = $("<div></div>").attr("id", "item").addClass("row");
	// 	for (let k = 0; k < rh.fbResturantManager.length; k++) {
	// 		const $newItem = this.createMenuItem(
	// 			rh.fbResturantManager.getMenuItemAtIndex(k)
	// 		);
	// 		$newMenu.append($newItem);
	// 	}
	// 	console.log($newMenu);
	// 	$("#fav").append($newMenu);
	// }
	updateFavModals() {
		let $newModals = $("<div></div>").attr("id", "rose-gardens-modal").addClass("container");
		for (let k = 0; k < rh.fbResturantManager.length; k++) {
			const $newItemModal = this.createItemModal(
				rh.fbResturantManager.getMenuItemAtIndex(k)
			);
			$newModals.append($newItemModal);
		}
		$("#beanies-page").append($newModals);
	}
	createMenuItem(menuItem) {
		const $newItem = $(
			`<div class="icon col" data-toggle="modal" data-target="#${menuItem.name}" >
			<img src="${menuItem.image}" alt="${menuItem.name}">
			<h6>${menuItem.name}</h6>
		</div>
		`
		);
		$newItem.click((event) => {
			console.log("You have clicked ", menuItem.name);
			$(`#${menuItem.name}`).modal('show');
			console.log($(`#${menuItem.name}`).modal('show'));
		})
		// $(`#${menuItem.name}`).modal('hide');
		return $newItem;

	}
	createItemModal(menuItem) {
		const $newModal = $(
			`<div class="modal" data-backdrop="true" id="${menuItem.name}" tabindex="-1" role="dialog" aria-labelledby="add photo"
	aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">${menuItem.name}</h5>
			</div>
			<div class="modal-body">
				<div class="modal-box row justify-content-center">
					<div class="modal-icon col">

						<img src="${menuItem.image}"
							alt="${menuItem.name}">
					</div>
					<div class="col">
						<h3>Calories: ${menuItem.calories}</h3>
						<p>*Calories per ${menuItem.calPer}</p>
					</div>
				</div>
				<div class="modal-box row">
					<h6>Ingredients:</h6>
					<p>${menuItem.ingredients}</p>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-outline-danger"
					data-dismiss="modal">CANCEL</button>
				<button type="button" name="${menuItem.id}" id="addToOrder" class="btn btn-outline-danger"
					>ADD TO ORDER</button>
			</div>
		</div>
	</div>
</div>`
		);
		return $newModal;
	}
	updateStudentInfo() {
		rh.updateStudentInfo();
	}
}
rh.MoenchCafePageController = class {
	/** constructor */
	constructor() {
		rh.fbResturantManager.beginListening("fav", this.updateFavView.bind(this));
		// rh.fbRoseGardenManager.beginListening("item", this.updateView.bind(this));
		rh.fbResturantManager.beginListening("fav", this.updateFavModals.bind(this));
		rh.fbUserManager.beginListening(rh.fbAuthManager.uid, this.updateStudentInfo.bind(this));
		$("#shoppingCart").click((event) => {
			console.log("clicked on cart");
			window.location.href = "/shopping-cart.html";
		});
		$(document).on('click', '#addToOrder', function () {
			// alert(`Added To Order!`);
			$(this).html("ADDED TO ORDER");
			// $("#addToOrder").html("ADDED TO ORDER");
			console.log($(this).attr("name"));
			rh.addToOrder(rh.fbAuthManager.uid, $(this).attr("name"), rh.COLLECTION_MOENCH_CAFE);
		});
	}
	updateFavView() {
		console.log("hide");
		$("#fav").removeAttr("id").hide();
		let $newMenu = $("<div></div>").attr("id", "fav").addClass("row");
		for (let k = 0; k < rh.fbResturantManager.length; k++) {
			const $newItem = this.createMenuItem(
				rh.fbResturantManager.getMenuItemAtIndex(k)
			);
			$newMenu.append($newItem);
		}
		$("#fav-menu").append($newMenu);
	}
	// updateView() {
	// 	// $("#fav").removeAttr("id").hide();
	// 	let $newMenu = $("<div></div>").attr("id", "item").addClass("row");
	// 	for (let k = 0; k < rh.fbResturantManager.length; k++) {
	// 		const $newItem = this.createMenuItem(
	// 			rh.fbResturantManager.getMenuItemAtIndex(k)
	// 		);
	// 		$newMenu.append($newItem);
	// 	}
	// 	console.log($newMenu);
	// 	$("#fav").append($newMenu);
	// }
	updateFavModals() {
		let $newModals = $("<div></div>").attr("id", "rose-gardens-modal").addClass("container");
		for (let k = 0; k < rh.fbResturantManager.length; k++) {
			const $newItemModal = this.createItemModal(
				rh.fbResturantManager.getMenuItemAtIndex(k)
			);
			$newModals.append($newItemModal);
		}
		$("#moench-cafe-page").append($newModals);
	}
	createMenuItem(menuItem) {
		const $newItem = $(
			`<div class="icon col" data-toggle="modal" data-target="#${menuItem.name}" >
			<img src="${menuItem.image}" alt="${menuItem.name}">
			<h6>${menuItem.name}</h6>
		</div>
		`
		);
		$newItem.click((event) => {
			console.log("You have clicked ", menuItem.name);
			$(`#${menuItem.name}`).modal('show');
		})
		// $(`#${menuItem.name}`).modal('hide');
		return $newItem;

	}
	createItemModal(menuItem) {
		const $newModal = $(
			`<div class="modal" data-backdrop="true" id="${menuItem.name}" tabindex="-1" role="dialog" aria-labelledby="add photo"
	aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">${menuItem.name}</h5>
			</div>
			<div class="modal-body">
				<div class="modal-box row justify-content-center">
					<div class="modal-icon col">

						<img src="${menuItem.image}"
							alt="${menuItem.name}">
					</div>
					<div class="col">
						<h3>Calories: ${menuItem.calories}</h3>
						<p>*Calories per ${menuItem.calPer}</p>
					</div>
				</div>
				<div class="modal-box row">
					<h6>Ingredients:</h6>
					<p>${menuItem.ingredients}</p>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-outline-danger"
					data-dismiss="modal">CANCEL</button>
				<button type="button" name="${menuItem.id}" id="addToOrder" class="btn btn-outline-danger"
					>ADD TO ORDER</button>
			</div>
		</div>
	</div>
</div>`
		);
		return $newModal;
	}
	updateStudentInfo() {
		rh.updateStudentInfo();
	}
}
rh.FbShoppingCartManager = class {
	constructor(uid, menu) {
		this._collectionRef = firebase.firestore().collection("Shopping Cart");
		this._documentSnapshots = [];
		this._unsubscribe = null;
		this._uid = uid
	}

	beginListening(changeListener) {
		console.log("Listening for order items");
		let query = this._collectionRef.orderBy(rh.KEY_LAST_TOUCHED, "desc").limit(3);
		if (this._uid) {
			console.log(this._uid);
			query = query.where('user', "==", this._uid);
		}
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			console.log("Update " + this._documentSnapshots.length + " order items");
			if (changeListener) {
				changeListener();
			}
		})
	}

	stopListening() {
		this._unsubscribe();
	}
	get length() {
		return this._documentSnapshots.length;
	}
	getMenuItemAtIndex(index) {
		return new rh.Order(
			this._documentSnapshots[index]._document.proto.fields.user.stringValue,
			this._documentSnapshots[index]._document.proto.fields.itemName.stringValue,
			this._documentSnapshots[index]._document.proto.fields.menu.stringValue,
			this._documentSnapshots[index]._document.proto.fields.imageUrl.stringValue,

		)
	}
}
rh.ShoppingCartPageController = class {
	constructor() {
		rh.fbShoppingCartManager.beginListening(this.updateView.bind(this));
		rh.fbUserManager.beginListening(rh.fbAuthManager.uid, this.updateStudentInfo.bind(this));
	}
	updateView() {
		$("#item-list").removeAttr("id").hide();
		let $newOrder = $("<div></div>").attr("id", "orders").addClass("row");
		for (let k = 0; k < rh.fbShoppingCartManager.length; k++) {
			const $newItem = this.createItem(
				rh.fbShoppingCartManager.getMenuItemAtIndex(k)
			);
			$newOrder.append($newItem);
		}
		$("#order-list").append($newOrder);
	}
	createItem(menuItem) {
		const $newItem = $(`
		<div id="item-list" name="${menuItem.id}"class="row">
		    <div class="modal-icon col">
		        <img src=${menuItem.imageUrl} alt="${menuItem.item}">
		     </div>
		    <div id="item-info" class="col">
		        <h6>${menuItem.item}</h6>
		        <p>${menuItem.menu}</p>
			</div>
		</div>
		
		`);
		return $newItem;
	}
	updateStudentInfo() {
		rh.updateStudentInfo();
	}
}

rh.updateStudentInfo = function () {
	const $studentInfo = (`
	<img id="drawer-img" class="navbar-brand" src="/images/profile_sally.png" alt="profile pic">
	<a id="drawer-text" class="navbar-brand">${rh.fbUserManager.name}</a>
	<a id="drawer-text" class="navbar-brand">${rh.fbAuthManager.uid}@rose-hulman.edu</a>
	`);
	$("#studentinfo").append($studentInfo);
}

rh.addToOrder = function (userId, itemId, menu) {
	// console.log(menuItem);
	console.log(`Add thy daily bread`);
	this._collectionRef = firebase.firestore().collection(menu);
	docRef = this._collectionRef.doc(itemId);
	docRef.get().then(function (doc) {
		if (doc.exists) {
			// rh.ShoppingCartPageController.addItemToOrder(doc, menu, userId);
			firebase.firestore().collection("Shopping Cart").add({
				[rh.KEY_USER]: userId,
				[rh.KEY_ITEM_NAME]: doc.data().name,
				[rh.KEY_ITEM_IMAGE_URL]: doc.data().imageUrl,
				[rh.KEY_MENU]: menu,
				[rh.KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			}).then((docRef) => {
				console.log("Document has been added with id", docRef.id);
			}).catch((error) => {
				console.log("There was an error adding the document", error);
			});
		} else {
			console.log("No doc exists");
		}
	}).catch(function (error) {
		console.log("Error occurred : ", error);
	});
}

rh.checkForRedirects = function () {
	// Redirects
	if ($("#login-page").length && rh.fbAuthManager.isSignIn && !rh.fbAuthManager.rfUser) {
		window.location.href = ` / main.html `;
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
		new rh.MainPageController();
	} else if ($("#chaunceys-page").length) {
		console.log("On Chauncey's page");
		rh.fbResturantManager = new rh.FbResturantManager(rh.fbAuthManager.uid, rh.COLLECTION_CHAUNCEYS);
		new rh.ChaunceysPageController();
	} else if ($("#union-cafe-page").length) {
		console.log("On Union Cafe page");
		rh.fbResturantManager = new rh.FbResturantManager(rh.fbAuthManager.uid, rh.COLLECTION_UNION_CAFE);
		new rh.UnionCafePageController();
	} else if ($("#rose-gardens-page").length) {
		console.log("On Rose Gardens page");
		rh.fbResturantManager = new rh.FbResturantManager(rh.fbAuthManager.uid, rh.COLLECTION_ROSE_GARDEN);
		new rh.RoseGardenPageController();
	} else if ($("#moench-cafe-page").length) {
		console.log("On Moench Cafe page");
		rh.fbResturantManager = new rh.FbResturantManager(rh.fbAuthManager.uid, rh.COLLECTION_MOENCH_CAFE);
		new rh.MoenchCafePageController();
	} else if ($("#beanies-page").length) {
		console.log("On Beanies page");
		rh.fbResturantManager = new rh.FbResturantManager(rh.fbAuthManager.uid, rh.COLLECTION_BEANIES);
		new rh.BeaniesPageController();
	} else if ($("#settings-page").length) {
		console.log("On Settings page");
		new rh.SettingsPageController();
	} else if ($("#shopping-cart-page").length) {
		console.log("On the Shopping Cart");
		rh.fbShoppingCartManager = new rh.FbShoppingCartManager(rh.fbAuthManager.uid, rh.COLLECTION_CART);
		new rh.ShoppingCartPageController();
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