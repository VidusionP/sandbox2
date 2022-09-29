import $ from 'jquery';


export default function () {    
    if ($("[function=list-product]").length>0) {
        console.log('hi')
        let stoken = $("[name=store-token]").val();
        let productIds = $("[function=list-product]").data("ids").toString().split(",").map(function(item) {
            return parseInt(item, 10);
        });
        fetch('/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${stoken}`
            },
            body: JSON.stringify({ 
                query: `
                query productsById {
                    site {
                        products (entityIds: [${productIds}]) {    
                            edges {
                                node {
                                    sku                    
                                    name
                                    addToCartUrl
                                    path
                                    prices {
                                        price {
                                            ...MoneyFields
                                        }
                                        salePrice {
                                            ...MoneyFields
                                        }
                                    }
                                    defaultImage {
                                        url (width: 200)
                                    }                                    
                                    productOptions {
                                        ...OptionFields
                                    }         
                                }
                            }                   
                        }
                    }
                }
                fragment MoneyFields on Money {
                    value
                    currencyCode
                }
                fragment OptionFields on ProductOptionConnection {
                    edges {
                        node {
                            entityId
                            displayName                                                    
                            ... on MultipleChoiceOption {
                                values {
                                    edges {
                                        node {
                                            entityId
                                            label                                                                    
                                        }
                                    }
                                }
                            }
                        }
                    }
                }`                
            })
        })
        .then(r=>r.json())
        .then(r=>{
            // console.log(r);
            if (r.data) {
                

                $("[function=add-cart]").on("click", function() {
                    // let form = new FormData();
                    // form.append("action", "add");
                    // form.append("product_id", $(this).data("product_id"));
                    // for (let attr of $(this).data("attributes").split(",")) {
                    //     form.append(`attribute[${attr}]`,$(this).data(`attribute-${attr}`));
                    // }
                    // form.append("qty[]",1);
                    let $this = $(this);
                    function onAdding($el) {
                        if ($el.parents(".card-figure-overlay-wrap").length>0) {
                            $el.parents(".card-figure-overlay-wrap").css({display: "flex"});
                        }
                        $el.html(`<img style="width:18px" src="/content/images/common/loading.svg"/>`);
                    }
                    function onAdded($el) {                        
                        $el.html(`Added`);
                    }
                    if ($this.data("sku")) {
                        onAdding($this);
                        $.get(`/cart.php?action=add&sku=${$this.data("sku")}`, function(data) {                                
                            if (Number($(".countPill.cart-quantity").html())) {
                                $(".countPill.cart-quantity").html(Number($(".countPill.cart-quantity").html())+1);
                            } else {
                                $(".countPill.cart-quantity").html(1).addClass("countPill--positive");
                            }
                            onAdded($this);
                        })
                    } else if ($this.data("url-add")) {                        
                        onAdding($this);
                        $.get($this.data("url-add"), function(data) {                            
                            if (Number($(".countPill.cart-quantity").html())) {
                                $(".countPill.cart-quantity").html(Number($(".countPill.cart-quantity").html())+1);
                            } else {
                                $(".countPill.cart-quantity").html(1).addClass("countPill--positive");
                            }
                            onAdded($this);
                        })
                    }
                });
            }
        })
        .catch(e=>console.log(e));
    }
}
