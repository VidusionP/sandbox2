webpackJsonp([13],{

/***/ 420:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__page_manager__ = __webpack_require__(67);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__common_nod__ = __webpack_require__(68);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_jquery__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__common_models_forms__ = __webpack_require__(163);
function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function')}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')}return call&&(typeof call==='object'||typeof call==='function')?call:self}function _inherits(subClass,superClass){if(typeof superClass!=='function'&&superClass!==null){throw new TypeError('Super expression must either be null or a function, not '+typeof superClass)}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass}var ContactUs=function(_PageManager){_inherits(ContactUs,_PageManager);function ContactUs(){_classCallCheck(this,ContactUs);return _possibleConstructorReturn(this,_PageManager.apply(this,arguments))}ContactUs.prototype.loaded=function loaded(){this.registerContactFormValidation()};ContactUs.prototype.registerContactFormValidation=function registerContactFormValidation(){var formSelector='form[data-contact-form]';var contactUsValidator=Object(__WEBPACK_IMPORTED_MODULE_1__common_nod__["a" /* default */])({submit:formSelector+' input[type="submit"]'});var $contactForm=__WEBPACK_IMPORTED_MODULE_2_jquery___default()(formSelector);contactUsValidator.add([{selector:formSelector+' input[name="contact_email"]',validate:function validate(cb,val){var result=__WEBPACK_IMPORTED_MODULE_3__common_models_forms__["a" /* default */].email(val);cb(result)},errorMessage:this.context.contactEmail},{selector:formSelector+' textarea[name="contact_question"]',validate:function validate(cb,val){var result=__WEBPACK_IMPORTED_MODULE_3__common_models_forms__["a" /* default */].notEmpty(val);cb(result)},errorMessage:this.context.contactQuestion}]);$contactForm.submit(function(event){contactUsValidator.performCheck();if(contactUsValidator.areAll('valid')){return}event.preventDefault()})};return ContactUs}(__WEBPACK_IMPORTED_MODULE_0__page_manager__["a" /* default */]);/* harmony default export */ __webpack_exports__["default"] = (ContactUs);

/***/ })

});
//# sourceMappingURL=theme-bundle.chunk.13.js.map