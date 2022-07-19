webpackJsonp([9],{

/***/ 418:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__catalog__ = __webpack_require__(409);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__common_faceted_search__ = __webpack_require__(410);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__bigcommerce_stencil_utils__ = __webpack_require__(18);
function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function')}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')}return call&&(typeof call==='object'||typeof call==='function')?call:self}function _inherits(subClass,superClass){if(typeof superClass!=='function'&&superClass!==null){throw new TypeError('Super expression must either be null or a function, not '+typeof superClass)}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass}var Paginator=function(_CatalogPage){_inherits(Paginator,_CatalogPage);function Paginator(){_classCallCheck(this,Paginator);return _possibleConstructorReturn(this,_CatalogPage.apply(this,arguments))}Paginator.prototype.loaded=function loaded(){// if ($('#facetedSearch').length > 0) {
//     this.initFacetedSearch();
// } else {
//     this.onSortBySubmit = this.onSortBySubmit.bind(this);
//     hooks.on('sortBy-submitted', this.onSortBySubmit);
// }
this.showMoreProducts()};// initFacetedSearch() {
//     const $productListingContainer = $('#product-listing-container');
//     const $facetedSearchContainer = $('#faceted-search-container');
//     const productsPerPage = this.context.categoryProductsPerPage;
//     const requestOptions = {
//         config: {
//             category: {
//                 shop_by_price: true,
//                 products: {
//                     limit: productsPerPage,
//                 },
//             },
//         },
//         template: {
//             productListing: 'category/product-listing',
//             sidebar: 'category/sidebar',
//         },
//         showMore: 'category/show-more',
//     };
//     this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
//         $productListingContainer.html(content.productListing);
//         $facetedSearchContainer.html(content.sidebar);
//         this.showMoreProducts();
//         $('html, body').animate({
//             scrollTop: 0,
//         }, 100);
//     });
// }
Paginator.prototype.showMoreProducts=function showMoreProducts(){__WEBPACK_IMPORTED_MODULE_0_jquery___default()('.pagination-link').on('click',function(event){console.log('hi')})};return Paginator}(__WEBPACK_IMPORTED_MODULE_1__catalog__["a" /* default */]);/* harmony default export */ __webpack_exports__["default"] = (Paginator);

/***/ })

});
//# sourceMappingURL=theme-bundle.chunk.9.js.map