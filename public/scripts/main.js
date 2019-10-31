/**
 * @fileoverview
 * Provides interactions for all pages in the UI.
 *
 * @author 
 */

/** namespace. */
var rh = rh || {};

/** globals */
rh.variableName = "";

/** function and class syntax examples */
rh.functionName = function () {
	/** function body */
};

rh.ClassName = class {
	/** constructor */
	constructor() {

	}
	methodName() {

	}
}

/* Main */
$(document).ready(() => {
	console.log("Ready");
	if($("#login-page").length){
		console.log("On log in page");
		new rh.LogInPageController();
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
