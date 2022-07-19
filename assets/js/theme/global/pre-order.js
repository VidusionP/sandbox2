import $ from 'jquery';
import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.dropdown';
import utils from '@bigcommerce/stencil-utils';
import ProductDetails from '../common/product-details';
import { defaultModal } from './modal';
import 'slick-carousel';
import { mapLimit } from 'async';

export default function (context) {
    const modal = defaultModal();    

    $("body").on('click', '.btn-notify-check-available', (event) => {
        const productId = $(event.currentTarget).data('notify-productid');                
        //use attr() function for changable attribute
        const attrName = $(event.currentTarget).attr('data-notify-attrName');
        const attrValue = $(event.currentTarget).attr('data-notify-attrValue');
        const attrGreyName = $(event.currentTarget).attr('data-notify-attrGreyName');
        const attrGreyValue = $(event.currentTarget).attr('data-notify-attrGreyValue');
        const quantity = $(event.currentTarget).attr('data-notify-quantity');
        let params = `action=add&product_id=${productId}&qty[]=${quantity}`;
        if (attrName && attrValue) {
            params += `&${attrName}=${attrValue}`;
        }
        if (attrGreyName && attrGreyValue) {
            params += `&${attrGreyName}=${attrGreyValue}`;
        }
        utils.api.productAttributes.optionChange(productId, params, (err, response) => {
            const productAttributesData = response.data || {};
            if (productAttributesData.stock>0) {
                $(".find-stock-available").html(`Current stock: ${productAttributesData.stock}`);
                $(".find-stock-available").show();
            } else {
                $(".find-stock-available").hide();
            }            
            console.log(productAttributesData);
        });
    })

    $('body').on('click', '.find-btn-apply', (event) => {
        event.preventDefault();
        
        //use data() function for unchangable attribute
        const product = $(event.currentTarget).data('book-product');        
        const sku = $(event.currentTarget).data('book-sku');        
        //use attr() function for changable attribute
        const email = $(event.currentTarget).attr('data-book-email');
        const option = $(event.currentTarget).attr('data-book-option');
        const no = $(event.currentTarget).attr('data-book-quantity');
        const grey = $(event.currentTarget).attr('data-book-grey');
        const name = $(event.currentTarget).attr('data-book-client-fullname');
        const phone = $(event.currentTarget).attr('data-book-client-phone');

        if (option)   {
            if (option.toLowerCase().includes('choose')) {
                $(".alertBox-find-option span").html("Please choose option");
                $(".alertBox-find-wrapper").show();
            } else {
                if (grey) {                
                    if (grey.trim().length==0) {                        
                        $(".alertBox-find-option span").html("Please choose Grey %");
                        $(".alertBox-find-wrapper").show();
                        return false;
                    }
                }                
                var settings = {
                    "url": "https://www.teamdesk.net/secure/api/v2/56554/BEA2566590EF4D14AA8D35AD0E2CEA77/t_447395/upsert.json",
                    "method": "POST",
                    "timeout": 0,
                    "headers": {
                      "Content-Type": "application/json"
                    },
                    "data": JSON.stringify([
                      {
                        "Type": "Wish List --  Not Paid Yet",
                        "Order Status": "Wish List on hold",
                        "Items": sku+option,
                        "Request Quantity": no,
                        "SKU": sku+option,
                        "Notes": product+"\nRequest sent from www.superhairpieces.com",
                        "Email": email,
                        "Men's Grey Hair Percentage": grey?grey:null,
                        "Client Full Name": name,
                        "Client Cell Phone": phone,
                        "Men's Hair Color": option
                      }
                    ]),
                  };
                $.ajax(settings).done(function (response) {
                    console.log(settings)
                    console.log(response);
                    if (response[0].status == 201) {
                        let content = `<style>
                            .sign-done {
                                text-align: center;
                                margin-top: 100px;
                                text-transform: uppercase;        
                                font-size: 1.4rem;
                            }
                        </style>
                        <div class="sign-done">sign up successfully</div>`;
                        modal.updateContent(content);
                    } else {                        
                        $(".alertBox-find-option span").html(response[0].errors[0].message);
                        $(".alertBox-find-wrapper").show();
                    }
                });                
            }
        } else {
            $(".alertBox-find-option span").html("Please apply option");
            $(".alertBox-find-wrapper").show();
        }
    })

    $('body').on('click', '.btn-book', (event) => {
        event.preventDefault();

        //These won't change
        const productSku = $(event.currentTarget).data('book-sku');
        const productName = $(event.currentTarget).data('book-name');
        //This one will change
        const productId = $(event.currentTarget).attr('data-book-id');                

        modal.open({ size: 'large' });

        utils.api.product.getById(productId, { template: 'products/quick-back-order' }, (err, response) => {
            response += `<div style="display:none" class="product-sku">${productSku}</div><div style="display:none" class="product-name">${productName}</div>`;
            modal.updateContent(response);

            modal.$content.find('.productView').addClass('productView--quickView');

            modal.$content.find('[data-slick]').slick();

            return new ProductDetails(modal.$content.find('.quick-preorder'), context);
        });
    });

    $('body').on('click', '.btn-book-more', (event) => {
        event.preventDefault();

        //These won't change
        const productSku = $(event.currentTarget).data('book-sku');
        const productName = $(event.currentTarget).data('book-name');
        const obj = $(event.currentTarget).data('book-select');
        const grey = $(event.currentTarget).data('book-grey');
        const customer = $(event.currentTarget).data('book-customer');
        const customerEmail = $(event.currentTarget).data('book-customer-email');
        const customerName = $(event.currentTarget).data('book-customer-name');
        const customerPhone = $(event.currentTarget).data('book-customer-phone');
        const productId = $(event.currentTarget).data('product-id');
        const attrColorName = $(event.currentTarget).data('color-attribute');
        const attrGreyName = $(event.currentTarget).data('grey-attribute');
        //This one will change                
        
        if (customer) {
            modal.open({ size: 'large' });
            let gsel ='';            
            if (grey) {
                let gops = '';
                for (let op of grey.data) {
                    gops += `<option value="${op.key}" data-attr="${op.attr}">${op.value}</option>`;
                }
                gsel = `<div class="find-select-wrapper">
                    <label for="select-color" class="find-select-label">Grey Hair %</label>
                    <select name="select-color" class="find-select" onchange="setSelect1(this)">
                        ${gops}
                    </select>            
                </div>
                <script>
                    document.querySelector(".find-btn-apply").setAttribute("data-book-grey", " ");
                    function setSelect1(obj) {                        
                        if (obj.selectedIndex > 0) {
                            document.querySelector(".find-btn-apply").setAttribute("data-book-grey", obj.options[obj.selectedIndex].text);
                        } else {
                            document.querySelector(".find-btn-apply").setAttribute("data-book-grey", " ");
                        }
                        document.querySelector(".btn-notify-check-available").setAttribute("data-notify-attrGreyName", "${attrGreyName}");
                        document.querySelector(".btn-notify-check-available").setAttribute("data-notify-attrGreyValue", obj.options[obj.selectedIndex].getAttribute("data-attr"));                        
                        document.querySelector(".btn-notify-check-available").click();
                    }
                </script>`;
            }
            let ops = '';
            for (let op of obj.data) {
                ops += `<option value="${op.key}" data-attr="${op.attr}">${op.value}</option>`;
            }
            let content = `<style>
                .find-wrapper {
                    padding: 0.5rem 2rem 1rem;
                }
                .find-title {
                    text-transform: uppercase;        
                    font-weight: 400;
                    margin-bottom: 2rem;
                }
                .find-item-title {
                    margin: 2rem 0;
                }
                .find-select-label, .find-quantity-label {
                    text-transform: uppercase;
                    margin-bottom: 0.7rem;
                }
                .find-product {
                    font-style: italic;
                    font-weight: 400;
                    font-size: 1.2rem;
                }
                .find-input {
                    width: 100%;
                    padding: 0.5rem 1rem;
                    margin-bottom: 2rem;;
                }
                .find-select-wrapper, .find-quantity-wrapper {
                    margin-bottom: 2rem;
                }
                .find-select {
                    width: 100%;
                    padding: 0.5rem 1rem;
                }
                .find-quantity {
                    padding: 0.5rem 1rem;
                }
                .find-btn-apply {
                    text-transform: uppercase;
                }
                .alertBox-find-wrapper {
                    display: none;
                }
                .find-stock-available {
                    display: none;
                    margin-bottom: 2rem;
                    color: #0057ad;
                    font-size: 1.2rem;
                    font-style: italic;
                }
            </style>
            <div class="modal-body find-wrapper">
                <h1 class="find-title">notify me when available</h1>
                <div>Select your option and we'll email you if it's back in stock</div>
                <div class="find-item-title">Product: <span class="find-product">${productName}</span></div>
                <div class="alertBox alertBox--error alertBox-find-wrapper">
                    <div class="alertBox-column alertBox-icon">
                        <icon glyph="ic-error" class="icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg></icon>
                    </div>
                    <p class="alertBox-column alertBox-message alertBox-find-option">
                        <span></span>
                    </p>
                </div>
                <div class="find-select-wrapper">
                    <label for="select-color" class="find-select-label">Hair color</label>
                    <select name="select-color" class="find-select select-notify" onchange="setSelect(this)">
                        ${ops}
                    </select>            
                </div>
                ${gsel}
                <div class="find-stock-available">
                </div>
                <div class="find-quantity-wrapper">
                    <label for="input-quantity" class="find-quantity-label">Quantity</label>
                    <div>
                        <input class="find-quantity" min="1" type="number" value="1" onchange="setQuantity(this)" max="99"/>
                    </div>
                </div>
                <div class="btn-notify-check-available" style="display: none" data-notify-productid="${productId}" data-notify-quantity="1">Check</div>
                <div class="find-btn-apply button button--primary" data-book-sku="${productSku}" data-book-product='${productName}' data-book-quantity='1'>sign up</div>
            </div>
            <script>
                document.querySelector(".find-btn-apply").setAttribute("data-book-email", "${customerEmail}");
                document.querySelector(".find-btn-apply").setAttribute("data-book-client-phone", "${customerPhone}");
                document.querySelector(".find-btn-apply").setAttribute("data-book-client-fullname", "${customerName}");
                function setQuantity(obj) {
                    document.querySelector(".find-btn-apply").setAttribute("data-book-quantity", obj.value);
                    document.querySelector(".btn-notify-check-available").setAttribute("data-notify-quantity", obj.value);
                }
                function setSelect(obj) {
                    //console.log(obj.options[obj.selectedIndex].getAttribute("data-attr"));
                    document.querySelector(".find-btn-apply").setAttribute("data-book-option", obj.value);
                    document.querySelector(".btn-notify-check-available").setAttribute("data-notify-attrName", "${attrColorName}");
                    document.querySelector(".btn-notify-check-available").setAttribute("data-notify-attrValue", obj.options[obj.selectedIndex].getAttribute("data-attr"));                    
                    document.querySelector(".btn-notify-check-available").click();
                }                
            </script>`;
            modal.updateContent(content);
        } else {
            window.location = '/login.php';
        }
    });
}
