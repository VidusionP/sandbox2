import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.reveal';
import ImageGallery from '../product/image-gallery';
import modalFactory from '../global/modal';
import _ from 'lodash';
import swal from 'sweetalert2';

export default class ProductDetails {
    constructor($scope, context, productAttributesData = {}) {
        this.$overlay = $('[data-cart-item-add] .loadingOverlay');
        this.$scope = $scope;
        this.context = context;
        this.imageGallery = new ImageGallery($('[data-image-gallery]', this.$scope));
        this.imageGallery.init();
        this.listenQuantityChange();
        this.initRadioAttributes();
        this.$hasSoldOut = false;
        this.$pSKUList = [];
        this.$poSKUList = [];
        this.$pCurrent = null;
        this.$allureException = ['coco', 'rose', 'adele', 'angelina', 'jessica', 'selena', 'taylor', 'julia', 'nicole', 'gwyneth', 'ev7914', 'tl6814', 'ev5714', 'mo5514', 'mo7608', 'ev5512', 'ev5706', 'ev6810', 'eg6612', 'eh16', 'mh2206', 'sh5206', 'ep3608', 'mh2216', 'maya', 'noya'];

        const $form = $('form[data-cart-item-add]', $scope);
        const $productOptionsElement = $('[data-product-option-change]', $form);
        const hasOptions = $productOptionsElement.html()?$productOptionsElement.html().trim().length:0;

        $productOptionsElement.change(event => {
            this.productOptionsChanged(event);
        });

        $form.submit(event => {
            this.addProductToCart(event, $form[0]);
        });

        // Update product attributes. If we're in quick view and the product has options,
        // then also update the initial view in case items are oos
        if (_.isEmpty(productAttributesData) && hasOptions) {
            const $productId = $('[name="product_id"]', $form).val();

            utils.api.productAttributes.optionChange($productId, $form.serialize(), (err, response) => {
                const attributesData = response.data || {};

                this.updateProductAttributes(attributesData);
                this.updateView(attributesData);
                this.getDeliverList(attributesData);
            });
        } else {
            // this.updateProductAttributes(productAttributesData);
            this.initProductAttributes(productAttributesData);
            this.getDeliverList(productAttributesData);
            if (this.$hasSoldOut) {
                // $(".btn-book").show();
                $(".btn-book-more").show();
            }
        }

        $productOptionsElement.show();

        this.previewModal = modalFactory('#previewModal')[0];
    }

    /**
     * Since $productView can be dynamically inserted using render_with,
     * We have to retrieve the respective elements
     *
     * @param $scope
     */
    getViewModel($scope) {
        return {
            $priceWithTax: $('[data-product-price-with-tax]', $scope),
            $rrpWithTax: $('[data-product-rrp-with-tax]', $scope),
            $priceWithoutTax: $('[data-product-price-without-tax]', $scope),
            $rrpWithoutTax: $('[data-product-rrp-without-tax]', $scope),
            $weight: $('.productView-info [data-product-weight]', $scope),
            $increments: $('.form-field--increments :input', $scope),
            $addToCart: $('#form-action-addToCart', $scope),
            $wishlistVariation: $('[data-wishlist-add] [name="variation_id"]', $scope),
            stock: {
                $container: $('.form-field--stock', $scope),
                $input: $('[data-product-stock]', $scope),
            },
            $sku: $('[data-product-sku]'),
            $upc: $('[data-product-upc]'),
            quantity: {
                $text: $('.incrementTotal', $scope),
                $input: $('[name=qty\\[\\]]', $scope),
            },
        };
    }

    /**
     * Checks if the current window is being run inside an iframe
     * @returns {boolean}
     */
    isRunningInIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    /**
     *
     * Handle product options changes
     *
     */
    productOptionsChanged(event) {
        const $changedOption = $(event.target);
        const $form = $changedOption.parents('form');
        const productId = $('[name="product_id"]', $form).val();

        // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
        if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
            return;
        }

        utils.api.productAttributes.optionChange(productId, $form.serialize(), (err, response) => {
            const productAttributesData = response.data || {};

            this.updateProductAttributes(productAttributesData);
            this.updateView(productAttributesData);
            this.updateDeliverTime(productAttributesData);
        });
    }

    showProductImage(image) {
        if (_.isPlainObject(image)) {
            const zoomImageUrl = utils.tools.image.getSrc(
                image.data,
                this.context.themeSettings.zoom_size,
            );

            const mainImageUrl = utils.tools.image.getSrc(
                image.data,
                this.context.themeSettings.product_size,
            );

            this.imageGallery.setAlternateImage({
                mainImageUrl,
                zoomImageUrl,
            });
        } else {
            this.imageGallery.restoreImage();
        }
    }

    /**
     *
     * Handle action when the shopper clicks on + / - for quantity
     *
     */
    listenQuantityChange() {
        this.$scope.on('click', '[data-quantity-change] button', (event) => {
            event.preventDefault();
            const $target = $(event.currentTarget);
            const viewModel = this.getViewModel(this.$scope);
            const $input = viewModel.quantity.$input;
            const quantityMin = parseInt($input.data('quantity-min'), 10);
            const quantityMax = parseInt($input.data('quantity-max'), 10);

            let qty = parseInt($input.val(), 10);

            // If action is incrementing
            if ($target.data('action') === 'inc') {
                // If quantity max option is set
                if (quantityMax > 0) {
                    // Check quantity does not exceed max
                    if ((qty + 1) <= quantityMax) {
                        qty++;
                    }
                } else {
                    qty++;
                }
            } else if (qty > 1) {
                // If quantity min option is set
                if (quantityMin > 0) {
                    // Check quantity does not fall below min
                    if ((qty - 1) >= quantityMin) {
                        qty--;
                    }
                } else {
                    qty--;
                }
            }

            // update hidden input
            viewModel.quantity.$input.val(qty);
            // update text
            viewModel.quantity.$text.text(qty);

            if (this.$pCurrent) {
                this.updateDeliverTime(this.$pCurrent);
            }

        });
    }

    /**
     *
     * Add a product to cart
     *
     */
    addProductToCart(event, form) {
        const $addToCartBtn = $('#form-action-addToCart', $(event.target));
        const originalBtnVal = $addToCartBtn.val();
        const waitMessage = $addToCartBtn.data('waitMessage');

        // Do not do AJAX if browser doesn't support FormData
        if (window.FormData === undefined) {
            return;
        }

        // Prevent default
        event.preventDefault();

        $addToCartBtn
            .val(waitMessage)
            .prop('disabled', true);

        this.$overlay.show();

        // Add item to cart
        utils.api.cart.itemAdd(new FormData(form), (err, response) => {
            const errorMessage = err || response.data.error;

            $addToCartBtn
                .val(originalBtnVal)
                .prop('disabled', false);

            this.$overlay.hide();

            // Guard statement
            if (errorMessage) {
                // Strip the HTML from the error message
                const tmp = document.createElement('DIV');
                tmp.innerHTML = errorMessage;

                return swal({
                    text: tmp.textContent || tmp.innerText,
                    type: 'error',
                });
            }

            // Open preview modal and update content
            if (this.previewModal) {
                this.previewModal.open();

                this.updateCartContent(this.previewModal, response.data.cart_item.hash);
            } else {
                this.$overlay.show();
                // if no modal, redirect to the cart page
                this.redirectTo(response.data.cart_item.cart_url || this.context.urls.cart);
            }
        });
    }

    /**
     * Get cart contents
     *
     * @param {String} cartItemHash
     * @param {Function} onComplete
     */
    getCartContent(cartItemHash, onComplete) {
        const options = {
            template: 'cart/preview',
            params: {
                suggest: cartItemHash,
            },
            config: {
                cart: {
                    suggestions: {
                        limit: 4,
                    },
                },
            },
        };

        utils.api.cart.getContent(options, onComplete);
    }

    /**
     * Redirect to url
     *
     * @param {String} url
     */
    redirectTo(url) {
        if (this.isRunningInIframe() && !window.iframeSdk) {
            window.top.location = url;
        } else {
            window.location = url;
        }
    }

    /**
     * Update cart content
     *
     * @param {Modal} modal
     * @param {String} cartItemHash
     * @param {Function} onComplete
     */
    updateCartContent(modal, cartItemHash, onComplete) {
        this.getCartContent(cartItemHash, (err, response) => {
            if (err) {
                return;
            }

            modal.updateContent(response);

            // Update cart counter
            const $body = $('body');
            const $cartQuantity = $('[data-cart-quantity]', modal.$content);
            const $cartCounter = $('.navUser-action .cart-count');
            const quantity = $cartQuantity.data('cart-quantity') || 0;

            $cartCounter.addClass('cart-count--positive');
            $body.trigger('cart-quantity-update', quantity);

            if (onComplete) {
                onComplete(response);
            }
        });
    }

    /**
     * Show an message box if a message is passed
     * Hide the box if the message is empty
     * @param  {String} message
     */
    showMessageBox(message) {
        const $messageBox = $('.productAttributes-message');

        if (message) {
            $('.alertBox-message', $messageBox).text(message);
            $messageBox.show();
        } else {
            $messageBox.hide();
        }
    }

    /**
     * Update the view of price, messages, SKU and stock options when a product option changes
     * @param  {Object} data Product attribute data
     */
    updatePriceView(viewModel, price) {
        if (price.with_tax) {
            viewModel.$priceWithTax.html(price.with_tax.formatted);
        }

        if (price.without_tax) {
            viewModel.$priceWithoutTax.html(price.without_tax.formatted);
        }

        if (price.rrp_with_tax) {
            viewModel.$rrpWithTax.html(price.rrp_with_tax.formatted);
        }

        if (price.rrp_without_tax) {
            viewModel.$rrpWithoutTax.html(price.rrp_without_tax.formatted);
        }
    }

    /**
     * Update the view of price, messages, SKU and stock options when a product option changes
     * @param  {Object} data Product attribute data
     */
    updateView(data) {
        const viewModel = this.getViewModel(this.$scope);

        this.showMessageBox(data.stock_message || data.purchasing_message);

        if (_.isObject(data.price)) {
            this.updatePriceView(viewModel, data.price);
        }

        if (_.isObject(data.weight)) {
            viewModel.$weight.html(data.weight.formatted);
        }

        // Set variation_id if it exists for adding to wishlist
        if (data.variantId) {
            viewModel.$wishlistVariation.val(data.variantId);
        }

        // If SKU is available
        if (data.sku) {
            viewModel.$sku.text(data.sku);
        }

        // If UPC is available
        if (data.upc) {
            viewModel.$upc.text(data.upc);
        }

        // if stock view is on (CP settings)
        if (viewModel.stock.$container.length && _.isNumber(data.stock)) {
            // if the stock container is hidden, show
            viewModel.stock.$container.removeClass('u-hiddenVisually');

            // viewModel.stock.$input.text(data.stock);
        }

        if (!data.purchasable || !data.instock) {
            viewModel.$addToCart.prop('disabled', true);
            viewModel.$increments.prop('disabled', true);
        } else {
            viewModel.$addToCart.prop('disabled', false);
            viewModel.$increments.prop('disabled', false);
        }
    }
    getIncomingTime(available, inItems, buffer, qty=1, check=false) {
        let i = -1;
        let qPO = available-buffer;        
        while (qPO<qty && i<inItems.length-1) {
            i++;
            qPO+=inItems[i]["Incoming Quantity"];            
        }
        if (qPO>=qty && i<inItems.length) {
            return {
                qPO,
                i
            }
        } else {
            return null;
        }
    }
    setEarliestTimeAllure() {
        let dlTBody = "";
        let nowBtn = false;
        let transferBtn = false;
        let transitBtn = false;                    
        let virtualBtn = [];
        let virtualSBtn = [];
        function monthDiff(d1, d2) {
            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth();
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        }
        function isOdd(num) {
            return num%2;
        }
        for (let td of this.$pSKUList) {
            let qtyNote = "";            
            if (Number(td["Available Quantity"])>0) {
                if (Number(td["Total On Hand"])!=Number(td["Available Quantity"])) {
                    if (transferBtn == false) {
                        transferBtn = true;
                    }
                    qtyNote = Number(td["Available Quantity"])>10?"More than 10":Number(td["Available Quantity"]);
                    dlTBody +=`
                        <div 
                            data-qty-transfer=${Number(td["Available Quantity"])} 
                            data-del-data="Current stock: ${qtyNote}">
                            ${td.SKU.toUpperCase()}
                        </div>
                    `;
                } else {
                    if (td["2"]) {
                        if (nowBtn == false) {
                            nowBtn = true;   
                        }
                        dlTBody +=`
                        <div 
                            data-qty-now=${td["2"]}
                            data-del-data="Qty US: ${Number(td["2"])>10?"More than 10":Number(td["2"])}&#xa;Qty Canada: ${Number(td["WH1"])>10?"More than 10":Number(td["WH1"])}">
                            ${td.SKU.toUpperCase()}
                        </div>
                    `;
                    } else {
                        if (transferBtn == false) {
                            transferBtn = true;
                        }
                        qtyNote = Number(td["WH1"])>10?"More than 10":Number(td["WH1"]);
                        dlTBody +=`
                        <div 
                            data-qty-transfer=${td["WH1"]}
                            data-del-data="Qty US: ${Number(td["2"])>10?"More than 10":Number(td["2"])}&#xa;Qty Canada: ${Number(td["WH1"])>10?"More than 10":Number(td["WH1"])}">
                            ${td.SKU.toUpperCase()}
                        </div>
                    `;
                    }
                }                                                    
            } else if (td["Virtual Location"]) {                                         
                if (td["Lock Status"]!="Locked for processing" && (Number(td["Unlocked for sale quantity"])+Number(td["Available Quantity"]))>0) {
                    if (transitBtn == false) {
                        transitBtn = true;
                    }
                    qtyNote=Number(td["Unlocked for sale quantity"])+Number(td["Available Quantity"])>10?"More than 10":Number(td["Unlocked for sale quantity"])+Number(td["Available Quantity"]);
                    dlTBody +=`
                        <div                                 
                            data-qty-transit=${td["Lock Status"]!="Locked for processing" && (Number(td["Unlocked for sale quantity"])+Number(td["Available Quantity"]))>0?Number(td["Unlocked for sale quantity"])+Number(td["Available Quantity"]):0}                                         
                            data-del-data="Qty in transit: ${qtyNote}">
                            ${td.SKU.toUpperCase()}
                        </div>`;
                } else if (Number(td["Quantity Incoming"])+Number(td["Available Quantity"])-2>0) {                         
                    let inItems = this.$poSKUList.filter(p=>p.SKU.toUpperCase()==td["SKU"].toUpperCase());
                    if (inItems.length>0) {
                        let cPO = this.getIncomingTime(Number(td["Available Quantity"]), inItems, 2);                                    
                        if (cPO) {
                            let inItem = inItems[cPO.i];
                            let today = new Date();
                            let arrival = new Date(inItem["Arrival Due Date"]);
                            let mDiff = monthDiff(new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()), new Date(arrival.getUTCFullYear(), arrival.getUTCMonth(), arrival.getUTCDate()));
                            if (mDiff<=0) {                                            
                                let vIdx = virtualBtn.findIndex(v=>v.name=="4M");
                                if (vIdx==-1) {
                                    virtualBtn.push({
                                        name: "4M",
                                        duration:"4",
                                        section: "production"
                                    });
                                } else if (virtualBtn[vIdx].section=="preorder") {
                                    virtualBtn[vIdx].section="combination";
                                }
                                qtyNote=cPO.qPO>10?"More than 10":cPO.qPO;
                                dlTBody +=`
                                    <div                                 
                                        data-qty-4M=${cPO.qPO} 
                                        data-del-data="Qty in production: ${qtyNote}">
                                        ${td.SKU.toUpperCase()}
                                    </div>
                                `;
                            } else {                                
                                mDiff = Number(mDiff) + 2;                                
                                if (isOdd(mDiff) && mDiff<7) {
                                    mDiff+=1;
                                }
                                let vIdx = virtualBtn.findIndex(v=>v.name==`${mDiff}M`);
                                if (vIdx==-1) {
                                    virtualBtn.push({
                                        name: `${mDiff}M`,
                                        duration: mDiff,
                                        section: "production"
                                    });
                                } else if (virtualBtn[vIdx].section=="preorder") {
                                    virtualBtn[vIdx].section="combination";
                                }
                                qtyNote=cPO.qPO>10?"More than 10":cPO.qPO;
                                dlTBody +=`
                                    <div                                 
                                        data-qty-${mDiff}M=${cPO.qPO} 
                                        data-del-data="Qty in production: ${qtyNote}">
                                        ${td.SKU.toUpperCase()}
                                    </div>
                                `;
                            }
                        }                                    
                    }                                                                
                } else {
                    if (td["Virtual Location"].includes("_")) {
                        virtualSBtn.push(td["Virtual Location"]);
                        qtyNote = Number(td["Virtual Quantity"])+Number(td["Available Quantity"])>10?"More than 10":Number(td["Virtual Quantity"])+Number(td["Available Quantity"]);
                        dlTBody +=`
                            <div                                 
                                ${td["Virtual Quantity"]?`data-qty-${td["Virtual Location"]}=${Number(td["Virtual Quantity"])+Number(td["Available Quantity"])}`:""}
                                data-del-data="Allowed Pre-order: ${qtyNote}">
                                ${td.SKU.toUpperCase()}
                            </div>
                        `;   
                    } else {
                        let m = Number(td["Virtual Location"][0]);
                        if (isOdd(Number(m)) && Number(m)<7) {
                            m=Number(m)+1;
                        }
                        m = `${m}M`;
                        let vIdx = virtualBtn.findIndex(v=>v.name==m);
                        if (vIdx==-1) {
                            virtualBtn.push({
                                name: m,
                                duration: m.replace("M",""),
                                section: "preorder"
                            });
                        } else if (virtualBtn[vIdx].section=="production") {
                            virtualBtn[vIdx].section="combination";
                        }
                        qtyNote = Number(td["Virtual Quantity"])+Number(td["Available Quantity"])>10?"More than 10":Number(td["Virtual Quantity"])+Number(td["Available Quantity"]);
                        dlTBody +=`
                            <div                                 
                                ${td["Virtual Quantity"]?`data-qty-${m}=${Number(td["Virtual Quantity"])+Number(td["Available Quantity"])}`:""}
                                data-del-data="Allowed Pre-order: ${qtyNote}">
                                ${td.SKU.toUpperCase()}
                            </div>
                        `;   
                    }                                    
                }                            
            }
        }
        let btnWrap = "";
        let selectWrap = "<select>";
        if (nowBtn) {
            btnWrap+=`<input type="radio" id="del-time-now" value="now" name="delOption" class="del-input" data-desp="These units are in stock and can be shipped out as soon as possible."><label for="del-time-now" class="del-label">1 day</label>`;
            selectWrap+=`<option value="now" data-desp="These units are in stock and can be shipped out as soon as possible.">1 day</option>`;
        }
        if (transferBtn) {
            btnWrap+=`<input type="radio" id="del-time-transfer" value="transfer" name="delOption" class="del-input" data-desp="These units are in stock and can be shipped out as soon as possible."><label for="del-time-transfer" class="del-label">2-4 days</label>`;
            selectWrap+=`<option value="transfer" data-desp="These units are in stock and can be shipped out as soon as possible.">2-4 days</option>`;
        }
        if (transitBtn) {
            btnWrap+=`<input type="radio" id="del-time-transit" value="transit" name="delOption" class="del-input" data-desp="These units are in transit to our warehouses and can be shipped out in a few days."><label for="del-time-transit" class="del-label">5-7 days</label>`;
            selectWrap+=`<option value="transit" data-desp="These units are in transit to our warehouses and can be shipped out in a few days.">5-7 days</option>`;
        }
        // console.log(virtualBtn);
        if (virtualBtn.length>0) {
            virtualBtn.sort((a,b)=> (Number(a.duration)>Number(b.duration))?1:((Number(b.duration)>Number(a.duration))?-1:0));
            // console.log(virtualBtn);
            for (let v of virtualBtn) {
                // let lb = v[0]>1?v.replace("M"," months").replace("_","-"):v.replace("M"," month").replace("_","-");
                let lb = v.duration<7?(Number(v.duration)-1)+"-"+v.name.replace("M"," months"):v.name.replace("M"," months");
                let desp = v.section=="production"?"These units are still in production. Once they are complete, they will be in transit to our warehouses ready to be shipped out.":(v.section=="preorder"?"These units are not in production and will start once an order is placed.":"These units are either in production or yet to start production. However, they are expected to be ship out in the same timeframe.");
                btnWrap+=`<input type="radio" id="del-time-virtual-${v.name}" value="${v.name.toLowerCase()}" name="delOption" class="del-input" data-desp="${desp}"><label for="del-time-virtual-${v.name}" class="del-label">${lb}</label>`;
                selectWrap+=`<option value="${v.name.toLowerCase()}" data-desp="${desp}">${lb}</option>`;
            }
        }
        if (virtualSBtn.length>0) {
            for (let v of virtualSBtn) {                                
                let lb = v.replace("M"," months").replace("_","-");
                let desp = "These units are not in production and will start once an order is placed.";
                btnWrap+=`<input type="radio" id="del-time-virtual-${v}" value="${v.toLowerCase()}" name="delOption" class="del-input" data-desp="${desp}"><label for="del-time-virtual-${v}" class="del-label">${lb}</label>`;
                selectWrap+=`<option value="${v.toLowerCase()}" data-desp="${desp}">${lb}</option>`;
            }
        }
        selectWrap+="</select>";     
        // console.log(btnWrap);               
        $(".delivery-wrap").append(`<div class="del-btn-wrap">${btnWrap}</div><div class="del-select-wrap">${selectWrap}</div><div class="del-content-wrap del-content-hidden">${dlTBody}</div>`).show();
        if ($(document).width()<800) {
            $(".delivery-wrap").insertAfter(".productView-images");
        }
        $("input[type=radio][name=delOption], .del-select-wrap select").on("change", function() {                        
            $("[data-del-data]").hide();
            let val = $(this).val();                                                
            $("[data-del-data]").filter(function(){                                                                                        
                return Number(this.getAttribute(`data-qty-${val}`))>0;
            }).show();
            if ($(".del-content-wrap").hasClass("del-content-hidden")) {
                $(".del-content-see-more").remove();
                $(".data-del-hidden").removeClass("data-del-hidden");
                if ($("[data-del-data]:visible").length>12) {
                    $("[data-del-data]:visible").slice(12).addClass("data-del-hidden");
                    $(".delivery-wrap").append(`<div class="del-content-see-more"><svg viewBox="0 0 290.81 166.95"> <g transform="translate(-97.205 -134.48)"> <circle cx="241.37" cy="169.48" r="35" stroke-linejoin="round" stroke-width="6.366"/> <path d="m240.86 260.32 116.89-87.021c19.801-6.8507 34.711 12.938 23.379 29.873l-118.63 87.887c-11.885 6.5266-23.938 12.667-43.727 0l-115.6-90.918c-10.587-14.716 9.071-35.411 24.245-26.409z" fill="none" stroke="#000" stroke-width="6"/> </g></svg></div>`);
                    $(".del-content-see-more").on("click", function() {
                        $(".data-del-hidden").removeClass("data-del-hidden");
                        $(".del-content-see-more").remove();
                        $(".del-content-wrap").removeClass("del-content-hidden")
                    })
                }
            }                            
        });                    
        $("input[type=radio][name=delOption]").eq(0).prop("checked", true).trigger("change");
        window.addEventListener("resize", function() {
            if ($(document).width()<800) {                            
                // if ($(document).width()<500 && $(document).width()>400) {                                
                //     $(".del-select-wrap select").val($(".del-select-wrap select option:first").val());
                //     $("input[type=radio][name=delOption]").eq(0).prop("checked", true).trigger("change");
                // }
                $(".delivery-wrap").insertAfter(".productView-images");
            } else {                            
                $(".productView-details").eq(1).after($(".delivery-wrap"));
            }
        })
    }
    setEarliestTimeNoAllure() {
        let dlTBody = "";
        let nowBtn = false;
        let transferBtn = false;
        let transitBtn = false;                    
        let virtualBtn = [];
        let virtualSBtn = [];
        function monthDiff(d1, d2) {
            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth();
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        }
        function isOdd(num) {
            return num%2;
        }
        for (let td of this.$pSKUList) {
            let qtyNote = "";
            if (Number(td["Available Quantity"])>0) {
                if (td["Available Quantity"] != td["Total On Hand"]) {
                    if (transferBtn == false) {
                        transferBtn = true;
                    }
                    qtyNote = Number(td["Available Quantity"])>10?"More than 10":Number(td["Available Quantity"]);
                    dlTBody +=`
                        <div 
                            data-qty-transfer=${Number(td["Available Quantity"])} 
                            data-del-data="Current stock: ${qtyNote}">
                            ${td.SKU.toUpperCase()}
                        </div>
                    `;
                } else {
                    if (td["2"]) {
                        if (nowBtn == false) {
                            nowBtn = true;   
                        }
                        dlTBody +=`
                        <div 
                            data-qty-now=${td["2"]}
                            data-del-data="Qty US: ${Number(td["2"])>10?"More than 10":Number(td["2"])}&#xa;Qty Canada: ${Number(td["WH1"])>10?"More than 10":Number(td["WH1"])}">
                            ${td.SKU.toUpperCase()}
                        </div>
                    `;
                    } else {
                        if (transferBtn == false) {
                            transferBtn = true;
                        }
                        qtyNote = Number(td["WH1"])>10?"More than 10":Number(td["WH1"]);
                        dlTBody +=`
                        <div 
                            data-qty-transfer=${td["WH1"]}
                            data-del-data="Qty US: ${Number(td["2"])>10?"More than 10":Number(td["2"])}&#xa;Qty Canada: ${Number(td["WH1"])>10?"More than 10":Number(td["WH1"])}">
                            ${td.SKU.toUpperCase()}
                        </div>
                    `;
                    }
                }                                                    
            } else if (td["Virtual Location"]) {                                
                if (td["Lock Status"]!="Locked for processing" && (Number(td["Unlocked for sale quantity"])+Number(td["Available Quantity"]))>0) {
                    if (transitBtn == false) {
                        transitBtn = true;
                    }
                    qtyNote=Number(td["Unlocked for sale quantity"])+Number(td["Available Quantity"])>10?"More than 10":Number(td["Unlocked for sale quantity"])+Number(td["Available Quantity"]);
                    dlTBody +=`
                        <div                                 
                            data-qty-transit=${td["Lock Status"]!="Locked for processing" && (Number(td["Unlocked for sale quantity"])+Number(td["Available Quantity"]))>0?Number(td["Unlocked for sale quantity"])+Number(td["Available Quantity"]):0}                                         
                            data-del-data="Qty in transit: ${qtyNote}">
                            ${td.SKU.toUpperCase()}
                        </div>`;
                } else if (Number(td["Quantity Incoming"])+Number(td["Available Quantity"])-2>0) {                                    
                    let inItems = this.$poSKUList.filter(p=>p.SKU.toUpperCase()==td["SKU"].toUpperCase());
                    if (inItems.length>0) {
                        let cPO = this.getIncomingTime(Number(td["Available Quantity"]), inItems, 2);                                    
                        if (cPO) {
                            let inItem = inItems[cPO.i];
                            let today = new Date();
                            let arrival = new Date(inItem["Arrival Due Date"]);
                            let mDiff = monthDiff(new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()), new Date(arrival.getUTCFullYear(), arrival.getUTCMonth(), arrival.getUTCDate()));
                            if (mDiff<=0) {                                            
                                let vIdx = virtualBtn.findIndex(v=>v.name=="2M");
                                if (vIdx==-1) {
                                    virtualBtn.push({
                                        name: "2M",
                                        section: "production"
                                    });
                                } else if (virtualBtn[vIdx].section=="preorder") {
                                    virtualBtn[vIdx].section="combination";
                                }
                                qtyNote=cPO.qPO>10?"More than 10":cPO.qPO;
                                dlTBody +=`
                                    <div                                 
                                        data-qty-2M=${cPO.qPO} 
                                        data-del-data="Qty in production: ${qtyNote}">
                                        ${td.SKU.toUpperCase()}
                                    </div>
                                `;
                            } else {
                                if (isOdd(mDiff) && mDiff<7) {
                                    mDiff+=1;
                                }
                                let vIdx = virtualBtn.findIndex(v=>v.name==`${mDiff}M`);
                                if (vIdx==-1) {
                                    virtualBtn.push({
                                        name: `${mDiff}M`,
                                        section: "production"
                                    });
                                } else if (virtualBtn[vIdx].section=="preorder") {
                                    virtualBtn[vIdx].section="combination";
                                }
                                qtyNote=cPO.qPO>10?"More than 10":cPO.qPO;
                                dlTBody +=`
                                    <div                                 
                                        data-qty-${mDiff}M=${cPO.qPO} 
                                        data-del-data="Qty in production: ${qtyNote}">
                                        ${td.SKU.toUpperCase()}
                                    </div>
                                `;
                            }
                        }                                    
                    }                                                                
                } else {
                    if (td["Virtual Location"].includes("_")) {
                        virtualSBtn.push(td["Virtual Location"]);
                        qtyNote = Number(td["Virtual Quantity"])+Number(td["Available Quantity"])>10?"More than 10":Number(td["Virtual Quantity"])+Number(td["Available Quantity"]);
                        dlTBody +=`
                            <div                                 
                                ${td["Virtual Quantity"]?`data-qty-${td["Virtual Location"]}=${Number(td["Virtual Quantity"])+Number(td["Available Quantity"])}`:""}
                                data-del-data="Allowed Pre-order: ${qtyNote}">
                                ${td.SKU.toUpperCase()}
                            </div>
                        `;   
                    } else {
                        let m = td["Virtual Location"][0];
                        if (isOdd(Number(m)) && Number(m)<7) {
                            m=Number(m)+1;
                        }
                        m = `${m}M`;
                        let vIdx = virtualBtn.findIndex(v=>v.name==m);
                        if (vIdx==-1) {
                            virtualBtn.push({
                                name: m,
                                section: "preorder"
                            });
                        } else if (virtualBtn[vIdx].section=="production") {
                            virtualBtn[vIdx].section="combination";
                        }
                        qtyNote = Number(td["Virtual Quantity"])+Number(td["Available Quantity"])>10?"More than 10":Number(td["Virtual Quantity"])+Number(td["Available Quantity"]);
                        dlTBody +=`
                            <div                                 
                                ${td["Virtual Quantity"]?`data-qty-${m}=${Number(td["Virtual Quantity"])+Number(td["Available Quantity"])}`:""}
                                data-del-data="Allowed Pre-order: ${qtyNote}">
                                ${td.SKU.toUpperCase()}
                            </div>
                        `;   
                    }                                    
                }                            
            }
        }
        let btnWrap = "";
        let selectWrap = "<select>";
        if (nowBtn) {
            btnWrap+=`<input type="radio" id="del-time-now" value="now" name="delOption" class="del-input" data-desp="These units are in stock and can be shipped out as soon as possible."><label for="del-time-now" class="del-label">1 day</label>`;
            selectWrap+=`<option value="now" data-desp="These units are in stock and can be shipped out as soon as possible.">1 day</option>`;
        }
        if (transferBtn) {
            btnWrap+=`<input type="radio" id="del-time-transfer" value="transfer" name="delOption" class="del-input" data-desp="These units are in stock and can be shipped out as soon as possible."><label for="del-time-transfer" class="del-label">2-4 days</label>`;
            selectWrap+=`<option value="transfer" data-desp="These units are in stock and can be shipped out as soon as possible.">2-4 days</option>`;
        }
        if (transitBtn) {
            btnWrap+=`<input type="radio" id="del-time-transit" value="transit" name="delOption" class="del-input" data-desp="These units are in transit to our warehouses and can be shipped out in a few days."><label for="del-time-transit" class="del-label">5-7 days</label>`;
            selectWrap+=`<option value="transit" data-desp="These units are in transit to our warehouses and can be shipped out in a few days.">5-7 days</option>`;
        }
        // console.log(virtualBtn);
        if (virtualBtn.length>0) {
            virtualBtn.sort((a,b)=> (a.name>b.name)?1:((b.name>a.name)?-1:0));
            for (let v of virtualBtn) {
                // let lb = v[0]>1?v.replace("M"," months").replace("_","-"):v.replace("M"," month").replace("_","-");
                let lb = v.name[0]<7?(Number(v.name[0])-1)+"-"+v.name.replace("M"," months").replace("_","-"):v.name.replace("M"," months").replace("_","-");
                let desp = v.section=="production"?"These units are still in production. Once they are complete, they will be in transit to our warehouses ready to be shipped out.":(v.section=="preorder"?"These units are not in production and will start once an order is placed.":"These units are either in production or yet to start production. However, they are expected to be ship out in the same timeframe.");
                btnWrap+=`<input type="radio" id="del-time-virtual-${v.name}" value="${v.name.toLowerCase()}" name="delOption" class="del-input" data-desp="${desp}"><label for="del-time-virtual-${v.name}" class="del-label">${lb}</label>`;
                selectWrap+=`<option value="${v.name.toLowerCase()}" data-desp="${desp}">${lb}</option>`;
            }
        }
        if (virtualSBtn.length>0) {
            for (let v of virtualSBtn) {                                
                let lb = v.replace("M"," months").replace("_","-");
                let desp = "These units are not in production and will start once an order is placed.";
                btnWrap+=`<input type="radio" id="del-time-virtual-${v}" value="${v.toLowerCase()}" name="delOption" class="del-input" data-desp="${desp}"><label for="del-time-virtual-${v}" class="del-label">${lb}</label>`;
                selectWrap+=`<option value="${v.toLowerCase()}" data-desp="${desp}">${lb}</option>`;
            }
        }
        selectWrap+="</select>";     
        // console.log(btnWrap);               
        $(".delivery-wrap").append(`<div class="del-btn-wrap">${btnWrap}</div><div class="del-select-wrap">${selectWrap}</div><div class="del-content-wrap del-content-hidden">${dlTBody}</div>`).show();
        if ($(document).width()<800) {
            $(".delivery-wrap").insertAfter(".productView-images");
        }
        $("input[type=radio][name=delOption], .del-select-wrap select").on("change", function() {                        
            $("[data-del-data]").hide();
            let val = $(this).val();                                                
            $("[data-del-data]").filter(function(){                                                                                        
                return Number(this.getAttribute(`data-qty-${val}`))>0;
            }).show();
            if ($(".del-content-wrap").hasClass("del-content-hidden")) {
                $(".del-content-see-more").remove();
                $(".data-del-hidden").removeClass("data-del-hidden");
                if ($("[data-del-data]:visible").length>12) {
                    $("[data-del-data]:visible").slice(12).addClass("data-del-hidden");
                    $(".delivery-wrap").append(`<div class="del-content-see-more"><svg viewBox="0 0 290.81 166.95"> <g transform="translate(-97.205 -134.48)"> <circle cx="241.37" cy="169.48" r="35" stroke-linejoin="round" stroke-width="6.366"/> <path d="m240.86 260.32 116.89-87.021c19.801-6.8507 34.711 12.938 23.379 29.873l-118.63 87.887c-11.885 6.5266-23.938 12.667-43.727 0l-115.6-90.918c-10.587-14.716 9.071-35.411 24.245-26.409z" fill="none" stroke="#000" stroke-width="6"/> </g></svg></div>`);
                    $(".del-content-see-more").on("click", function() {
                        $(".data-del-hidden").removeClass("data-del-hidden");
                        $(".del-content-see-more").remove();
                        $(".del-content-wrap").removeClass("del-content-hidden")
                    })
                }
            }                            
        });                    
        $("input[type=radio][name=delOption]").eq(0).prop("checked", true).trigger("change");
        window.addEventListener("resize", function() {
            if ($(document).width()<800) {                            
                // if ($(document).width()<500 && $(document).width()>400) {                                
                //     $(".del-select-wrap select").val($(".del-select-wrap select option:first").val());
                //     $("input[type=radio][name=delOption]").eq(0).prop("checked", true).trigger("change");
                // }
                $(".delivery-wrap").insertAfter(".productView-images");
            } else {                            
                $(".productView-details").eq(1).after($(".delivery-wrap"));
            }
        })
    }
    getDeliverList(data) {        
        if (data.sku) {
            this.$pCurrent = data;
            fetch(`https://shp-webserver.glitch.me/get-teamdesk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    table: 'Inventory',
                    filter: encodeURIComponent(`Any([Part Number],'${data.sku}')`)
                })
            })
            .then(r=>r.json())
            .then(d=> {
                // console.log(d);                                
                if (d.length>0) {
                    this.$pSKUList = d;                    
                } else if (data.stock) {
                    this.$pSKUList = [];
                    $('[data-product-stock]').text(data.stock);
                    $('[data-stock-label]').css({"display": "inline-block"});
                }

                fetch(`https://shp-webserver.glitch.me/get-teamdesk`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        table: 't_763479',
                        options: `?filter=Any([Part Number],'${encodeURIComponent(data.sku)}') and [Incoming Quantity]>0 and [Arrival Due Date]>ToDate('1/1/1')&sort=Arrival Due Date//ASC`                        
                    })
                })
                .then(r=>r.json())
                .then(d=> {
                    // console.log(d);
                    if (d.length>0) {
                        this.$poSKUList = d;
                    }
                    if (this.$pSKUList.length>0) {
                        // console.log(this.$pSKUList);
                        if (this.$allureException.includes(this.$pSKUList[0]["Part Number"].toLowerCase())==false) {
                            this.setEarliestTimeNoAllure();
                        } else {
                            this.setEarliestTimeAllure();
                        }
                    }
                })
                .catch(e=> {
                    console.log(e);                
                })
            })
            .catch(e=> {
                console.log(e);
                if (data.stock) {
                    this.$pSKUList = [];
                    $('[data-product-stock]').text(data.stock);
                    $('[data-stock-label]').css({"display": "inline-block"});
                }
            });  
        }
    }
    getTeamdeskInventoryBySKU(data) {        
        if (data.sku) {            
            fetch(`//shp-webserver.glitch.me/get-teamdesk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    table: 'Inventory',
                    filter: encodeURIComponent(`Any([SKU],'${data.sku}')`)
                })
            })
            .then(r=>r.json())
            .then(d=> {                       
                if (d.length>0) {                    
                    this.updateDeliverTime(data, d);
                } else if (data.stock) {
                    $('[data-product-stock]').text(data.stock);
                    $('[data-stock-label]').css({"display": "inline-block"});
                }
            })
            .catch(e=>{
                console.log(e);
                if (data.stock) {
                    $('[data-product-stock]').text(data.stock);
                    $('[data-stock-label]').css({"display": "inline-block"});
                }
            });
        }
    }
    updateDeliverLabelWithPending(item) {
        let qty = Number($("[id='qty[]']").val());
        if (Number(item["Available Quantity"]) >= qty) {
            $("input#form-action-addToCart").attr("disabled", false);
            $("input#form-action-addToCart").attr("readonly", false);
            $("input#form-action-addToCart").val("Add to Cart");
            $(".productView-details").find(".form-field.form-field--increments").eq(0).before('<div class="productView-deliver" style="font-weight: bold;">Expect to ship out 1 - 3 days later</div>');
        } else if (item["Virtual Location"]) {
            if (Number(item["Available Quantity"]) > 0) {
                $("input#form-action-addToCart").attr("disabled", true);
                $("input#form-action-addToCart").attr("readonly", true);
                $("input#form-action-addToCart").val("Over Sold");
            } else {
                $("input#form-action-addToCart").attr("disabled", false);
                $("input#form-action-addToCart").attr("readonly", false);
                $("input#form-action-addToCart").val("Add to Cart");
                if (item["Lock Status"]!="Locked for processing" && (Number(item["Available Quantity"])+Number(item["Unlocked for sale quantity"]))>=qty) {
                    $(".productView-details").find(".form-field.form-field--increments").eq(0).before(`<div class="productView-deliver" style="font-weight: bold;">Expect to ship out 1 week later</div>`); 
                } else {
                    let regex = /[1-9_]+M/g;
                    let t = item["Virtual Location"].match(regex);
                    if (t.length>0) {
                        t = t[0].substring(0,t[0].length-1);
                        if (t.length>0) {
                            if (t>1) {
                                $(".productView-details").find(".form-field.form-field--increments").eq(0).before(`<div class="productView-deliver" style="font-weight: bold;">Shipping could take up to ${t.replace('_','-')} month${t>1?'s':''}</div>`); 
                            } else {
                                $(".productView-details").find(".form-field.form-field--increments").eq(0).before(`<div class="productView-deliver" style="font-weight: bold;">Expect to ship out ${t.replace('_','-')} month${t>1?'s':''} later</div>`); 
                            }
                        }
                    }
                }
            }
        }
        let ip = [];
        if (Number(item["Available Quantity"]) > 0) {
            if (Number(item["Available Quantity"])>10) {
                ip.push(`Current stock: More than 10`);
            } else if (Number(item["Available Quantity"])>0) {
                ip.push(`Curent stock: ${Number(item["Available Quantity"])}`);
            }            
        } else {
            if (item["Virtual Location"]) {
                if (item["Lock Status"]!="Locked for processing" && (Number(item["Available Quantity"])+Number(item["Unlocked for sale quantity"]))>=qty) {
                    ip.push(`In transit: ${Number(item["Available Quantity"])+Number(item["Unlocked for sale quantity"])}`);
                } else if (Number(item["Available Quantity"])+Number(item["Quantity Incoming"])-2 >= qty){
                    // console.log(this.$poSKUList);
                    // console.log("incoming");
                    let inItems = this.$poSKUList.filter(po=>po.SKU.toUpperCase() == item["SKU"].toUpperCase());                    
                    if (inItems.length>0) {
                        let cPO = this.getIncomingTime(Number(item["Available Quantity"]), inItems, 2, qty);                        
                        if (cPO) {
                            let inItem = inItems[cPO.i];
                            let date = new Date(inItem["Arrival Due Date"]);                             
                            date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                            if (new Date() > date) {
                                if (this.$allureException.includes(inItem["Part Number"].toLowerCase())) {                                    
                                    // date.setMonth(new Date().getMonth()+2);
                                    date = new Date();
                                    date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                                    date.setMonth(date.getMonth()+3);
                                } else {                                    
                                    // date.setMonth(new Date().getMonth()+1);
                                    date = new Date();
                                    date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                                    date.setMonth(date.getMonth()+1);
                                }
                            } else if (this.$allureException.includes(inItem["Part Number"].toLowerCase())) {
                                date.setMonth(date.getMonth()+2);
                            }
                            const options = {year: 'numeric', month: 'long'};
                            ip.push(`In production: ${cPO.qPO}`);
                            $(".productView-deliver").html(`Expect to ship out in ${date.toLocaleDateString('en-US', options)}`);
                        }                        
                    }
                }
                if (Number(item["Virtual Quantity"])-Number(item["Total On Hand"]) + Number(item["Available Quantity"])>10) {
                    ip.push(`Allowed Pre-order: More than 10`);
                } else {
                    ip.push(`Allowed Pre-order: ${Number(item["Virtual Quantity"])-Number(item["Total On Hand"])+Number(item["Available Quantity"])}`);
                }
            }            
        }
        if (ip.length>0) {
            ip = ['Quantity:',...ip];
        }
        $('[data-product-stock]').html(ip.join('<br/>'));
        $('[data-stock-label]').css({"display": "none"});
        $(".productView-deliver").after("<span class='productView-tooltip'></span><span class='productView-tooltip-text'>This is an estimate. We are getting shipments weekly so you can receive your order quicker.</span>");
    }
    updateDeliverLabel(item) {
        let qty = Number($("[id='qty[]']").val());
        if (Number(item["Quantity USA"])>=qty) {
            $("input#form-action-addToCart").attr("disabled", false);
            $("input#form-action-addToCart").attr("readonly", false);
            $("input#form-action-addToCart").val("Add to Cart");
            $(".productView-details").find(".form-field.form-field--increments").eq(0).before('<div class="productView-deliver" style="font-weight: bold;">Expect to ship out immediately</div>');
        } else if (Number(item["Quantity USA"]) + Number(item["Quantity Canada"]) >= qty) {
            $("input#form-action-addToCart").attr("disabled", false);
            $("input#form-action-addToCart").attr("readonly", false);
            $("input#form-action-addToCart").val("Add to Cart");
            $(".productView-details").find(".form-field.form-field--increments").eq(0).before('<div class="productView-deliver" style="font-weight: bold;">Warehouse transfer, expect ship out 2-4 days later</div>');
        } else if (item["Virtual Location"]) {
            if (Number(item["Quantity Canada"])>0 || Number(item["Quantity USA"])>0) {
                $("input#form-action-addToCart").attr("disabled", true);
                $("input#form-action-addToCart").attr("readonly", true);
                $("input#form-action-addToCart").val("Over Sold");
            } else {
                $("input#form-action-addToCart").attr("disabled", false);
                $("input#form-action-addToCart").attr("readonly", false);
                $("input#form-action-addToCart").val("Add to Cart");
                if (item["Lock Status"]!="Locked for processing" && Number(item["Unlocked for sale quantity"])>=qty) {
                    $(".productView-details").find(".form-field.form-field--increments").eq(0).before(`<div class="productView-deliver" style="font-weight: bold;">Expect to ship out 1 week later</div>`); 
                } else {
                    let regex = /[1-9_]+M/g;
                    let t = item["Virtual Location"].match(regex);
                    if (t.length>0) {
                        t = t[0].substring(0,t[0].length-1);
                        if (t.length>0) {
                            if (t>1) {
                                $(".productView-details").find(".form-field.form-field--increments").eq(0).before(`<div class="productView-deliver" style="font-weight: bold;">Shipping could take up to ${t.replace('_','-')} month${t>1?'s':''}</div>`); 
                            } else {
                                $(".productView-details").find(".form-field.form-field--increments").eq(0).before(`<div class="productView-deliver" style="font-weight: bold;">Expect to ship out ${t.replace('_','-')} month${t>1?'s':''} later</div>`); 
                            }
                        }
                    }
                }
            }
        }
        let ip = [];
        if (Number(item["Quantity Canada"])>0 || Number(item["Quantity USA"])>0){
            if (Number(item["Quantity USA"])>10) {
                ip.push(`US Warehouse: More than 10`);
            } else if (Number(item["Quantity USA"])>0) {
                ip.push(`US Warehouse: ${item["Quantity USA"]}`);
            }
            if (Number(item["Quantity Canada"])>10) {
                ip.push(`Canada Warehouse: More than 10`);
            } else if (Number(item["Quantity Canada"])>0) {
                ip.push(`Canada Warehouse: ${item["Quantity Canada"]}`);
            }          
        } else {
            if (item["Virtual Location"]) {
                if (item["Lock Status"]!="Locked for processing" && Number(item["Unlocked for sale quantity"])>=qty) {
                    ip.push(`In transit: ${Number(item["Unlocked for sale quantity"])}`);
                } else if (Number(item["Quantity Incoming"])-2 >= qty){
                    let inItems = this.$poSKUList.filter(po=>po.SKU.toUpperCase() == item["SKU"].toUpperCase())
                    if (inItems.length>0) {
                        let cPO = this.getIncomingTime(Number(item["Available Quantity"]), inItems, 2, qty);
                        if (cPO) {
                            let inItem = inItems[cPO.i];
                            let date = new Date(inItem["Arrival Due Date"]);                             
                            date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                            if (new Date() > date) {
                                if (this.$allureException.includes(inItem["Part Number"].toLowerCase())) {                                    
                                    // date.setMonth(new Date().getMonth()+2);
                                    date = new Date();
                                    date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                                    date.setMonth(date.getMonth()+3);
                                } else {                                    
                                    // date.setMonth(new Date().getMonth()+1);
                                    date = new Date();
                                    date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                                    date.setMonth(date.getMonth()+1);
                                }
                            } else if (this.$allureException.includes(inItem["Part Number"].toLowerCase())) {
                                date.setMonth(date.getMonth()+2);
                            }
                            const options = {year: 'numeric', month: 'long'};
                            ip.push(`In production: ${cPO.qPO}`);
                            $(".productView-deliver").html(`Expect to ship out in ${date.toLocaleDateString('en-US', options)}`);
                        }  
                    }
                }
                if (Number(item["Virtual Quantity"])-Number(item["Total On Hand"])+Number(item["Available Quantity"])>10) {
                    ip.push(`Allowed Pre-order: More than 10`);
                } else {
                    ip.push(`Allowed Pre-order: ${Number(item["Virtual Quantity"])-Number(item["Total On Hand"])+Number(item["Available Quantity"])}`);
                }
            }
        }
        if (ip.length>0) {
            ip = ['Quantity:',...ip];
        }   
        $('[data-product-stock]').html(ip.join('<br/>'));
        $('[data-stock-label]').css({"display": "none"});
        $(".productView-deliver").after("<span class='productView-tooltip'></span><span class='productView-tooltip-text'>This is an estimate. We are getting shipments weekly so you can receive your order quicker.</span>");
    }
    updateDeliverTime(data, sList=null) {
        $(".productView-deliver").remove();
        $(".productView-tooltip").remove();
        $(".productView-tooltip-text").remove();
        let arrCheck = sList?sList:this.$pSKUList;
        if (arrCheck.length>0 && data.sku) {            
            this.$pCurrent = data;
            let item = arrCheck.find(p=>p.SKU.toUpperCase()==data.sku.toUpperCase());
            if (item) {          
                if (Number(item["Total On Hand"])!=Number(item["Available Quantity"])) {
                    this.updateDeliverLabelWithPending(item);
                } else {
                    this.updateDeliverLabel(item);
                }
            } else if (sList==null) {                
                this.getTeamdeskInventoryBySKU(data);
            }
        } else if (sList==null) {            
            this.getTeamdeskInventoryBySKU(data);
        }
    }

    initProductAttributes(data) {        
        const behavior = data.out_of_stock_behavior;
        const inStockIds = data.in_stock_attributes;
        const outOfStockMessage = ` (${data.out_of_stock_message})`;

        this.showProductImage(data.image);

        if (behavior !== 'hide_option' && behavior !== 'label_option') {
            return;
        }

        $('[data-product-attribute-value]', this.$scope).each((i, attribute) => {
            const $attribute = $(attribute);
            const attrId = parseInt($attribute.data('product-attribute-value'), 10);


            if (inStockIds.indexOf(attrId) !== -1) {
                this.enableAttribute($attribute, behavior, outOfStockMessage);
            } else {
                if (!this.$hasSoldOut) {
                    this.$hasSoldOut = true;
                }
                this.disableAttribute($attribute, behavior, outOfStockMessage);
            }
        });
    }

    /**
     * Hide or mark as unavailable out of stock attributes if enabled
     * @param  {Object} data Product attribute data
     */
    updateProductAttributes(data) {
        const behavior = data.out_of_stock_behavior;
        const inStockIds = data.in_stock_attributes;
        const outOfStockMessage = ` (${data.out_of_stock_message})`;

        this.showProductImage(data.image);

        if (behavior !== 'hide_option' && behavior !== 'label_option') {
            return;
        }

        $('[data-product-attribute-value]', this.$scope).each((i, attribute) => {
            const $attribute = $(attribute);
            const attrId = parseInt($attribute.data('product-attribute-value'), 10);


            if (inStockIds.indexOf(attrId) !== -1) {
                this.enableAttribute($attribute, behavior, outOfStockMessage);
            } else {
                this.disableAttribute($attribute, behavior, outOfStockMessage);
            }
        });
    }

    disableAttribute($attribute, behavior, outOfStockMessage) {
        if (this.getAttributeType($attribute) === 'set-select') {
            return this.disableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
        }

        if (behavior === 'hide_option') {
            $attribute.hide();
        } else {
            $attribute.addClass('unavailable');
        }
    }

    disableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
        const $select = $attribute.parent();

        if (behavior === 'hide_option') {
            $attribute.toggleOption(false);
            // If the attribute is the selected option in a select dropdown, select the first option (MERC-639)
            if ($attribute.parent().val() === $attribute.attr('value')) {
                $select[0].selectedIndex = 0;
            }
        } else {
            $attribute.attr('disabled', 'disabled');
            $attribute.html($attribute.html().replace(outOfStockMessage, '') + outOfStockMessage);
        }
    }

    enableAttribute($attribute, behavior, outOfStockMessage) {
        if (this.getAttributeType($attribute) === 'set-select') {
            return this.enableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
        }

        if (behavior === 'hide_option') {
            $attribute.show();
        } else {
            $attribute.removeClass('unavailable');
        }
    }

    enableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
        if (behavior === 'hide_option') {
            $attribute.toggleOption(true);
        } else {
            $attribute.removeAttr('disabled');
            $attribute.html($attribute.html().replace(outOfStockMessage, ''));
        }
    }

    getAttributeType($attribute) {
        const $parent = $attribute.closest('[data-product-attribute]');

        return $parent ? $parent.data('product-attribute') : null;
    }

    /**
     * Allow radio buttons to get deselected
     */
    initRadioAttributes() {
        $('[data-product-attribute] input[type="radio"]', this.$scope).each((i, radio) => {
            const $radio = $(radio);

            // Only bind to click once
            if ($radio.attr('data-state') !== undefined) {
                $radio.click(() => {
                    if ($radio.data('state') === true) {
                        $radio.prop('checked', false);
                        $radio.data('state', false);

                        $radio.change();
                    } else {
                        $radio.data('state', true);
                    }

                    this.initRadioAttributes();
                });
            }

            $radio.attr('data-state', $radio.prop('checked'));
        });
    }
}
