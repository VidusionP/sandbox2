import $ from 'jquery';
import CatalogPage from './catalog';
import FacetedSearch from './common/faceted-search';
import { hooks } from '@bigcommerce/stencil-utils';




export default class Paginator extends CatalogPage {
    loaded() {
        // if ($('#facetedSearch').length > 0) {
        //     this.initFacetedSearch();
        // } else {
        //     this.onSortBySubmit = this.onSortBySubmit.bind(this);
        //     hooks.on('sortBy-submitted', this.onSortBySubmit);
        // }
        this.showMoreProducts();
    }
    // initFacetedSearch() {
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
    showMoreProducts() {
        $('.pagination-link').on('click', (event) => {
            console.log('hi')
    });
    }
}