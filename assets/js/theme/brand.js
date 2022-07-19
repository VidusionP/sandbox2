import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import $ from 'jquery';
import FacetedSearch from './common/faceted-search';

export default class Brand extends CatalogPage {
    loaded() {
        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }
        this.showMoreProducts();

    }

    initFacetedSearch() {
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const productsPerPage = this.context.brandProductsPerPage;
        const requestOptions = {
            template: {
                productListing: 'brand/product-listing',
                sidebar: 'brand/sidebar',
            },
            config: {
                shop_by_brand: true,
                brand: {
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            showMore: 'brand/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);
            this.showMoreProducts();
            $('html, body').animate({
                scrollTop: 0,
            }, 100);
        });
    }
    showMoreProducts() {
        const context = this.context;
        console.log('hi')

        $('#listing-showmoreBtn').on('click', (event) => {
            event.preventDefault();
            console.log('hi')
            var nextPage = $(".pagination-item--current").next(),
                link = nextPage.find("a").attr("href");

            $('#listing-showmoreBtn').addClass('loading');

            $.ajax({
                type: 'get',
                url: link.replace("http://", "//"),
                success: function(data) {
                    if ($(data).find('#product-listing-container .productGrid').length > 0) {
                        $('#product-listing-container .productGrid').append($(data).find('#product-listing-container .productGrid').children());

                        $('.pagination-list').html($(data).find(".pagination-list").html());

                        $('#listing-showmoreBtn').removeClass('loading').blur();

                        if (Number($(data).find('.pagination-info .end').text()) <= Number($(data).find('.pagination-info .total').text())) {
                            $('.pagination .pagination-info .end').text($(data).find('.pagination-info .end').text());
                        } else {
                            $('.pagination .pagination-info .end').text($(data).find('.pagination-info .total').text());
                        }

                        nextPage = $(".pagination-item--current").next();

                        if (nextPage.length === 0) {
                            $('#listing-showmoreBtn').addClass('disable').text('No more products');
                        }

                        if($(data).find('#product-listing-container .product').length > 0){
                            haloAddOptionForProduct(context, 'product-listing-container');
                        }
                    }
                }
            });
        });
    }
}
