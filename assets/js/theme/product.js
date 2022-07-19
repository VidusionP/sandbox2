/*
 Import all product specific js
 */
import $ from 'jquery';
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/form-utils';

import utils from '@bigcommerce/stencil-utils';
import { defaultModal } from './global/modal';
import swal from 'sweetalert2';

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = window.location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
    }

    before(next) {
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        next();
    }

    loaded(next) {
        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);

        videoGallery();

        const $reviewForm = classifyForm('.writeReview-form');
        const review = new Review($reviewForm);

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation(this.context);
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        const modal = defaultModal();        

        $('body').on('click', '.find-btn-apply', (event) => {
            event.preventDefault();
            
            //use data() function for unchangable attribute
            const product = $(event.currentTarget).data('book-product');        
            const sku = $(event.currentTarget).data('book-sku');
            // const productJson = $(event.currentTarget).data('product-json');
            //use attr() function for changable attribute
            const email = $(event.currentTarget).attr('data-book-email');
            const option = $(event.currentTarget).attr('data-book-option');
            const no = $(event.currentTarget).attr('data-book-quantity');
            const grey = $(event.currentTarget).attr('data-book-grey');
            const name = $(event.currentTarget).attr('data-book-client-fullname');
            const phone = $(event.currentTarget).attr('data-book-client-phone');
            const curl = $(event.currentTarget).attr('data-book-curl');

            if (option)   {
                if (option.toLowerCase().includes('choose')) {
                    $(".alertBox-find-option span").html("Please choose option");
                    $(".alertBox-find-wrapper").show();
                } else {
                    let vArr = window.pJson?window.pJson:[];                    
                    vArr = vArr.filter(v=>v.option_values.filter(op=>op.label==option).length>0); 
                    if (curl) {
                        vArr.filter(v=>v.option_values.filter(op=>op.label.includes(curl)).length>0);
                    }
                    if (grey) {                
                        if (grey.trim().length==0) {                        
                            $(".alertBox-find-option span").html("Please choose Grey %");
                            $(".alertBox-find-wrapper").show();
                            return false;
                        }
                        vArr = vArr.filter(v=>v.option_values.filter(op=>op.label==grey).length>0);
                    }
                    if (vArr.length>0) {
                        fetch('//shp-webserver.glitch.me/add-teamdesk', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Accept: 'application/json'
                            },
                            body: JSON.stringify({
                                table: 't_447395',
                                body: [
                                    {
                                        "Type": "Wish List --  Not Paid Yet",
                                        "Order Status": "Wish List on hold",
                                        "Items": vArr[0].sku,
                                        "Request Quantity": no,
                                        "SKU": vArr[0].sku,
                                        "Notes": product+"\nRequest sent from www.superhairpieces.com",
                                        "Email": email,
                                        "Men's Grey Hair Percentage": grey?grey:null,
                                        "Client Full Name": name,
                                        "Client Cell Phone": phone,
                                        "Men's Hair Color": option
                                    }
                                ]
                            })
                        })
                        .then(r=>r.json())
                        .then(d=>{
                            if (d.length>0) {
                                if (d[0].status == 201) {
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
                                    swal({
                                        text: 'Could not create your record. Please try again or contact us.',
                                        type: 'info',
                                    });
                                }
                            } else {
                                swal({
                                    text: 'Could not send your record. Please try again or contact us.',
                                    type: 'info',
                                });
                            }                        
                        })
                        .catch(e=>{
                            console.log(e);                        
                            swal({
                                text: 'Error happened. Please try again or contact us.',
                                type: 'info',
                            });
                        })                      
                    } else {
                        swal({
                            text: 'Your selection is not available',
                            type: 'info',
                        });
                    }
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
            const productVariant = $(event.currentTarget).data('variant-json');
            //This one will change
            const productId = $(event.currentTarget).attr('data-book-id');

            modal.open({ size: 'large' });

            utils.api.product.getById(productId, { template: 'products/quick-back-order' }, (err, response) => {            
                response += `<div style="display:none" class="product-sku">${productSku}</div><div style="display:none" class="product-name">${productName}</div></div>`;
                response += `<script>
                    let vjs = ${JSON.stringify(productVariant)};                
                    let color = document.querySelector(".select-color select");
                    if (document.querySelector(".select-grey select")){
                        let grey = document.querySelector(".select-grey select");
                        color.addEventListener("change", function() {                
                            document.querySelector(".select-grey").style.display="block";
                            let vArr = vjs.filter(v=>v.option_values.filter(op=>op.label==color.options[color.selectedIndex].text).length>0);
                            Array.from(grey.options).forEach((opt, idx)=> {
                                let vt = vArr.filter(v=>v.option_values.filter(op=>op.label==opt.text).length>0);                    
                                if (vt.length>0) {
                                    if (vt[0].inventory_level>0) {
                                        opt.style.display = "none";                            
                                    } else {
                                        opt.style.display = "block";
                                    }
                                } else {
                                    opt.style.display = "block";
                                }
                            });
                        });
                    } else {            
                        Array.from(color.options).forEach((opt, idx)=> {                        
                            let vt = vjs.filter(v=>v.option_values.filter(op=>op.label==opt.text).length>0);                        
                            if (vt.length>0) {
                                if (vt[0].inventory_level>0) {
                                    opt.style.display = "none";
                                } else {
                                    opt.style.display = "block";
                                }
                            } else {
                                opt.style.display = "block";
                            }
                        });
                    }
                </script>`;
                modal.updateContent(response);

                modal.$content.find('.productView').addClass('productView--quickView');

                modal.$content.find('[data-slick]').slick();

                return new ProductDetails(modal.$content.find('.quick-preorder'), this.context);
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
            let variantJson = $(event.currentTarget).data('variant-json');        
            //This one will change         
            if (customer) {
                modal.open({ size: 'large' });
                let gsel ='';
                let vButton = '';
                if (variantJson.length>0) {
                    variantJson = JSON.stringify(variantJson);
                    vButton=`<div class="find-btn-apply button button--primary" data-book-sku="${productSku}" data-book-product='${productName}' data-book-quantity='1'>sign up</div><script>var pJson = ${variantJson};</script>`;
                } else {
                    vButton=`<div>Our server could not get the options' information. Please try again later.</div>`;
                }
                if (grey) {
                    let gops = '';
                    for (let op of grey.data) {
                        gops += `<option value="${op.value}" data-attr="${op.attr}">${op.value}</option>`;
                    }
                    gsel = `<div class="find-select-wrapper find-grey-wrap" style="display:none;">
                        <label for="select-color" class="find-select-label">Grey Hair %</label>
                        <select name="select-color" class="find-select find-grey" onchange="setSelect1(this)">
                            ${gops}
                        </select>            
                    </div>
                    <script>
                        document.querySelector(".find-btn-apply").setAttribute("data-book-grey", " ");
                        function setSelect1(obj) {                        
                            if (obj.selectedIndex > 0) {
                                document.querySelector(".find-btn-apply").setAttribute("data-book-grey", obj.value);
                            } else {
                                document.querySelector(".find-btn-apply").setAttribute("data-book-grey", " ");
                            }
                            // document.querySelector(".btn-notify-check-available").setAttribute("data-notify-attrGreyName", "${attrGreyName}");
                            // document.querySelector(".btn-notify-check-available").setAttribute("data-notify-attrGreyValue", obj.options[obj.selectedIndex].getAttribute("data-attr"));                        
                            // document.querySelector(".btn-notify-check-available").click();
                        }                    
                    </script>`;
                }
                let csel = '';
                if (productName.toUpperCase().includes("PERM")) {
                    csel = `<div class="find-select-wrapper">
                        <label for="select-color" class="find-select-label">Wavy</label>
                        <select name="select-color" class="find-select find-curl" onchange="setSelect2(this)">
                            <option value="18mm" data-attr="18mm" selected>18mm</option>
                            <option value="22mm" data-attr="22mm">22mm</option>
                            <option value="25mm" data-attr="25mm">25mm</option>
                        </select>            
                    </div>
                    <script>
                        document.querySelector(".find-btn-apply").setAttribute("data-book-curl", "18mm");
                        function setSelect2(obj) {                        
                            if (obj.selectedIndex > 0) {
                                document.querySelector(".find-btn-apply").setAttribute("data-book-curl", obj.value);
                            } else {
                                document.querySelector(".find-btn-apply").setAttribute("data-book-curl", " ");
                            }                            
                        }                    
                    </script>`;
                }
                let ops = '';
                for (let op of obj.data) {
                    ops += `<option value="${op.value}" data-attr="${op.attr}">${op.value}</option>`;
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
                    ${csel}
                    <div class="find-select-wrapper">
                        <label for="select-color" class="find-select-label">Hair color</label>
                        <select name="select-color" class="find-select select-notify find-color" onchange="setSelect(this)">
                            ${ops}
                        </select>            
                    </div>
                    ${gsel}                
                    <div class="find-quantity-wrapper">
                        <label for="input-quantity" class="find-quantity-label">Quantity</label>
                        <div>
                            <input class="find-quantity" min="1" type="number" value="1" onchange="setQuantity(this)" max="99"/>
                        </div>
                    </div>                
                    ${vButton}
                </div>
                <script>                
                    if (document.querySelector(".find-btn-apply")) {
                        let vJson = ${variantJson};
                        document.querySelector(".find-btn-apply").setAttribute("data-book-email", "${customerEmail}");
                        document.querySelector(".find-btn-apply").setAttribute("data-book-client-phone", "${customerPhone}");
                        document.querySelector(".find-btn-apply").setAttribute("data-book-client-fullname", "${customerName}");  
                        if (document.querySelector(".find-grey")) {} else {
                            let colorData = ${JSON.stringify(obj.data)};                        
                            Array.from(document.querySelector(".find-color").options).forEach((opt,idx) => {                            
                                let vt = vJson.filter(v=>v.option_values.filter(op=>op.label==opt.value).length>0);                            
                                if (vt.length>0) {
                                    if (vt[0].inventory_level>0) {
                                        opt.text = colorData[idx].value+" ("+vt[0].inventory_level+" in stock)";
                                        opt.style.color="#000";
                                        opt.disabled=false;
                                    } else {
                                        opt.text = colorData[idx].value;
                                        opt.style.color="#000";
                                        opt.disabled=false;
                                    }
                                } else {
                                    if (idx>0) {
                                        opt.text = colorData[idx].value + "(Non-stock color option)";
                                        opt.style.color="#ccc";
                                        opt.disabled=true;
                                    } else {
                                        opt.style.color="#ccc";
                                        opt.disabled=true;
                                    }
                                }
                            });
                        }                  
                        function setQuantity(obj) {
                            document.querySelector(".find-btn-apply").setAttribute("data-book-quantity", obj.value);
                        }
                        function setSelect(obj) {
                            document.querySelector(".find-btn-apply").setAttribute("data-book-option", obj.value);         
                            if (document.querySelector(".find-grey")) {
                                let greyData = ${JSON.stringify(grey)};
                                if (greyData.data) {
                                    greyData = greyData.data;
                                }
                                // let vArr = vJson.filter(v=>v.option_values.filter(op=>op.label.replaceAll("  "," ")==obj.value).length>0); 
                                let vArr = [];
                                if (document.querySelector(".find-curl")) {                                    
                                    vArr = vJson.filter(v=>v.option_values.filter(op=>op.label.includes(document.querySelector(".find-curl").value)).length>0); 
                                    vArr = vArr.filter(v=>v.option_values.filter(op=>op.label.replaceAll("  "," ")==obj.value).length>0); 
                                }
                                else {                                    
                                    vArr = vJson.filter(v=>v.option_values.filter(op=>op.label.replaceAll("  "," ")==obj.value).length>0); 
                                }
                                document.querySelector(".find-grey-wrap").style.display="block";
                                Array.from(document.querySelector(".find-grey").options).forEach((opt,idx) => {                                                                 
                                    let vt = vArr.filter(v=>v.option_values.filter(op=>op.label==opt.value).length>0);                                 
                                    if (vt.length>0) {
                                        if (vt[0].inventory_level>0) {
                                            opt.text = greyData[idx].value+" ("+vt[0].inventory_level+" in stock)";
                                            opt.style.color="#000";
                                            opt.disabled=false;
                                        } else {
                                            opt.text = greyData[idx].value;
                                            opt.style.color="#000";
                                            opt.disabled=false;
                                        }
                                    } else {
                                        if (idx>0) {
                                            opt.text = greyData[idx].value + "(Non-stock color option)";
                                            opt.style.color="#ccc";
                                            opt.disabled=true;
                                        } else {
                                            opt.style.color="#ccc";
                                            opt.disabled=true;
                                        }
                                    }
                                });
                            }
                        }
                    }
                </script>`;
                modal.updateContent(content);
            } else {
                window.location = '/login.php';
            }
        });

        next();
    }

    after(next) {
        this.productReviewHandler();

        next();
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.click();
        }
    }
}
