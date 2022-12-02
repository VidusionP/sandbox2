webpackJsonp([14],{

/***/ 420:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__page_manager__ = __webpack_require__(67);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_jquery__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_sweetalert2__ = __webpack_require__(52);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_sweetalert2___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_sweetalert2__);
function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function')}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')}return call&&(typeof call==='object'||typeof call==='function')?call:self}function _inherits(subClass,superClass){if(typeof superClass!=='function'&&superClass!==null){throw new TypeError('Super expression must either be null or a function, not '+typeof superClass)}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass}var Compare=function(_PageManager){_inherits(Compare,_PageManager);function Compare(){_classCallCheck(this,Compare);return _possibleConstructorReturn(this,_PageManager.apply(this,arguments))}Compare.prototype.loaded=function loaded(){var _this2=this;var message=this.context.compareRemoveMessage;__WEBPACK_IMPORTED_MODULE_1_jquery___default()('body').on('click','[data-comparison-remove]',function(event){if(_this2.context.comparisons.length<=2){__WEBPACK_IMPORTED_MODULE_2_sweetalert2___default()({text:message,type:'error'});event.preventDefault()}})};return Compare}(__WEBPACK_IMPORTED_MODULE_0__page_manager__["a" /* default */]);/* harmony default export */ __webpack_exports__["default"] = (Compare);

/***/ })

});
//# sourceMappingURL=theme-bundle.chunk.14.js.map