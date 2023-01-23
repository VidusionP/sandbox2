// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const compression = require('compression');

const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const SDK = require("ringcentral");
const cors = require("cors");
const util = require("util");
const url = require("url");
const fs = require("fs");
const glob = require("glob");
const schedule = require("node-schedule");
const dbFile = "./.data/shp.db";
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
const multer = require("multer");
const uploadSHPSupplier = multer({ dest: "public/SHPSuppliers" });
const docusign = require("docusign-esign");
const {ApiError, Client, Environment } = require('square');
const nodemailer = require("nodemailer");
const Stripe = require('stripe');
const app = express();

// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

const hairService=[
  "style#221", 
  "style#222", 
  "style#231", 
  "style#232", 
  "style#233", 
  "style#234", 
  "style#251", 
  "style#331", 
  "style#332", 
  "style#334", 
  "style#335", 
  "style#341", 
  "style#342", 
  "style#343", 
  "style#551", 
  "style#552", 
  "Style #Your_Own",
  "Online Services Pack"
];

app.use(express.static("public"));

app.use(bodyParser.json({limit: '50mb'}));

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  // response.sendFile(__dirname + "/views/index.html");
  response.send("hi");
});

// send the default array of dreams to the webpage
app.get("/dreams", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json(dreams);
});
var allowedOrigins = [
  "https://www.superhairpieces.com",
  "https://superhairpieces.com",
  "https://superhairpieces.ca",
  "https://fr.superhairpieces.ca",
  "https://www.superhairpieces.ca",
  "https://fr.superhairpieces.com",
  "https://es.superhairpieces.com",
  "https://de.superhairpieces.com",
  "https://superhairpiecessandbox4.mybigcommerce.com",
  "https://hairpiecesdirect.co.uk",
  "https://superhair2go.com",
  undefined,
  "http://localhost:3000",
  "http://localhost:3004",
  "http://localhost:3009",
  "http://192.168.1.58:3000",
  "http://192.168.1.58:3004",
  "http://192.168.1.122:3004",
  "https://store-mjczo26kh4.mybigcommerce.com",
  "https://store-cavofu.mybigcommerce.com",
  "https://store-gmosz3ja.mybigcommerce.com",
  null
];
var corsOptions = {
  origin: function(origin, callback) {
    // allow requests with no origin
    // (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg =
        "The CORS policy for this site does not " +
        "allow access from the specified Origin. " +
        origin;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};
// let rule2 = new schedule.RecurrenceRule();
// rule2.dayOfWeek = 0;
// rule2.hour = 21;
// rule2.minute = 28;
// rule2.tz = "Canada/Eastern";
// const refreshDocusign = schedule.scheduleJob(rule2, function () {
//   console.log("Refresh Docusign token");
//   getDocusignAccessToken();
// });
// app.get("/test-docusign-refresh", (request, response) => {
//   getDocusignAccessToken();
//   response.json({result:"testing.."});
// });
// function getBCBrandsByCategory(storehash, token, categoryId, page=1, brands=[]) {
//   fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products?categories%3Ain=${categoryId}&page=${page}&limit=50`, {
//     headers: {
//       'content-type': 'application/json',
//       'x-auth-token': token
//     }
//   })
//   .then(r=>r.json())
//   .then(r=>{
    
//   })
//   .catch(e=>console.log(e));
// }
// app.get("/get-bc-brands-by-category", cors(corsOptions), (request, response)=>{
//   let {catId, storeId} = url.parse(request.url, true).query;  
//   if (storeId == process.env.bc_store_id) {
    
//   } else if (storeId == process.env.bc_store1_id) {
    
//   } else {
//     response.json({result: []});
//   }
// });

// function getProductsInBCByIds(storehash, token, id, response) {  
//   fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products?include_fields=id%2Cprimary_image%2Csku%2Cprice%2Ccustom_url%2Cname&include=primary_image&id%3Ain=${encodeURIComponent(id)}`, {
//     headers: {
//       "x-auth-token": token
//     }
//   })
//   .then(r=>r.json())
//   .then(r=>response.json(r))
//   .catch(e=>response.json(e));
// }
// app.get("/first-products", cors(corsOptions), (request,response)=> {
//   let {storehash, id} = url.parse(request.url, true).query;    
//   if (storehash==process.env.bc_storehash) {
//     getProductsInBCByIds(storehash,process.env.bc_token,id,response);
//   } else if (storehash == process.env.bc_storehash1) {
//     getProductsInBCByIds(storehash,process.env.bc_token,id,response);
//   } else {
//     response.json({error:"there is no such store"});
//   }
// });
app.options("/subscription-ticket", cors(corsOptions))
app.post("/subscription-ticket", cors(corsOptions), async (request, response) => {
  try {
    let {data} = request.body;
    console.log(data)
    let conversation = await fetch(`https://superhairpieces.reamaze.io/api/v1/conversations`, {
      method: "POST",
      headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': process.env.reamaze_token
      },
      body: JSON.stringify({
        conversation: {
          subject: "New Edit / Cancel Request on Superhairpieces.com",
          category: "support",
          message: {
            body: data.message,
            recipients: ["sales@superhairpieces.com"]
          },
          user: {
            name: data.name,
            email: data.email
          }
        }
      })
    }).then(r=>r.json())
    console.log(conversation);
    if (conversation.subject) {
      response.json({result: true});
    } else {
      response.json({result: false})
    }
  } catch (error) {
    response.json({error: error.message})
  }
});
app.get("/bc-subscription-order-by-id", cors(corsOptions), async (request, response) => {
  try{
    let {store_id, order_id} = url.parse(request.url, true).query;
    let storehash = store_id == process.env.bc_store_id ? process.env.bc_storehash : process.env.bc_storehash1;
    let token = store_id == process.env.bc_store_id ? process.env.bc_token : process.env.bc_token1;
    let order = await fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/orders/${order_id}`, {      
      headers: {
        accept: "application/json",
        'Content-Type': "application/json",
        "X-Auth-Token": token
      }
    }).then(r=>r.json())
    if (order.id) {
      let orderAddresses = await fetch(order.shipping_addresses.url, {
        headers: {
          accept: "application/json",
          'Content-Type': "application/json",
          "X-Auth-Token": token
        }
      }).then(r=>r.json())
      if (orderAddresses?.length>0) {
        order.shipping_addresses["addresses"] = orderAddresses;
      }
      response.json(order);
    } else {
      response.json({error: "There is no data"});
    }
  } catch(err) {
    response.json({error: err.message});
  }
})

app.get("/retrieve-stripe-subscription", cors(corsOptions), async (request, response) => {
  try {
    let {stripe_id} = url.parse(request.url, true).query
    const stripe = Stripe(process.env.stripe_sandbox);
    const subscription = await stripe.subscriptions.retrieve(stripe_id, {
      expand: ["customer", "default_payment_method"]
    });
    if (subscription?.id) {
      const invoices = await stripe.invoices.search({
        query: `subscription:'${subscription.id}'`,
        expand: ["data.charge"]
      });
      if (invoices?.data?.length>0) {
        let sInvoices = [];
        for (let invoice of invoices.data) {
          sInvoices.push({
            id: invoice.id,
            amount_due: invoice.amount_due,
            amount_paid: invoice.amount_paid,
            payment_method_details: invoice.charge?.payment_method_details ? invoice.charge.payment_method_details : null,
            status: invoice.status,
            refuned: invoice.refuned,
            paid: invoice.paid,
            period_start: invoice.period_start,
            currency: invoice.charge?.currency
          })
        }
        subscription["invoices"] = sInvoices
      }
    }    
    response.json(subscription);
  } catch (error) {
    console.log(error);
    response.json({error: error.message});
  }
})

app.get("/teamdesk-subscription", cors(corsOptions), async (request, response) => {
  console.log(url.parse(request.url, true).query);
  let {email, store_id} = url.parse(request.url, true).query;    
  // let tdSubscription = await fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.td_sub_tb}/select.json?filter=Any([Client Email],'${email}') and Any([domain],'${store_id==process.env.bc_store_id?".com":".ca"}') and not IsBlank([SKU]) and not IsBlank([Manual Order %23])&column=*&column=Part Number&column=Classification&sort=Contract%23//DESC`).then(r=>r.json());
  let tdSubscription = await fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.td_sub_tb}/select.json?filter=Any([domain],'${store_id==process.env.bc_store_id?".com":".ca"}') and not IsBlank([SKU])&column=*&column=Part Number&column=Classification&sort=Contract%23//DESC`).then(r=>r.json());
  console.log(tdSubscription?.length);
  if (tdSubscription?.length>0) {
    response.json({data: tdSubscription});
  } else {
    response.json({result: "Has no data"});
  }
});
/**
 * Void and replace another invoice with new billing address
 * 
 * @param {string} subscription_id Stripe Subscription ID
 * @param {string} invoice_id ID of invoice to get void
 */
async function replaceSubscriptionInvoice(subscription_id, invoice_id) {
  try {
    const stripe = Stripe(process.env.stripe_sandbox);
    let invoice = await stripe.invoices.voidInvoice(invoice_id);
    invoice = await stripe.invoices.create({subscription: subscription_id});
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

/**
 * 
 * @param {string} customer_id Stripe customer id
 * @param {string} postal_code Postal code to check
 * 
 * @returns true if get updated
 */
async function updateStripeCustomerBilling(customer_id, postal_code) {
  const stripe = Stripe(process.env.stripe_sandbox);
  try {
    let customer = await stripe.customers.retrieve(customer_id);
    if (customer.address) {
      if (customer.address.postal_code != postal_code) {
        let address = customer.address;
        address.postal_code = postal_code;
        if ((!customer.address.country || !customer.address.state) && customer.shipping) {
          if (customer.shipping.country && !customer.address.country) address.country = customer.shipping.country;
          if (customer.shipping.state && !customer.address.state) address.state = customer.shipping.state;        
        }
        customer = await stripe.customers.update(
          customer_id,
          {      
            address
          }
        )
        if (customer.id) return true;
      }      
    } else {
      let address = {postal_code};
      if (customer?.shipping) {
        if (customer.shipping.country) address.country = customer.shipping.country;
        if (customer.shipping.state) address.state = customer.shipping.state;        
      }
      customer = await stripe.customers.update(
        customer_id,{address}
      )
      if (customer.id) return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}
/**
 * Update billing address before make the payment
 */
app.options("/update-stripe-subscription-billing", cors())
app.post("/update-stripe-subscription-billing", cors(corsOptions), async (request, response) => {
  try {
    let {customer_id, postal_code, subscription_id, invoice_id} = request.body;      
    const updateCustomer = await updateStripeCustomerBilling(customer_id, postal_code);
    if (updateCustomer) {
      const replaceInvoice = await replaceSubscriptionInvoice(subscription_id, invoice_id);
    }
    response.json({result: "Checked"});
  } catch (err) {
    console.log(err);
    response.json({result: "Error", message: err.message});
  }
})
/**
 * Update billing address after make a successfully payment of subscription
 */
// app.options("/update-latest-billing-stripe", cors())
// app.post("/update-latest-billing-stripe", cors(corsOptions), async (request, response) => {
//   try {
//     let {customer_id, postal_code} = request.body;  
//     const stripe = Stripe(process.env.stripe_sandbox);
//     let customer = await stripe.customers.retrieve(customer_id);
//     if (customer.address) {
//       let address = customer.address;
//       address.postal_code = postal_code;
//       if ((!customer.country || !customer.state) && customer.shipping) {
//         if (customer.shipping.country && !customer.country) address.country = customer.shipping.country;
//         if (customer.shipping.state && !customer.state) address.state = customer.shipping.state;        
//       }
//       customer = await stripe.customers.update(
//         customer_id,
//         {      
//           address
//         }
//       )      
//     } else {
//       customer = await stripe.customers.update(
//         customer_id,
//         {      
//           address: {
//             postal_code
//           }
//         }
//       )      
//     }
//     response.json({result: "Updated"});
//   } catch (err) {
//     console.log(err);
//     response.json({result: "Error", message: err.message});
//   }
// })
/**
 * Retrieve customer id from customer email. Also update latest shipping address.
 * 
 * @param {json} data Customer data to insert or update
 * @param {object} stripe Stripe component
 * @returns customer id
 */
async function retrieveStripeCustomer(data, stripe) {
  let customer = await stripe.customers.search({
    query: `email:\'${data.email}\'`,
  });
  if (customer.data) {
    if (customer.data.length>0) {
      for (let c of customer.data) {
        if (c.email==data.email) {
          customer = c;
          break;
        }
      }
    }
  }
  if (customer.id) {
    customer = data.billing_address
    ? await stripe.customers.update(
      customer.id,
      {
        shipping: {
          address: data.shipping_address,
          name: data.name,
        },
        address: data.billing_address
      }
    )
    : await stripe.customers.update(
      customer.id,
      {
        shipping: {
          address: data.shipping_address,
          name: data.name,
        }        
      }
    );
  } else {
    customer = data.billing_address
    ? await stripe.customers.create({
      email: data.email,
      name: data.name,
      shipping: {
        address: data.shipping_address,
        name: data.name,
      },
      address: data.billing_address
    })
    : await stripe.customers.create({
      email: data.email,
      name: data.name,
      shipping: {
        address: data.shipping_address,
        name: data.name,
      }      
    });
  }
  return customer.id;
}

/**
 * Retrieve price id from product data
 * 
 * @param {json} data Product data
 * @param {object} stripe Stripe component
 * @returns 
 */
async function retrieveStripePrice(data, stripe) {
  let product_id=null, price_id=null;
  // const product = await stripe.products.search({
  //   query: `active:\'true\' AND name=\'${data.name}\'`,
  // });      
  const product = await stripe.products.search({
    query: `active:\'true\' AND name:\'${data.name}\'`,
  });      
  if (product.data) {
    for (let p of product.data) {
      if (p.name == data.name) {
        product_id = p.id;
        break;
      }
    }
  }
  if (product_id) {
    let price = await stripe.prices.search({
      query: `active:\'true\' AND product:\'${product_id}\'`
    });
    if (price.data) {
      for (let p of price.data) {
        if (p.currency == data.currency && p.unit_amount == data.price*100 && p.recurring) {
          if (p.recurring.interval == data.recurring.interval && p.recurring.interval_count == data.recurring.interval_count) {
            price_id = p.id;
            break;
          }
        }
      }
    }
    if (price_id==null) {
      price = await stripe.prices.create({
        unit_amount: (data.price*100).toFixed(),
        currency: data.currency,
        recurring: {interval: data.recurring.interval, interval_count: data.recurring.interval_count},
        product: product_id
      })
      price_id = price.id;
    }
  } else {
    const price = await stripe.prices.create({
      unit_amount: (data.price*100).toFixed(),
      currency: data.currency,
      recurring: {interval: data.recurring.interval, interval_count: data.recurring.interval_count},
      product_data: {
        name: data.name
      }
    });
    price_id = price.id
  }
  return price_id;
}

/**
 * Retrieve Subscription Client Secret for making a payment
 * 
 * @param {string} customer_id Stripe customer id
 * @param {string} price_id Stripe price id
 * @param {integer} quantity Number of item in this subscription
 * @param {integer} store_id BC store id
 * @param {object} stripe Stripe component
 * @returns client secret
 */
/**
 * Retrieve Subscription Client Secret for making a payment
 * 
 * @param {string} customer_id Stripe customer id
 * @param {string} price_id Stripe price id
 * @param {integer} quantity Number of item in this subscription
 * @param {string} options A base64 string for json option object
 * @param {integer} customer_bc_id Customer ID in BC if there is
 * @param {integer} store_id BC store id
 * @param {object} stripe Stripe component
 * @returns client secret
 */
async function retrieveStripeSubscriptionPaymentIntent(customer_id, price_id, quantity, options, customer_bc_id, store_id, stripe) {
  let subscription = await stripe.subscriptions.search({
    query: `status:\'incomplete\' AND metadata[\'customer_id\']:\'${customer_id}\' AND metadata[\'price_id\']:\'${price_id}\' AND metadata[\'store_id\']:\'${store_id}\' AND metadata[\'options\']:\'${options}\'`,
    expand: ['data.latest_invoice.payment_intent']
  });
  if (subscription.data) {
    if (subscription.data.length>0) {
      subscription = subscription.data[0];
    }
  }
  console.log(JSON.parse(Buffer.from(options,"base64").toString()))
  let cancelDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  let uxCancelDate = Math.floor(cancelDate.getTime()/1000);
  if (subscription.id) {    
    subscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at: Math.floor((uxCancelDate*1000 - 864e5*15) / 1000),
      expand: ['latest_invoice.payment_intent']
    });
  } else {
    subscription = await stripe.subscriptions.create({
      customer: customer_id,
      items: [{
        price: price_id,
        quantity: quantity
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        customer_id,
        price_id,
        store_id,
        options,
        customer_bc_id,
      },
      cancel_at: Math.floor((uxCancelDate*1000 - 864e5*15) / 1000)
    });
  }
  console.log(subscription.id);
  if (subscription.id) {
    return subscription.latest_invoice.payment_intent.client_secret;
  } else {
    return "";
  }
}
app.options("/create-stripe-subcription", cors());
app.post("/create-stripe-subcription", cors(corsOptions), async (request,response)=>{
  // console.log("create stripe subscription");
  // response.json({clientSecret: "pi_3MMIwtAmgqssRgrn1QF1cOe7_secret_A3KdeDgaQXGDVstSfi4a2IuWa"});
  console.log(request.body);
  let {data, store_id} = request.body;
  try {
    const stripe = Stripe(process.env.stripe_sandbox);
    let customer_id = await retrieveStripeCustomer(data.customer, stripe);
    let price_id = await retrieveStripePrice(data.product, stripe);
    let client_secret = await retrieveStripeSubscriptionPaymentIntent(customer_id, price_id, data.product.quantity, data.product.options, data.customer.bc_id, store_id, stripe);
    console.log(client_secret);
    response.json({clientSecret: client_secret, customer_id});
  } catch (error) {
    console.log(error);
    response.json({error: error.message})
  }
})
app.options("/retrieve-bc-customer-latest-addresses", cors());
app.post("/retrieve-bc-customer-latest-addresses", cors(corsOptions), async (request, response)=>{
  console.log(request.body);
  const {store_id, customer_id} = request.body;
  let storehash = store_id == process.env.bc_store_id ? process.env.bc_storehash : process.env.bc_storehash1;
  let token = store_id == process.env.bc_store_id ? process.env.bc_token : process.env.bc_token1;
  try {
    let order = await fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/orders?sort=id%3Adesc&limit=1&customer_id=${customer_id}`,{
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-auth-token":token
      }
    }).then(r=>r.text());
    if (order) order=JSON.parse(order);
    if (order.length>0) {
      let shipping_address = await fetch(`https://api.bigcommerce.com/stores/cavofu/v2/orders/${order[0].id}/shipping_addresses`,{
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-auth-token":token
        }
      }).then(r=>r.text());      
      if (shipping_address) shipping_address=JSON.parse(shipping_address);
      if (shipping_address.length>0) {
        response.json({
          customer: {
            name: shipping_address[0].first_name ? shipping_address[0].first_name : "" + " " + shipping_address[0].last_name ? shipping_address[0].last_name : "",
            shipping_address: {
              line1: shipping_address[0].street_1 ? shipping_address[0].street_1 : "",
              line2: shipping_address[0].street_2 ? shipping_address[0].street_2 : "",
              city: shipping_address[0].city ? shipping_address[0].city : "",
              state: shipping_address[0].state ? shipping_address[0].state : "",
              postal_code: shipping_address[0].zip ? shipping_address[0].zip : "",
              country: shipping_address[0].country_iso2 ? shipping_address[0].country_iso2 : ""
            },
            billing_address: order[0].billing_address
              ? {
                line1: order[0].billing_address.street_1 ? order[0].billing_address.street_1 : "",
                line2: order[0].billing_address.street_2 ? order[0].billing_address.street_2 : "",
                city: order[0].billing_address.city ? order[0].billing_address.city : "",
                state: order[0].billing_address.state ? order[0].billing_address.state : "",
                postal_code: order[0].billing_address.zip ? order[0].billing_address.zip : "",
                country: order[0].billing_address.country_iso2 ? order[0].billing_address.country_iso2 : ""
              }
              : ""
          }
        })
      } else {
        response.json({customer: ""})
      }
    } else {
      response.json({customer: ""});
    }
  } catch(err) {
    response.json({error: err.message});
  }
})

/**
 * Create a first record for subscription plan
 * 
 * @param {string} stripeSubscriptionId Id of stripe subscription
 * @param {string} invoice_id First BC invoice id 
 * @param {string} domain Is it .com or .ca
 */
async function createTeamdeskSubscription(stripeSubscriptionId, invoice_id, domain) {
  try {
    const stripe = Stripe(process.env.stripe_sandbox);
    const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
      subscription: stripeSubscriptionId,
      expand: ["lines.data.price.product"]
    });
    if (upcomingInvoice?.next_payment_attempt) {
      let skus = [], sQuantity = [];
      if (upcomingInvoice.lines?.data?.length>0) {
        for (let item of upcomingInvoice.lines.data) {
          if (item?.price?.product?.name) {
            skus.push(item.price.product.name);
            sQuantity.push(12 / item.plan.interval_count * item.quantity);
          }
        }
      }
      let teamdeskQuantity = 0;      
      let tdInventory = await fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_inv_tb}/select.json?filter=Any([SKU],'${skus.map(sku=>encodeURIComponent(sku)).join(",")}')`).then(r=>r.json());
      // console.log(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_inv_tb}/select.json?filter=Any([SKU],'${skus.map(sku=>encodeURIComponent(sku)).join(",")}')`)      
      let item = tdInventory?.length>0 ? tdInventory.find(i=>i["Classification"].includes("Instock")) : null;            
      let sku = item ? item["SKU"] : tdInventory?.length>0 ? tdInventory[0]["SKU"] : "";
      if (sku) {
        for (let [idx, s] of skus.entries()) {
          if (s==sku) {
            teamdeskQuantity = sQuantity[idx];            
            break;
          }
        }
      }
      let tdSubscription = await fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.td_sub_tb}/select.json?filter=[Stripe Subscription ID]='${stripeSubscriptionId}'`).then(r=>r.json());
      if (tdSubscription?.length==0) {
        tdSubscription = await fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.td_sub_tb}/select.json?filter=[Contract Type]<>'Canada Instore Plan- Stock' and [Contract Type]<>'Canada Instore Plan - CM'&sort=f_32925213//DESC&top=1`).then(r=>r.json());
        if (tdSubscription?.length > 0) {
          let teamdeskRecord = {
            "Contract#": Number(tdSubscription[0]["Contract#"]) + 1,
            "Contract Type": tdSubscription[0]["Virtual Quantity"] ? Number(tdSubscription[0]["Virtual Quantity"])==100 ? "Custom Made Order": "Stock Order": "Stock Order",
            "Contract Status": "Confirmed",
            "Starting Date": (new Date()).toISOString(),
            "SKU": sku,
            "Subscribed Quantity": teamdeskQuantity,
            "Client Email": upcomingInvoice.customer_email,
            "Invoice#1": invoice_id,
            "Paid Status#1": "Paid in stripe.com",
            "Next Order Date": new Date(Number(upcomingInvoice.next_payment_attempt)*1000).toISOString(),
            "Stripe Subscription ID": stripeSubscriptionId,
            "Manual Order #": invoice_id,
            "Domain": domain
          }
          console.log(teamdeskRecord);
          tdSubscription = await fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.td_sub_tb}/upsert.json`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(teamdeskRecord)
          }).then(r=>r.json());
          console.log(util.inspect(tdSubscription, false, null, true));
          console.log("Created subscription in teamdesk");
        }
      }
    }    
  } catch (err) {
    console.log(err);
  }
}
/**
 * Check if Stripe customer billing is the same as invoice billing zip code.
 * Update customer billing zip code if it is different
 * 
 * @param {string} charge_id Stripe charge id from invoice 
 */
async function checkStripeBilling(charge_id) {
  if (charge_id) {
    const stripe = Stripe(process.env.stripe_sandbox);
    const charge = await stripe.charges.retrieve(charge_id, {expand:["customer"]});
    if (charge?.billing_details?.address?.postal_code != charge?.customer?.address?.postal_code) {    
      if (charge?.customer?.address) {
        let address = charge.customer.address;
        address.postal_code = charge?.billing_details?.address?.postal_code ? charge.billing_details.address.postal_code : "";
        const customer = await stripe.customers.update(charge.customer.id,{address});
        return customer;
      }
    }
    return charge?.customer
  } else {
    return null;
  }
}
app.post("/stripe-subscription-webhook", async (request, response)=>{
  try {
    // console.log(request.body);    
    response.json({run: "working on it"});
    let {type, data}  = request.body;   
    let object = data?.object;    
    if (type == "invoice.paid") {
      const customer = await checkStripeBilling(object?.charge);
      let products = [], metadata = null;
      if (object?.lines?.data?.length>0 && object?.lines?.data[0]?.subscription) {        
        for (let item of object.lines.data) {
          metadata = item.metadata;
          let options = metadata.options ? JSON.parse(Buffer.from(metadata.options,"base64").toString()) : {};
          let product={product_options:[]};
          console.log(options);
          if (Object.keys(options).length>0) {
            for (let key in options) {              
              if (key=="product_id") {                
                product[key] = options[key];                
              } else if (key.includes("attribute")) {
                let id = key.match(/\d+/g)[0];
                product.product_options.push({
                  id,
                  value: options[key]
                })
                // product[id] = options[key];
              }
            }
          }
          products.push({
            "product_id":product.product_id,
            "product_options": product.product_options,
            "quantity": item.quantity ? item.quantity : 0
          })
        }
      }
      if (metadata) {
        if (metadata?.store_id) {                    
          let storehash = metadata.store_id == process.env.bc_store_id ? process.env.bc_storehash : process.env.bc_storehash1;
          let token = metadata.store_id == process.env.bc_store_id ? process.env.bc_token : process.env.bc_token1;
          let token_mo = metadata.store_id == process.env.bc_store_id ? process.env.bc_tokenmo : process.env.bc_token1mo;
          let domain = metadata.store_id == process.env.bc_store_id ? ".com" : ".ca";
          
          let customer_id = null;
          if (metadata.customer_bc_id) {
            customer_id = metadata.customer_bc_id
          } else {
            let customer = await fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/customers?email%3Ain=${object?.customer_email}`, {
              headers: {
                accept: "application/json",
                'Content-Type': "application/json",
                "X-Auth-Token": token,
              }
            }).then(r=>r.json());
            if (customer.data) {
              if (customer.data.length>0) {
                customer_id = customer.data[0].id
              }
            }
          }

          let customer_shipping = customer?.shipping ? customer.shipping : object?.customer_shipping? object.customer_shipping : null;
          let customer_billing = customer?.address ? customer.address : null;
          let order_data = {
            products,
            "status_id":11
          }
          if (customer_shipping) {
            order_data["shipping_addresses"] = [
              {
                "first_name": customer_shipping.name ? customer_shipping.name : "",
                "last_name": "",
                "company": "",
                "street_1": customer_shipping.address?.line1 ? customer_shipping.address.line1 : "",
                "street_2": customer_shipping.address?.line2 ? customer_shipping.address.line2 : "",
                "city": customer_shipping.address?.city ? customer_shipping.address.city : "",
                "zip": customer_shipping.address?.postal_code ? customer_shipping.address.postal_code : "",                      
                "country_iso2": customer_shipping.address?.country ? customer_shipping.address.country : "",
                "state": customer_shipping.address?.state ? customer_shipping.address.state : "",
                "phone": customer_shipping.phone ? customer_shipping.phone : "",
                "email": object?.customer_email ? object.customer_email : "",
                "shipping_method": "Free Shipping"
              }
            ]
            order_data["billing_address"] = {        
              "zip": customer_billing?.postal_code ? customer_billing.postal_code : customer_shipping.address?.postal_code ? customer_shipping.address.postal_code : "",
              "country_iso2": customer_billing?.country ? customer_billing.country : customer_shipping.address?.country ? customer_shipping.address.country : "",
              "state": customer_billing?.state ? customer_billing.state : customer_shipping.address?.state ? customer_shipping.address.state : " "
            }
          }
          if (customer_id) {
            order_data["customer_id"] = customer_id
          }
          console.log(util.inspect(order_data, false, null, true));
          let order = await fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/orders`, {
            method: "POST",
            headers: {
              accept: "application/json",
              'Content-Type': "application/json",
              "X-Auth-Token": token_mo
            },            
            body: JSON.stringify(order_data)
          }).then(r=>r.json())
          console.log(util.inspect(order, false, null, true));
          if (order.id) {
            console.log("created order " + order.id)      
            if (object?.billing_reason == "subscription_create") {
              const teamdeskSubscription = createTeamdeskSubscription(object.lines.data[0].subscription, order.id, domain);              
            }             
          }
        }
      }
    }  
  } catch(e) {
    console.log(e);    
  }
})

app.options("/stripe-payment-link", cors());
app.post("/stripe-payment-link", cors(corsOptions), async (request,response) => {
  try {
    let {data, store_id} = request.body;
    console.log(data);

    const stripe = Stripe(process.env.stripe_sandbox);              
    let link=null,done=false;
    let start = null;
    let product_id=null, price_id=null;
    while (link==null && done==false) {      
      const paymentLinks = start
      ? await stripe.paymentLinks.list({
        limit: 100,
        expand: ['data.line_items'],
        starting_after: start
      })
      : await stripe.paymentLinks.list({
        limit: 100,
        expand: ['data.line_items']
      });
      if (paymentLinks.data) {
        if (paymentLinks.data.length>0) {
          for (let pl of paymentLinks.data) {
            if (pl.line_items && pl.shipping_address_collection) {
              for (let i of pl.line_items.data) {
                if (i.currency == data.product.currency && i.description == data.product.name && i.quantity == data.product.quantity && i.amount_total == data.product.price*100 && i.price.type=="recurring") {
                  if (i.price.recurring.interval == data.recurring.interval && i.price.recurring.interval_count == data.recurring.interval_count) {
                    link = pl.url;
                    price_id = i.price.id;
                    product_id = i.price.product;
                  }
                }
              }
            }
          }
          start = paymentLinks.data[paymentLinks.data.length-1].id;
        } else {
          if (done==false) {
            done=true;
          }
        }        
      } else {
        done=true;
      }
    }
    if (link) {
      response.json({url: link})
    } else {
      const product = await stripe.products.search({
        query: `active:\'true\'`,
      });      
      if (product.data) {
        if (product.data.length>0) {
          for (let p of product.data) {
            if (p.name == data.product.name) {
              product_id = p.id;
            }
          }          
        }
      }      
      const price = product_id
      ? await stripe.prices.create({
        unit_amount: (data.product.price*100).toFixed(),
        currency: data.product.currency,
        recurring: {interval: data.recurring.interval, interval_count: data.recurring.interval_count},
        product: product_id
      })
      : await stripe.prices.create({
        unit_amount: (data.product.price*100).toFixed(),
        currency: data.product.currency,
        recurring: {interval: data.recurring.interval, interval_count: data.recurring.interval_count},
        product_data: {
          name: data.product.name
        }
      });
      price_id = price.id;
      if (product_id == null) {
        product_id = price.product;
      }
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: price_id,
            quantity: data.product.quantity,
          },
        ],
        billing_address_collection: "required",
        shipping_address_collection: {
          allowed_countries: ["AE","AL","AR","AT","AU","BB","BE","BG","BH","BM","BS","BT","BY","BZ","CA","CH","CL","CO","CR","CY","CZ","DE","DK","DO","EC","EE","ES","ET","FI","FR","GB","GD","GF","GR","GT","GU","GY","HK","HN","HR","HU","ID","IE","IL","IS","IT","JP","KH","KR","KY","LI","LT","LU","LV","ME","MK","MT","MY","NL","NO","NZ","OM","PA","PE","PH","PL","PT","PY","QA","RO","SA","SE","SG","SI","SK","SR","TH","TR","TT","US","UY","VA","VG","ZA"]
        }
      });
      if (paymentLink.url) {        
        response.json({url: paymentLink.url})
      } else {
        console.log("error could not get the link")
        response.json({error: "Could not get the link"})
      }
    }
    const db = new sqlite3.Database(dbFile, (err)=> {
      if (err) {
        console.log(err.message);
      }
      db.serialize(()=>{
        db.run("DROP TABLE IF EXISTS subscription")
        db.run("CREATE TABLE IF NOT EXISTS subscription (timestamp INTEGER PRIMARY KEY, storeid INTEGER NOT NULL, productid text NOT NULL, priceid text NOT NULL");
        db.run(`INSERT INTO subscription (timestamp, storeid, productid, priceid, customerip) VALUES(${Date.now()},${store_id},'${product_id}','${price_id}')`);
        db.each("SELECT * FROM subscription", (err, row) => {
            console.log(row);
        });
      })
    })    
  } catch (e) {    
    response.json({error: e.message});
  }
});
/**
 * Get the core / top category ID based on the giving category ID
 * @param {int} categoryId Category ID
 */
async function getBCCoreCategory(categoryId, storehash, token) {
  const response = await fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/catalog/categories?id=${categoryId}`,
  {
    method: "GET",
    headers: {
      "x-auth-token": token,
      Accept: "application/json",
      "Content-Type": "application/json",
    }
  })
  const category = await response.json();  
  if (category.data) {
    if (category.data.length>0) {
      if (category.data[0].parent_id==0) {
        return category.data[0].id;
      } else {
        return new Promise(resolve => resolve(getBCCoreCategory(category.data[0].parent_id, storehash, token)));
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
}
/**
 * Get the core / top category based on category name. For example, using sale keyword, returns sale category with parent Men, Women or Extension
 * @param {string} name Name of category to query
 * @param {string} storehash BC storehash
 * @param {string} token BC token
 */
function getBCCategoryByNameWithParent(name, storehash, token, response) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/catalog/categories?name:like=${name}`,{
    method: 'GET',
    headers: {
      "x-auth-token": token,
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  })
  .then(r=>r.json())
  .then(async (r)=>{
    if (r.data) {
      let result = [];
      for (let category of r.data) {        
        let parentId = await getBCCoreCategory(category.id, storehash, token)
        // console.log(parentId);
        if (parentId) {
          category["parent_core_id"] = parentId;
          result.push(category);
        }        
      }
      response.json({data: result});
    } else {
      response.json({data: []})
    }
  })
  .catch(e=>{    
    console.log(e)
    response.json({error: "there is error"})
  })
}
app.get("/bc-category-with-core", cors(corsOptions), (request,response)=>{  
  let {keyword, storeId} = url.parse(request.url, true).query;
  console.log(keyword)
  console.log(storeId)
  if (storeId == process.env.bc_store_id){
    getBCCategoryByNameWithParent(keyword, process.env.bc_storehash, process.env.bc_token, response);
  } else if (storeId == process.env.bc_store1_id) {
    getBCCategoryByNameWithParent(keyword, process.env.bc_storehash1, process.env.bc_token1, response);
  } else {
    response.json({result:[]})
  }
})

app.options("/send-email", cors());
app.post("/send-email", cors(corsOptions), (request, response)=> {
  let {to, subject, html} = request.body;
  let transporter = nodemailer.createTransport({
    service: process.env.email_server,
    auth: {
      user: process.env.email_address,
      pass: process.env.email_password
    }
  });
  let mailOptions = {
    from: process.env.email_address,
    to,
    subject,
    html
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      response.json(error)
    } else {      
      response.json(info)
    }
  });
});

app.post("/td-appointment-canceled", async (request, response) => {
  response.json({run: "working on it"});
  let {id} = request.body;
  try {
    let client = new Client({
      timeout:3000,
      environment: Environment.Production,
      accessToken: process.env.SQUARE_ACCESS_TOKEN
    });
    const resSquare = await client.bookingsApi.cancelBooking(id,
    {});

    console.log(resSquare.result);
  } catch(error) {
    console.log(error);
  }
})

app.post("/td-appointment-added", async (request, response) => {
  response.json({run: "working on it"});
  // console.log(request.body);
  console.log("webhook from teamdesk planning to update to squareone");
  let {email, service, start, duration, stylist} = request.body;
  try {
    let client = new Client({
      timeout:3000,
      environment: Environment.Production,
      accessToken: process.env.SQUARE_ACCESS_TOKEN
    });
    let resSquare = await client.customersApi.searchCustomers({
      query: {
        filter: {
          emailAddress: {
            exact: email
          }
        }
      }
    });
    let customer=null, stlist = null;
    if (resSquare.result.customers) {
      console.log("exist customer");
      customer = resSquare.result.customers[0];      
    } else {
      console.log("create new customer");
      let resTD = await fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_client_tb}/select.json?filter=[Email]='${email}'`)
      if (resTD.ok) {
        let resCustomer = await resTD.json();
        resCustomer = resCustomer[0];
        
        resSquare = await client.customersApi.createCustomer({
          idempotencyKey: crypto.randomUUID(),
          givenName: resCustomer["First Name"],
          familyName: resCustomer["Last Name"],
          emailAddress: email
        });
        
        if (resSquare.result.customer) {
          customer = resSquare.result.customer;
        }
      } else {
        console.log(resTD.status);
      }      
    }
    
    resSquare = await client.bookingsApi.listTeamMemberBookingProfiles();
    if (resSquare.result.teamMemberBookingProfiles) {
      stlist = resSquare.result.teamMemberBookingProfiles.find(s=>s.displayName.includes(stylist));
    }
    
    if (customer && stlist) {
      service = service.split(",");
      duration = duration.split(":");
      let appointmentSegments=[];
      for (let s of service) {
        resSquare = await client.catalogApi.searchCatalogItems({
          textFilter: s.split("\t")[0],
          productTypes: [
            'APPOINTMENTS_SERVICE'
          ]
        });
        console.log(util.inspect(resSquare.result,true,null,false));
        if (resSquare.result.items) {          
          appointmentSegments.push({
            teamMemberId: stlist.teamMemberId,
            durationMinutes: Math.floor(Number(resSquare.result.items[0].itemData.variations[0].itemVariationData.serviceDuration)/60000),
            serviceVariationId: resSquare.result.items[0].itemData.variations[0].id,
            serviceVariationVersion: Number(resSquare.result.items[0].itemData.variations[0].version)
          })
        }
      }
      if (appointmentSegments.length>0) {
        start = new Date(start);
        start.setHours(start.getHours()-1);
        // console.log(util.inspect({
        //     startAt: start.toISOString(),
        //     customerId: customer.id,
        //     locationId: '9G03BN2CFZ26B',
        //     appointmentSegments
        // }, true, null, false));
        resSquare = await client.bookingsApi.createBooking({
          idempotencyKey: crypto.randomUUID(),
          booking: {
            startAt: start.toISOString(),
            customerId: customer.id,
            locationId: '9G03BN2CFZ26B',
            appointmentSegments
          }
        });
        console.log(resSquare.result);        
      }      
    }
  } catch(error) {
    console.log(error);
  }  
});

/**
* @summary create or update record in teamdesk's Appointment table
*
* @param {json} record Teamdesk record
*
* @returns void
*/
function createUpdateTDAppointment(record){
  fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.td_app}/upsert.json`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify(record)
  })
  .then(r=>r.json())
  .then(r=>{
    console.log(r);
  })
  .catch(e=>{
    console.log(e);
  })
}

app.options('/squareup-checkCustomer', cors());
app.post("/squareup-checkCustomer", cors(corsOptions), async (request, response) => {
  let {email} = request.body;
  try {
      let client = new Client({
        timeout:3000,
        environment: Environment.Sandbox,
        accessToken: process.env.SQUARE_ACCESS_TOKEN_SANDBOX
      });
    const response1 = await client.customersApi.searchCustomers({
    query: {
      filter: {
        emailAddress: {
          exact: email
        }
      }
    }
    });
        const vidu = JSON.parse(JSON.stringify(response1.result, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
      response.json(vidu)
  } catch(error) {
    console.log(error);
  }
})

app.options('/customerCustomAttributes', cors());
app.post('/customerCustomAttributes', cors(corsOptions), async (request, response) => {
    let {id } = request.body;
  try {
      let client = new Client({
        timeout:3000,
        environment: Environment.Sandbox,
        accessToken: process.env.SQUARE_ACCESS_TOKEN_SANDBOX
      });
  const response1 = await client.customerCustomAttributesApi.listCustomerCustomAttributes(`${id}`);

  response.json(response1.result);
} catch(error) {
  console.log(error);
}
})

app.options('/retrieveBooking', cors());
app.post('/retrieveBooking', cors(corsOptions), async (request, response) => {
    let { id } = request.body;
  try {
      let client = new Client({
        timeout:3000,
        environment: Environment.Sandbox,
        accessToken: process.env.SQUARE_ACCESS_TOKEN_SANDBOX
      });
const response1 = await client.bookingsApi.retrieveBooking(`${id}`);
        const vidu = JSON.parse(JSON.stringify(response1.result, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
  response.json(vidu);

} catch(error) {
  console.log(error);
}
})

app.options('/squareup-createCustomer', cors());
app.post("/squareup-createCustomer", cors(corsOptions), async (request, response) => {
  let {firstName, lastName, email, phone} = request.body;
  try {
      let client = new Client({
        timeout:3000,
        environment: Environment.Sandbox,
        accessToken: process.env.SQUARE_ACCESS_TOKEN_SANDBOX
      });
    const response1 = await client.customersApi.createCustomer({
        idempotencyKey: crypto.randomUUID(),
        givenName: firstName,
        familyName: lastName,
        emailAddress: email,
        phoneNumber: phone
    });
        const vidu = JSON.parse(JSON.stringify(response1.result, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
      response.json(vidu)

      addCustomAttribute(vidu.customer.id, '')
  } catch(error) {
    console.log(error);
  }
})

async function addCustomAttribute(customerId, bookingId) {
  let value = [];
  console.log(customerId);
  try {
      let client = new Client({
        timeout:3000,
        environment: Environment.Sandbox,
        accessToken: process.env.SQUARE_ACCESS_TOKEN_SANDBOX
      });
        try {
            const response1 = await client.customerCustomAttributesApi.retrieveCustomerCustomAttribute(`${customerId}`,
            'booking_key');

              if (!(response1.result.customAttribute.value === "")) {
                value.push(response1.result.customAttribute.value);
              }          
            value.push(bookingId);
          
          const response = await client.customerCustomAttributesApi.upsertCustomerCustomAttribute(`${customerId}`,
          'booking_key',
          {
            customAttribute: {
              value: `${value}`
            }
          });
        } catch(error) {
            await client.customerCustomAttributesApi.upsertCustomerCustomAttribute(`${customerId}`,
            'booking_key',
            {
              customAttribute: {
                value: `${bookingId}`
              }
            });
              const response = await client.customerCustomAttributesApi.upsertCustomerCustomAttribute(`${customerId}`,
              'booking_key',
              {
                customAttribute: {
                  value: `${bookingId}`
                }
              });

              // console.log(response.result)

        }

} catch(error) {
  console.log(error);
}
}


app.options('/squareup-createBooking', cors());
app.post("/squareup-createBooking", cors(corsOptions), async (request, response) => {
  let {startAt, locationId, customerId, customerNote, book} = request.body;
  try {
      let client = new Client({
        timeout:3000,
        environment: Environment.Sandbox,
        accessToken: process.env.SQUARE_ACCESS_TOKEN_SANDBOX
      });
    const response1 = await client.bookingsApi.createBooking({
      booking: {
        startAt: startAt,
        locationId: locationId,
        customerId: customerId,
        customerNote: customerNote,
        appointmentSegments: book
      }
      
    });
        const vidu = JSON.parse(JSON.stringify(response1.result, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
      response.json(vidu);
    console.log(vidu.booking.id);
    console.log(customerId);
    addCustomAttribute(customerId, vidu.booking.id);
  } catch(error) {
    console.log(error);
  }
})

app.options("/squareup-bookings1", cors());
app.post("/squareup-bookings1", cors(corsOptions), async (request, response) => {
  fetch(`https://connect.squareupsandbox.com/v2/bookings/team-member-booking-profiles?bookable_only=true`, {
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        authorization: 'Bearer ' + process.env.SQUARE_ACCESS_TOKEN_SANDBOX
      }  
  })
  .then(r=>r.json())
  .then(async r=> {
    response.json(r); 
  })
})

// app.post("/td-appointment-canceled", async (request, response) => {
//   response.json({run: "working on it"});
//   let {id} = request.body;
//   try {
//     let client = new Client({
//       timeout:3000,
//       environment: Environment.Production,
//       accessToken: process.env.SQUARE_ACCESS_TOKEN
//     });
//     const resSquare = await client.bookingsApi.cancelBooking(id,
//     {});

//     console.log(resSquare.result);
//   } catch(error) {
//     console.log(error);
//   }
// })



app.options("/sq-servicetype", cors());
app.post("/sq-servicetype", cors(corsOptions), async (request, response) => {
      let {start, end, service, stylist} = request.body;
try {
      let client = new Client({
        timeout:3000,
        environment: Environment.Sandbox,
        accessToken: process.env.SQUARE_ACCESS_TOKEN_SANDBOX
      });
  const response1 = await client.catalogApi.searchCatalogItems({
    productTypes: [
      'APPOINTMENTS_SERVICE'
    ]
  });
            const vidu = JSON.parse(JSON.stringify(response1.result, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
  response.json(vidu)
  // resAva.result.availabilities.forEach((item) => {
  //   console.log(item.appointmentSegments[0])
  //     // response.json(item.appointmentSegments[0].serviceVariationVersion.toString());
  // })
} catch(error) {
  console.log(error);
}
})

app.options("/squareup-log", cors());
app.post("/squareup-log", cors(corsOptions), async (req, res)=> {
  // console.log(req.body)
  let { email } = req.body;
  squareUpLogin(email, res);
  // res.json('123456')
})

function squareUpLogin(email, res) {
            let omnevid = '63c19d783d897d0020e8b570';
            let check = 0;
            crypto.randomBytes(3, function(err, buffer) {
               check = parseInt(buffer.toString('hex'), 16).toString().substr(0,6);
            fetch(`https://api.omnisend.com/v3/events/${omnevid}`, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-api-key': process.env.omnisend_key,
              accept: 'application/json'
            },
            body: JSON.stringify({
              email: `${email}`,
              fields: {
                verification_code: `${check}`,
                action: "log in"
              }
            })
          })
          // .then(r=>r.json())

        .then(r=> {
              console.log(check)
          res.json({check}); 
        })
          .catch(e=>{
            console.log(e);          
          }); 
            });
  

}

app.options("/sq-availability", cors());
app.post("/sq-availability", cors(corsOptions), async (request, response) => {
      let {start, end, service, stylist, styling} = request.body;
try {
      let client = new Client({
        timeout:3000,
        environment: Environment.Sandbox,
        accessToken: process.env.SQUARE_ACCESS_TOKEN_SANDBOX
      });
  const resAva1 = await client.bookingsApi.searchAvailability({
    query: {
      filter: {
        startAtRange: {
          startAt: start,
          endAt: end
        },
        locationId: 'LH2NMP4RW2BRY',
        segmentFilters: styling
      }
    }
  })
          const vidu = JSON.parse(JSON.stringify(resAva1.result, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
  response.json(vidu)
  // resAva.result.availabilities.forEach((item) => {
  //   console.log(item.appointmentSegments[0])
  //     // response.json(item.appointmentSegments[0].serviceVariationVersion.toString());
  // })
} catch(error) {
  console.log(error);
}
})


app.options("/squareup-appointment", cors());
app.post("/squareup-appointment", cors(corsOptions), async (request, response) => {
  // console.log(util.inspect(request.body, true, null, false));  
  console.log("webhook from squareup plannning to update to teamdesk");
  response.json({result: "working on it"});
  let {data} = request.body;
  let {id, status, appointment_segments, customer_id, start_at} = data.object.booking;  
  console.log(status);
  if (status=="ACCEPTED") {  
    fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.td_app}/select.json?filter=[POS ID]='${id}'`, {
      headers: {
        'content-type': 'application/json',
        accept: 'application/json'
      }      
    })
    .then(r=>r.json())
    .then(async r=>{
      let client = new Client({
        timeout:3000,
        environment: Environment.Production,
        accessToken: process.env.SQUARE_ACCESS_TOKEN
      });
      try {
        let customer = await client.customersApi.retrieveCustomer(customer_id);
        // console.log(util.inspect(customer.result, true, null, false));
        customer = customer.result.customer;

        let services=[];
        let stylists=[];
        for (let sv of appointment_segments) {
          let service = await client.catalogApi.retrieveCatalogObject(sv.service_variation_id,true);
          let stylist = await client.bookingsApi.retrieveTeamMemberBookingProfile(sv.team_member_id);      
          // console.log(util.inspect(stylist.result, true, null, false));
          if (stylists.includes(stylist.result.teamMemberBookingProfile.displayName) == false) {
            stylists.push(stylist.result.teamMemberBookingProfile.displayName);
          }
          services.push({name: service.result.relatedObjects[0].itemData.name, duration: sv.duration_minutes});
        }

        // console.log(services)
        let duration = services.reduce((a,b)=>a+Number(b.duration),0);
        let dstart = new Date(start_at);
        // dstart.setHours(dstart.getHours()+1);
        let dend = new Date(start_at);
        // dend.setHours(dend.getHours()+1);
        dend.setMinutes(dend.getMinutes()+duration);

        let record = {
          "POS ID": id,
          "Client Email": customer.emailAddress,
          "Canada Service Menu": services.map(s=>s.name).join(", ").replace(/\'/g,"\'"),
          "Appointment Time": dstart.toISOString(),
          "New Time Duration": `${Math.floor(duration/60)}:${duration%60}`,
          "Canada Hairstylist": stylists.join(", "),
          "Model and Color": "N/A",          
          "Service Office": "Canada"
        }        
        if (r.length==0) {
          createUpdateTDAppointment(record);
        } else {
          record["@row.id"] = r[0]["@row.id"];
          createUpdateTDAppointment(record);
        }          
      } catch(error) {
        console.log(error);
      }          
    })
    .catch(e=>console.log(e));    
  } else if (status.includes("CANCELLED")) {
    fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.td_app}/select.json?filter=[POS ID]="${id}" and not Contains([Appointment Status],'Cancelled')`, {
      headers: {
        'content-type': 'application/json',
        accept: 'application/json'
      }      
    })
    .then(r=>r.json())
    .then(r=>{
      console.log(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.td_app}/select.json?filter=[POS ID]="${id}" and not Contains([Appointment Status],'Cancelled')`)
      console.log(r)
      let record={};
      if (r.length>0) {
        record["@row.id"] = r[0]["@row.id"];
        if (status=="CANCELLED_BY_SELLER") {
          record["Appointment Status"]= "Office Cancelled";
        } else if (status=="CANCELLED_BY_CUSTOMER") {
          record["Appointment Status"]= "Client Cancelled";
        }
        createUpdateTDAppointment(record);
      }      
    })
    .catch(e=>console.log(e));
  }
})

/**
* @summary send Email when customer apply for video contest
*
* @param {string} cusEmail Email of customer
* @param {string} cusName Name of customer
* @param {string} domain Domain which called from i.e: com
*/
function sendClientVideoContestEmail(cusEmail, cusName, domain, response) {
  console.log(`https://api.omnisend.com/v3/events/${domain=="com"?process.env.omd_vcontest_client:process.env.omd_vcontest_client1}`);
  fetch(`https://api.omnisend.com/v3/events/${domain=="com"?process.env.omd_vcontest_client:process.env.omd_vcontest_client1}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': domain=="com"?process.env.omnisend_key:process.env.omnisend_key1,
      accept: 'application/json'
    },
    body: JSON.stringify({
      email: cusEmail,
      fields: {
        customer_name: cusName,
        customer_email: cusEmail
      }
    })
  })
  .then(r=>{
    console.log(r);
    response.json({result:1});
  })  
  .catch(e=>{
    console.log(e);
    response.json({result:0})
  }); 
}
app.options("/send-omn-vc-cemail", cors());
app.post("/send-omn-vc-cemail", cors(corsOptions), (request, response)=>{
  let {cusEmail, cusName, domain} = request.body;
  console.log(request.body);  
  sendClientVideoContestEmail(cusEmail, cusName, domain, response);
});

/**
* @summary send Email when customer apply for video contest
*
* @param {string} cusEmail Email of customer
* @param {string} cusName Name of customer
*/
function sendOmnVideoContestEmail(cusEmail, cusName, cusLink, cusPhone, response) {
  fetch(`https://api.omnisend.com/v3/events/${process.env.omd_vcontest_noti}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.omnisend_key,
      accept: 'application/json'
    },
    body: JSON.stringify({
      email: "nha@superhairpieces.com",
      fields: {
        customer_name: cusName,
        customer_email: cusEmail,
        customer_link: cusLink,
        customer_phone: cusPhone
      }
    })
  })
  .then(r=>{
    console.log(r);
    response.json({result:1});
  })  
  .catch(e=>{
    console.log(e);
    response.json({result:0})
  }); 
}
app.options("/send-omn-vc-email", cors());
app.post("/send-omn-vc-email", cors(corsOptions), (request, response)=>{
  let {cusEmail, cusName, cusLink, cusPhone} = request.body;
  console.log(request.body);  
  sendOmnVideoContestEmail(cusEmail, cusName, cusLink, cusPhone, response);
});
/**
* @summary Create conversation in Reamaze
*
* @param {json} conversation Converstaion content to create
*/
function createRemazeConversation(conversation) {  
  fetch(`https://superhairpieces.reamaze.io/api/v1/conversations`, {
    method: "POST",
    headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': process.env.reamaze_token
    },
    body: JSON.stringify({
      conversation
    })
  })
  .then(r=>r.json())
  .then(r=>{
    console.log(r);
  })
  .catch(e=>console.log(e));
}
app.post("/docusign-signed", (request, response)=> {  
  response.json({test:"test test"});
  if (request.body) {
    let {data} = request.body;    
    if (data.envelopeSummary.emailSubject.toLowerCase().includes("hairpiece subscription form")) {
      let rp = data.envelopeSummary.recipients.signers[0];
      let conversation = {
          "subject": "Completed hairpiece subscription form",
          "category": "support",
          "message": {
              "body": `This is application from ${rp.name}: ${rp.email}\n${rp.name} completed the docusign form`,
              "recipients": ["sales@superhairpieces.com"]                                            
          },
          "user": {
              "name": rp.name,
              "email": rp.email
          }
      }      
      createRemazeConversation(conversation);
    }
  }  
});
/**
* @summary Returns number of days difference of dates
* 
* @param {Datetime} d1 The first date to compare
* @param {Datetime} d2 The sencond date to compare
* @returns {float} Returns number of days diffence. Negative when d2 earlier than d1
* @example
*
* dateDiff(new Date("06/30/2019"), new Date("07/30/2019"))
* // => 30
*********************
*/
function dayDiff(d1, d2) {
  let timeDiff = d2.getTime() - d1.getTime();
  return timeDiff / (1000*3600*24);
}
/**
* @summary Add content to supscription order
*
* @param {string} storehash Storehash value for BC call
* @param {string} token Token value for BC call
* @param {number} orderId Id of created subscription order in BC
* @param {json} td Data to update
* @param {string} invNote Note for Shipping Department in teamdesk. i.e: this order for Invoice#5
*/
function addSubscriptionNote(storehash, token, orderId, td, invNote) {
  let note = `\n
    Contract ${td["Contract#"]}\n
    A.Invoice ${td["Authorize invoice #"]}\n
    Ranking number: ${invNote}\n
    This is made for subscription plan`;
  fetch(
    `https://api.bigcommerce.com/stores/${storehash}/v2/orders/${orderId}`,
    {
      method: "PUT",
      headers: {
        "x-auth-token": token,
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        customer_message: note
      }),
    }
  )
  .then(r=>r.json())
  .then(r=>{
    console.log(r);
  })
  .catch(e=>console.log(e));
}
/**
* @summary Create subscription order in BC and log next order date in teamdesk
*
* @param {string} storehash Storehash to call API of bigcommerce
* @param {string} token Token to call API of bigcommerce
* @param {json} data Order data to create order in bigcommerce
* @param {json} td Teamdesk data mapping from Authorize invoice number
*/
function createSubOrder(storehash, token, data, td) {  
  console.log(util.inspect(data, true, null, false));
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/orders`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-auth-token': token
    },
    body: JSON.stringify(data)
  })
  .then(r=>r.json())
  .then(r=>{
    console.log(r)
    if (r.id) {
      let currentDate = new Date().toISOString().split("T")[0];
      fs.appendFile(`./.data/manual-${currentDate}.log`, `\nCreated order`, function (err) {
        if (err) console.log(err);
      }); 
      let uptd = {
        Id: td.Id,
        "@row.id": td["@row.id"]        
      };
      let timeline = td["Order Date Request"];
      if (timeline) {
        timeline = timeline.split(",");
        let cd = new Date();
        for (let t of timeline) {              
          let tld = new Date(t);
          let dd = dayDiff(cd, tld);
          if (dd>0) {
            uptd["Next Order Date"] = tld.toISOString().split("T")[0];   
            break;
          }              
        }         
      }
      let i=1;
      while (td[`Invoice#${i}`] && i<=10) {
        console.log(`Invoice#${i}: `+td[`Invoice#${i}`]);
        i++;        
      }
      let invNote="";
      if (td[`Invoice#${i}`]==null) {
        uptd[`Invoice#${i}`]=r.id;
        invNote=`${i}/${td["Subscribed Quantity"]}`;
        uptd[`Paid Status#${i}`]="Paid in Authorized.net";
      }
      addSubscriptionNote(storehash, token, r.id, td, invNote);
      fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.td_sub_tb}/upsert.json`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify(uptd)
      })
      .then(r=>r.json())
      .then(r=>{
        console.log(r);
      })
      .catch(e=>console.log(e));
    }
  })
  .catch(e=>console.log(e));
}
/**
* @summary Get order's addresses from order id and set subscription order data's addresses
*
* @param {string} storehash Storehash to call Bigcommerce API
* @param {string} token Token to call Bigcommerce API
* @param {json} td Teamdesk data mapping from authorize invoice number
* @param {json} data Order data to create in Bigcommerce
*/
function getSubOrderAddress(storehash, token, td, data) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/orders/${td["Manual Order #"]}/shipping_addresses`, {
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json',
      'x-auth-token': token
    }
  })
  .then(r=>r.json())
  .then(r=>{       
    if (r.length>0) {
      for (let s of r) {
        data.shipping_addresses.push({
          first_name: s.first_name,
          last_name: s.last_name,
          company: s.company,
          street_1: s.street_1,
          street_2: s.street_2,
          city: s.city,
          zip: s.zip,
          country: s.country,
          country_iso2: s.country_iso2,
          state: s.state,
          email: s.email,
          phone: s.phone,          
          shipping_method: s.shipping_method
        })
      }
      createSubOrder(storehash, token, data, td);
      // console.log(util.inspect(data, true, null, false));
    }
  })
  .catch(e=>console.log(e));
}
/**
* @summary Get order's products from order id and set subscription order data's products
*
* @param {string} storehash Storehash to call Bigcommerce API
* @param {string} token Token to call Bigcommerce API
* @param {json} td Teamdesk data mapping from authorize invoice number
* @param {json} data Order data to create in Bigcommerce
*/
function getSubOrderProducts(storehash, token, td, data) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/orders/${td["Manual Order #"]}/products`, {
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json',
      'x-auth-token': token
    }
  })
  .then(r=>r.json())
  .then(r=>{    
    if (r.length>0) {
      for (let p of r) {
        let ops = [];
        if (p.product_id) {
           for (let o of p.product_options) {
            ops.push({
              id: o.product_option_id,
              value: o.value
            })
          } 
          data.products.push({
            name: p.name,
            quantity: p.quantity,
            price_inc_tax: p.price_inc_tax,
            price_ex_tax: p.price_ex_tax,
            sku: p.sku,
            product_id: p.product_id,
            product_options: ops
          })        
        } else {
          data.products.push({
            name: p.name,
            quantity: p.quantity,
            price_inc_tax: p.price_inc_tax,
            price_ex_tax: p.price_ex_tax,
            sku: p.sku            
          })      
        }           
      }
      // console.log(util.inspect(data.products, true, null, false));
      getSubOrderAddress(storehash, token, td, data);
    }
  })
  .catch(e=>console.log(e));
}
/**
* @summary Get order'data from order id and set subscription order data
*
* @param {string} storehash Storehash to call Bigcommerce API
* @param {string} token Token to call Bigcommerce API
* @param {json} td Teamdesk data mapping from authorize invoice number
* @param {json} data Order data to create in Bigcommerce
*/
function getSubOrder(storehash, token, td, data={}) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/orders/${td["Manual Order #"]}`, {
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json',
      'x-auth-token': token
    }
  })
  .then(r=>r.json())
  .then(r=>{    
    if (r.id) {
      data = {
        customer_id: r.customer_id,
        shipping_cost_ex_tax: r.shipping_cost_ex_tax,
        shipping_cost_inc_tax: r.shipping_cost_inc_tax,
        status_id: 11,
        billing_address: {
          first_name: r.billing_address.first_name,
          last_name: r.billing_address.last_name,
          company: r.billing_address.company,
          street_1: r.billing_address.street_1,
          street_2: r.billing_address.street_2,
          city: r.billing_address.city,
          state: r.billing_address.state,
          zip: r.billing_address.zip,
          country: r.billing_address.country,
          country_iso2: r.billing_address.country_iso2,
          phone: r.billing_address.phone,
          email: r.billing_address.email
        },
        products: [],
        shipping_addresses: []
      }            
      getSubOrderProducts(storehash, token, td, data);
    }
  })
  .catch(e=>console.log(e))
}
/**
* @summary Get order id from authorize invoice number and start working on create Bigcommerce subscription order
*
* @param {string} invoiceNo Invoice Number getting from authorize
*/
function getTDOrderOptions(invoiceNo) {  
  fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.td_sub_tb}/select.json?filter=[Authorize invoice %23]=ToNumber('${invoiceNo}')`)
  .then(r=>r.json())
  .then(r=>{    
    if (r.length>0) {
      r = r[0];
      if (r["Manual Order #"]) {
        let currentDate = new Date().toISOString().split("T")[0];
        fs.appendFile(`./.data/manual-${currentDate}.log`, `Manual order ${r["Manual Order #"]} Contract ${r["Contract#"]}`, function (err) {
            if (err) console.log(err);
        });   
        if (dayDiff(new Date(), new Date(r["Next Order Date"]))>=15) {
          return;
        }
        if (r["Domain"]) {
          if (r["Domain"]==".com") {
            getSubOrder(process.env.bc_storehash, process.env.bc_tokenmo, r);
          } else if (r["Domain"]==".ca") {
            getSubOrder(process.env.bc_storehash1, process.env.bc_token1mo, r);
          }
        } else {
          // getSubOrder(process.env.bc_sandbox_storehash, process.env.bc_sandbox_token, r);
        }  
      }      
    }
  })
  .catch(e=>console.log(e));
}
app.post("/authorize-payment", (request, response) => {
  let trq = request.body;
  console.log(util.inspect(request.body, true, null, false));
  let {invoiceNumber} = trq.payload;  
  let currentDate = new Date().toISOString().split("T")[0];
  fs.appendFile(`./.data/manual-${currentDate}.log`, `\n---------${invoiceNumber}----------\n${JSON.stringify(trq)}\n`, function (err) {
      if (err) console.log(err);
  }); 
  response.json({result:"run"});
  getTDOrderOptions(invoiceNumber);
})
app.post("/test-auth-payment", (request, response) => {
  console.log(util.inspect(request.body, true, null, false));
  fs.appendFile(
    `./.data/auth-payment.log`,
    util.inspect(request.body, true, null, false),
    function (err) {
      if (err) console.log(err);
    }
  );
  response.json({result: "test"});
})
function createTdClient(client) {
  fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/Client/upsert.json`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(client)
  })
  .then(r=>r.json())
  .then(r=>{
    console.log("created td client");
    console.log(r);
  })
  .catch(e=>console.log(e));
}
function createOmnContact(key, contact) {
  fetch(`https://api.omnisend.com/v3/contacts`, {
    method: "POST",
    headers: {
      "x-api-key": key,
      "content-type": "application/json",
    },
    body: JSON.stringify(contact),
  })
    .then((result) => {
      console.log("created omn contact");
      console.log(result);                  
    })
    .catch((error) => {
      console.log(error);                  
    });
}
function getBCCreatedClient(  
  id,
  storehash,
  created_at,
  key,
  token,
  isEU=false 
) {
  fetch(
    `https://api.bigcommerce.com/stores/${storehash}/v3/customers?id:in=${id}&include=addresses`,
    {
      headers: {
        "x-auth-token": token,
      },
    }
  )
    .then((result) => result.json())
    .then((customers) => {
      console.log(customers);
      if (customers.data.length > 0) {
        let customer = customers.data[0];
        fetch(
          `https://api.bigcommerce.com/stores/${storehash}/v2/customer_groups/${customer.customer_group_id}`,
          {
            headers: {
              "x-auth-token": token,
              accept: "application/json",
            },
          }
        )
          .then((result) => result.json())
          .then((group) => {
            // console.log(group);
            if (group.name) {
              if (key) {
                createOmnContact(key, {
                  firstName: customer.first_name,
                  lastName: customer.last_name,
                  tags: ["source: BigCommerce API"],
                  identifiers: [
                    {
                      type: "email",
                      id: customer.email,
                      channels: {
                        email: {
                          status: "subscribed",
                          statusDate: new Date(created_at * 1000).toISOString(),
                        },
                      },
                    },
                  ],
                  customProperties: {
                    Customer_Group: group.name,
                  },
                });
              }
              let tdClient = {
                "Email": customer.email,
                "First Name": customer.first_name,
                "Last Name": customer.last_name,
                "Phone": customer.phone,
                "Customer Group": group.name,
                "Business Name": customer.company,
                "Client ID in BC": customer.id
              };
              if (customer.addresses.length>0) {
                let addr = customer.addresses[0]
                tdClient["Billing Address Line 1"] = addr.address1,
                tdClient["Address Line 2"] = addr.address2,
                tdClient["City"] = addr.city,
                tdClient["State"] = addr.state_or_province,
                tdClient["Zip"] = addr.postal_code,
                tdClient["Country"] = addr.country
              }
              if (isEU) {
                tdClient["EU"]=true
              }
              createTdClient(tdClient);
            }
          })
          .catch((error) => {
            console.log(error);            
          });
      }
    })
    .catch((error) => {
      console.log(error);      
    });
}
app.post("/bc-client-created", (request, response) => {
  console.log(request.body);
  response.json({result:"working on it.."});
  if (request.body) {
    let { store_id, data, created_at } = request.body;
    if (store_id == process.env.bc_store_id) {
      getBCCreatedClient(        
        data.id,
        process.env.bc_storehash,
        created_at,
        process.env.omnisend_key,
        process.env.bc_token
      );
    } else if (store_id == process.env.bc_store1_id) {
      getBCCreatedClient(        
        data.id,
        process.env.bc_storehash1,
        created_at,
        process.env.omnisend_key1,
        process.env.bc_token1
      );
    } else if (store_id == process.env.bc_eu_storeid) {
      getBCCreatedClient(        
        data.id,
        process.env.bc_eu_storehash,
        created_at,
        null,
        process.env.bc_eu_token,
        true
      );
    } else if (store_id == process.env.bc_fr_storeid) {
      getBCCreatedClient(        
        data.id,
        process.env.bc_fr_storehash,
        created_at,
        null,
        process.env.bc_fr_token,
        true
      );
    } else if (store_id == process.env.bc_genc_storeid) {
      getBCCreatedClient(        
        data.id,
        process.env.bc_genc_storehash,
        created_at,
        null,
        process.env.bc_genc_token,
        true
      );
    }
  }
});

function omnisendSubscribe(email,omnkey,response) {
  fetch(`https://api.omnisend.com/v3/contacts?email=${email}`, {
    method: 'PATCH',
    headers: {
      "x-api-key": omnkey,
      "content-type": "application/json",
      'accept': 'application/json'
    },
    body: JSON.stringify({
      "identifiers": [
          {
              "id": email,
              "type": "email",
              "channels": {
                  "email": {
                      "status": "subscribed",
                      "statusDate": new Date().toISOString()
                  }
              }
          }
      ]
    })
  })
  .then(r=>r.json())
  .then(d=>{
    console.log(d);
    response.json({result:"subscribed"});
  })
  .catch(e=>{
    console.log(e);
    response.json({result:"error",message:e});
  });
}
app.post("/subscribe-omnisend", (request, response)=>{
  let {email, storeId} = request.body;
  if (storeId == process.env.bc_store_id) {    
    omnisendSubscribe(email,process.env.omnisend_key,response);
  } else if (storeId == process.env.bc_store1_id) {
    omnisendSubscribe(email,process.env.omnisend_key1,response);
  } else {
    response.json({result:"error",message:"There is no such store"});
  }  
});

function makeEnvelope(args){

  // Create the envelope definition
  let env = new docusign.EnvelopeDefinition();
  env.templateId = args.templateId;

  let signer1 = docusign.TemplateRole.constructFromObject({
      email: args.signerEmail,
      name: args.signerName,
      roleName: 'signer'});

  env.templateRoles = [signer1];
  env.status = "sent";

  console.log("makeEnvelope");
  console.log(util.inspect(env, true, null, false));

  return env;
}

async function applyDocusign(args) {

  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
  
  let envelope = makeEnvelope(args.envelopeArgs)    
  try {
    let results = await envelopesApi.createEnvelope(args.accountId, {envelopeDefinition: envelope});  

    console.log("applyDocusign");
    console.log(util.inspect(results, true, null, false));
    return results;
  } catch(err) {
    return null;
  }
}

function refreshDocusignToken(tokenFile, token, email, name, response, storeId, send=false) {
  fetch(`https://account.docusign.com/oauth/token`, {
    method: 'POST',
    headers: {
      authorization: process.env.docusign_auth,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      "grant_type": "refresh_token",
      "refresh_token": token.refresh_token
    })
  })
  .then(r=>r.json())
  .then(r=>{
    if (r.access_token) {
      fs.writeFile(
          tokenFile,
          JSON.stringify(r),          
          async function(err) {
            if (err) {
              if (send) {
                response.json({result: "error", message: err});
              } else {
                console.log(err);
              }
            } else {
              if (send) {
                let result = await applyDocusign({
                  basePath: `${process.env.docusign_uri}/restapi`,
                  accessToken: r.access_token,
                  accountId: process.env.docusign_account_id,
                  envelopeArgs: {
                    templateId: storeId==process.env.bc_store1_id?process.env.docusign_subscription_ca_template:process.env.docusign_subscription_com_template,
                    signerEmail: email,
                    signerName: name
                  }
                });
                if (result) {
                  response.json(result);  
                } else {
                  response.json({result: "error"});
                }
              } else {
                console.log({result: "refreshed token"});
              }
            }
          }
        );
    } else {
      response.json({result:"error", message:"no authorization"});
    }
  })
  .catch(err=>{
    if (send) {
      response.json({result:"error", message:err});
    } else {
      console.log(err);
    }
  })
}
function getDocusignAccessToken(send=false, email=null, name=null, response=null, storeId=null) {
  const tokenFile = "./.data/docusign-token.json";
  fs.readFile(tokenFile, function(err,data) {
    if (err) {
      if (send) {
        response.json({result:"error",message:err});
      } else {
        console.log(err);
      }
    } else {            
      if (data.length>1) {
        let token = JSON.parse(data);        
        refreshDocusignToken(tokenFile, token, email, name, response, storeId, send);                
      }
    }
  })
}

app.options("/send-docusign-subscription", cors());
app.post("/send-docusign-subscription", cors(corsOptions), (request, response)=>{  
  let {email, name, storeId} = request.body;
  console.log(request.body);
  if (storeId==process.env.bc_store_id || storeId==process.env.bc_store1_id) {
    getDocusignAccessToken(true, email, name, response, storeId);
  } else {
    response.json({result: "store does not exist"});
  }
});
function trackBCOrder(storehash, token, email, orderId, response) {  
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/orders?email=${email}&max_id=${orderId}&min_id=${orderId}`,{
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-auth-token': token
    }
  })
  .then(r=>{
    if (r.status==200) {
      return r.json();
    } else {
      return [];
    }
  })
  .then(r=>{    
    if (r.length>0) {
      fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/orders/${orderId}/shipments`, {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-auth-token': token
        }
      })
      .then(r1=>{
        if (r1.status==200) {
          return r1.json();
        } else {
          return [];
        }
      })
      .then(r1=>{
        if (r1.length>0) {
          let urls=[];
          for (let rr of r1) {
            urls.push(`https://www.aftership.com/track/${rr.tracking_carrier}/${rr.tracking_number}`);
          }
          response.json({urls, status: r[0].custom_status});
        } else {          
          response.json({status: r[0].custom_status});          
        }
      })
      .catch(e=>{
        console.log(e);
        response.json({status: r[0].custom_status});
      })
    } else {
      response.json({status: "There is no such order"});
    }
  })
  .catch(e=>{
    console.log(e);
    response.json({result: "error", message: e});
  })
}
app.get("/track-by-email-order", cors(corsOptions), (request, response)=> {  
  let {storeId, email, orderId} = url.parse(request.url, true).query;  
  if (storeId==process.env.bc_store_id) {
    trackBCOrder(process.env.bc_storehash, process.env.bc_tokenmo, email, orderId, response);
  } else if (storeId==process.env.bc_store1_id) {
    trackBCOrder(process.env.bc_storehash1, process.env.bc_tokenmo1, email, orderId, response);
  } else {
    response.json({result:"none"});
  }
});
app.options("/post-remaze-newsupplier", cors());
app.post("/post-remaze-newsupplier", cors(corsOptions), (request,response) => {
  let {conversation} = request.body; 
  console.log(conversation);
  fetch(`https://superhairpieces.reamaze.io/api/v1/conversations`, {
    method: "POST",
    headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': process.env.reamaze_token
    },
    body: JSON.stringify({
      conversation
    })
  })
  .then(r=>{
    console.log(r);
    return r.json();
  })
  .then(r=>{
    response.json(r);
  })
  .catch(e=>console.log(e));
});
app.post("/test-webhook-docusign", (request, response)=> {
  console.log(request.body);
  response.json({test: "running"});
})
app.post("/ss-td-shipment", (request, response)=> {
  console.log(request.body);
  console.log("shipstation order shipped");
  response.json({result: "done"});
});
app.post("/ss-td-shipment1", (request,response) => {
  console.log(request.body);
  console.log("shipstation item shipped");
  response.json({result: " done"});
})
app.options("/upload_shpsupplier", cors());
app.post("/upload_shpsupplier", cors(corsOptions), uploadSHPSupplier.array("files"), uploadSHPSupplierFiles);

function uploadSHPSupplierFiles(request, response) {
  response.json({ message: "Successfully uploaded files" });
}
function skuvaultRemoveItem(warehouseId, locationId, sku, quantity, response) {  
  console.log({
      Sku: sku,
      WarehouseId: warehouseId,
      LocationCode: locationId,
      Quantity: quantity,
      Reason: 'called  trafering out from teamdesk',
      TenantToken: process.env.skuvault_tenant_token,
      UserToken: process.env.skuvault_user_token
    });
  fetch(`https://app.skuvault.com/api/inventory/removeItem`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      Sku: sku,
      WarehouseId: warehouseId,
      LocationCode: locationId,
      Quantity: quantity,
      Reason: 'Transfer Out',
      TenantToken: process.env.skuvault_tenant_token,
      UserToken: process.env.skuvault_user_token
    })
  })
  .then(r=>{
    console.log(r);
    response.status(r.status).json({message: "done"});
  })  
  .catch(e=>{
    console.log(e);
    response.status(500).json({error:"There is error"});
  });
}
function skuvaultAddItem(warehouseId, locationId, sku, quantity, response) {  
  fetch(`https://app.skuvault.com/api/inventory/addItem`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      Sku: sku,
      WarehouseId: warehouseId,
      LocationCode: locationId,
      Quantity: quantity,
      Reason: 'Transfer In',
      TenantToken: process.env.skuvault_tenant_token,
      UserToken: process.env.skuvault_user_token
    })
  })
  .then(r=>{
    console.log(r);
    response.status(r.status).json({message: "done"});
  })  
  .catch(e=>{
    console.log(e);
    response.status(500).json({error:"There is error"});
  });
}
app.post("/teamdesk-transfer-status", (request,response)=>{
  let {status,sku,quantity, hairCut} = request.body;  
  console.log(request.body);
  if (hairCut && status && sku && quantity) {
    if (hairCut == "Yes") {      
      response.json({result: "done"});
    } else {      
      fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_inv_tb}/select.json?filter=Any([SKU],'${encodeURIComponent(sku)}')`)
      .then(r=>r.json())
      .then(r=>{
        // console.log(r);
        if (r.length>0) {
          let cls = r[0].Classification;
          console.log(cls);
          if (cls) {          
            if (cls.toLowerCase().includes("men") || cls.toLowerCase().includes("supply") || cls.toLowerCase().includes("ext")) {
              fetch(`https://app.skuvault.com/api/inventory/getWarehouses`, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  TenantToken: process.env.skuvault_tenant_token,
                  UserToken: process.env.skuvault_user_token
                })
              })
              .then(r=>r.json())
              .then(r=>{
                console.log(r);
                console.log(status[0]);
                console.log(cls.toLowerCase());
                if (r.Warehouses) {
                  if (status.toLowerCase().includes("started")) {
                    if (status[0]=='C') {
                      //remove from Canada warehouse
                      let wh = r.Warehouses.filter(w=>w.Code=="WH1");
                      if (wh.length>0) {
                        let locId = null;
                        if (cls.toLowerCase().includes("men")) {
                          locId="P1";
                        } else if (cls.toLowerCase().includes("supply")) {
                          locId="A1";
                        } else if (cls.toLowerCase().includes("ext")) {
                          locId="E1";
                        }
                        if (locId) {
                          skuvaultRemoveItem(wh[0].Id, locId, sku, quantity, response); 
                        } else {
                          response.json({"message": "no content"});
                        }
                      } else {
                        response.json({"message": "no content"});
                      }
                    } else if (status[0]=='U') {
                      let wh = r.Warehouses.filter(w=>w.Code=="2");
                      if (wh.length>0) {
                        let locId = null;
                        if (cls.toLowerCase().includes("men")) {
                          locId="P2";
                        } else if (cls.toLowerCase().includes("supply")) {
                          locId="A2";
                        } else if (cls.toLowerCase().includes("ext")) {
                          locId="E2";
                        }
                        if (locId) {
                          skuvaultRemoveItem(wh[0].Id, locId, sku, quantity, response); 
                        } else {
                          response.json({"message": "no content"});
                        }
                      } else {
                        response.json({"message": "no content"});
                      }
                    } else {
                      response.json({"message": "no content"});
                    }
                  } else if (status.toLowerCase().includes("received")) {
                    if (status[0]=='C') {
                      //add to Canada warehouse
                      let wh = r.Warehouses.filter(w=>w.Code=="WH1");
                      if (wh.length>0) {
                        let locId = null;
                        if (cls.toLowerCase().includes("men")) {
                          locId="P1";
                        } else if (cls.toLowerCase().includes("supply")) {
                          locId="A1";
                        } else if (cls.toLowerCase().includes("ext")) {
                          locId="E1";
                        }
                        if (locId) {
                          skuvaultAddItem(wh[0].Id, locId, sku, quantity, response); 
                        }                    
                      }
                    } else if (status[0]=='U') {
                      let wh = r.Warehouses.filter(w=>w.Code=="2");
                      if (wh.length>0) {
                        let locId = null;
                        if (cls.toLowerCase().includes("men")) {
                          locId="P2";
                        } else if (cls.toLowerCase().includes("supply")) {
                          locId="A2";
                        } else if (cls.toLowerCase().includes("ext")) {
                          locId="E2";
                        }
                        if (locId) {
                          skuvaultAddItem(wh[0].Id, locId, sku, quantity, response); 
                        }
                      }
                    } else {
                      response.json({"message": "no content"});
                    }
                  } else {
                    response.json({"message": "no content"});
                  }
                } else {
                  response.json({"message": "could not find warehouse"});
                }
              })
              .catch(e=>{
                console.log(e);
                response.json({"message": "could not find warehouse"});
              });
            }
          } else {
            response.json({"message": "there no classification"});
          }
        } else {
          response.json({"message": "could not find sku"});
        }
      })
      .catch(e=>{
        console.log(e);
        response.json({"message": "could not find sku or status"});
      });
    }
  } else {
    response.json({"message": "no content"});
  }  
})
function getBCVariantFromProductID(product_id, storehash, token, response) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products/${product_id}/variants?limit=250`,{
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-auth-token': token
    }
  })
  .then(r=>r.json())
  .then(r=>{    
    response.json(r);
  })
  .catch(e=>{
    console.log(e);
    response.josn(e);
  })
}
app.get("/get-bc-variant-by-product", cors(corsOptions), (request, response)=> {
  const queryObject = url.parse(request.url, true).query;  
  let {product_id,store_id} = queryObject;  
  // console.log(queryObject);
  if (store_id==process.env.bc_store_id) {
    getBCVariantFromProductID(product_id, process.env.bc_storehash, process.env.bc_token, response);
  } else if (store_id==process.env.bc_store1_id) {
    getBCVariantFromProductID(product_id, process.env.bc_storehash1, process.env.bc_token1, response);
  } else if (store_id==process.env.bc_store_sandbox_id) {
    getBCVariantFromProductID(product_id, process.env.bc_sandbox_storehash, process.env.bc_sandbox_token, response);
  } else {
    response.json({error: 'non exist store id'});
  }
});
function getProductModifiers(id, storehash, token, response) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products/${id}/modifiers`,{
    headers: {
      "x-auth-token": token
    }
  })
  .then(r=>r.json())
  .then(r=>response.json(r))
  .catch(e=>response.json(e))
}
app.get("/get-product-modifiers", cors(corsOptions), (request, response)=> {
  let {store_id, product_id} = url.parse(request.url, true).query;    
  if (store_id==process.env.bc_store_id) {
    getProductModifiers(product_id, process.env.bc_storehash, process.env.bc_token, response);
  } else if (store_id==process.env.bc_store1_id) {
    getProductModifiers(product_id, process.env.bc_storehash1, process.env.bc_token1, response);
  } else if (store_id==process.env.bc_store_sandbox_id) {
    getProductModifiers(product_id, process.env.bc_sandbox_storehash, process.env.bc_sandbox_token, response);
  } else {
    response.json({error: 'non exist store id'});
  }
});
function getProductsInBCByIds(storehash, token, id, response) {  
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products?include_fields=id%2Cprimary_image%2Csku%2Cprice%2Ccustom_url%2Cname&include=primary_image&id%3Ain=${encodeURIComponent(id)}`, {
    headers: {
      "x-auth-token": token
    }
  })
  .then(r=>r.json())
  .then(r=>response.json(r))
  .catch(e=>response.json(e));
}
app.get("/first-products", cors(corsOptions), (request,response)=> {
  let {storehash, id} = url.parse(request.url, true).query;    
  if (storehash==process.env.bc_storehash) {
    getProductsInBCByIds(storehash,process.env.bc_token,id,response);
  } else if (storehash == process.env.bc_storehash1) {
    getProductsInBCByIds(storehash,process.env.bc_token,id,response);
  } else {
    response.json({error:"there is no such store"});
  }
});
async function getBCCustomer1(storehash, token, q, qname, response) {
  const resG = await fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/customer_groups`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-auth-token': token
    }
  });
  let group = await resG.json();
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/customers?${qname}%3Ain=${q}&limit=250`, {
    headers: {
      'x-auth-token': token,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
  .then(r=>{
    console.log(r);
    return r.json();
  })
  .then(r=> {       
    console.log(`https://api.bigcommerce.com/stores/${storehash}/v3/customers?${qname}%3Ain=${q}&limit=250`);
    r.group = group;
    response.json(r);
  })
  .catch(e=>response.json(e));
}
app.get("/get-bc-customer", cors(corsOptions), async (request, response)=> {
  let {q,storehash,qname} = url.parse(request.url, true).query;
  console.log(q);
  if (storehash==process.env.bc_storehash) {
    getBCCustomer1(storehash, process.env.bc_token, q, qname, response);
  } else if (storehash == process.env.bc_storehash1) {
    getBCCustomer1(storehash, process.env.bc_token1, q, qname, response);
  } else if (storehash == process.env.bc_sandbox_storehash) {
    getBCCustomer1(storehash, process.env.bc_sandbox_token, q, qname, response);
  } else {
    response.json({});
  }
});
function getBCOrderProduct(storehash, token, orderId, result, response) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/orders/${orderId}/products`, {
    headers: {
      "x-auth-token": token,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
  .then(r=>r.json())
  .then(r=> {
    if (r.length>0) {
      result.products = r;
      response.json(result);
    } else {
      response.json({error: "no data"});
    }
  })
  .catch(e=>response.json(e));
}
function sendGCEmail(id, email) {
  fetch(`https://api.omnisend.com/v3/events/${id}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.oms_genc_api,
      accept: 'application/json'
    },
    body: JSON.stringify({
      email
    })
  })
  .then(r=>{
    console.log(r);
  })  
  .catch(e=>{
    console.log(e);          
  }); 
}
function getBCOrder(storehash, token, orderId, response) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/orders/${orderId}`, {
    method: 'GET',
    headers: {
      "x-auth-token": token,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
  .then(r=>r.json())
  .then(r=> {    
    if (r.id) {
      if (storehash==process.env.bc_genc_storehash) {
        if (r.payment_method=="E-Transfer") {
          sendGCEmail(process.env.oms_genc_etransfer,r.email);
        } else if (r.payment_method=="Pay in Store") {          
        }
        return;
      }
      getBCOrderProduct(storehash, token, orderId, r, response);
    } else {
      response.json({error: "no data"});
    }
  })
  .catch(e=>response.json(e));
}
app.get("/bc-order-and-product",cors(corsOptions), (request,response)=> {
  let {storeId,orderId} = url.parse(request.url, true).query;
  console.log(storeId);
  if (storeId == process.env.bc_store_id) {
    getBCOrder(process.env.bc_storehash, process.env.bc_tokenmo, orderId, response);
  } else if (storeId == process.env.bc_store1_id) {        
    getBCOrder(process.env.bc_storehash1, process.env.bc_token1mo, orderId, response);
  } else if (storeId == process.env.bc_store_sandbox_id) {
    getBCOrder(process.env.bc_sandbox_storehash, process.env.bc_sandbox_token, orderId, response);
  } else {
    response.json({error: "no data"});
  }
});
app.get("/stamped-email-review", cors(corsOptions), (request,response) => {
  let {domain,email} = url.parse(request.url, true).query;  
  let uGet = domain=='com'?`https://stamped.io/api/v2/${process.env.stamped_us_storehash}/survey/reviews?page=1&filter&state=sent, pending, archive&search=${email}`:`https://stamped.io/api/v2/${process.env.stamped_canada_storehash}/survey/reviews?page=1&filter&state=sent, pending, archive&search=${email}`;      
  console.log(uGet)
  fetch(uGet, {    
    headers: {
      Authorization: process.env.stamped_auth,
      Accept: 'application/json'
    }
  })
  .then(r=> r.json())
  .then(r=> {
    console.log(r)
    response.json(r);
  })
  .catch(e=>{
    response.json(e);
  })
});
function updateTeamdeskCC(cc) {
  fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/Client/upsert.json`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify(cc)
  })
  .then(r=>r.json())
  .then(r=> {
    console.log("cc");
    console.log(r);
  })
  .catch(e=>{    
    console.log(e)    
  }); 
}
function updateBCStoreCredit(cc,cd,storehash,token) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/customers`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      'x-auth-token': token
    },
    body: JSON.stringify([
      {
        email: cc.Email,
        id: Number(cd.id),
        store_credit_amounts: [
          {
            amount: Number(cd.amount)
          }
        ]
      }
    ])            
  })
  .then(r=>r.json())
  .then(r=>{
    console.log("store credit");
    console.log(util.inspect(r,false,null,true));
  })
  .catch(e=>console.log(e));
}
function chromeCheckSuccessPayment(storehash, tokenO, tokenC, response, cc, cd) {
  // console.log("chrome check success payment");
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/orders?email=${cc.Email}&sort=id%3Adesc`, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-auth-token': tokenO
    }
  })
  .then(r=>r.json())
  .then(r=> {
    if (r.length>0) {
      //if (r[0].order_source=="manual" && r[0].payment_method.toLowerCase().includes("credit card")) {      
      if (r[0].order_source=="manual" && new Date()-new Date(r[0].date_created)<4e4) {        
        if (r[0].payment_status=="captured" && r[0].payment_method.toLowerCase().includes("credit card")) {          
          if (cc.hasOwnProperty("Card #")) {
            cc["Input Card A"] = Number(cc["Card #"])+Math.pow(cc.Id, 2)+2046;  
            cc["Card #"]=null;       
            updateTeamdeskCC(cc);
          }
          if (cd.hasOwnProperty("amount")) {
            if (Number(cd["amount"])) {
              updateBCStoreCredit(cc,cd,storehash,tokenC);
            }
          }        
        } else if (r[0].payment_status=="paid" && r[0].payment_method.length==0) {
          if (cd.hasOwnProperty("amount")) {
            if (Number(cd["amount"])) {
              updateBCStoreCredit(cc,cd,storehash,tokenC);
            }
          }
        }
      }
    }
  })  
}
app.options("/post-chrome-payment", cors());
app.post("/post-chrome-payment", cors(corsOptions), (request, response)=> {  
  // console.log(request.body);
  let {cc,cd,storehash} = request.body;      
  response.json({result: "working on it.."});
  setTimeout(function() {    
    if (storehash==process.env.bc_storehash) {
      chromeCheckSuccessPayment(storehash, process.env.bc_tokenmo, process.env.bc_tokenmc, response, cc, cd);
    } else if (storehash==process.env.bc_storehash1) {
      chromeCheckSuccessPayment(storehash, process.env.bc_token1mo, process.env.bc_token1mc, response, cc, cd);
    }
  },3e4);
});
function getBCCustomerWithStoreCredit(storehash, token, id, response) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/customers?include=storecredit&id%3Ain=${id}`, {
    headers: {
      accept: 'application/json',
      'x-auth-token': token
    }
  })
  .then(r=>r.json())
  .then(r=>{
    response.json(r);
  })
  .catch(e=>{
    response.json(e);
  })
}
app.get("/get-chrome-bc-customer", cors(corsOptions), (request, response)=> {
  let {storehash, id} = url.parse(request.url, true).query;
  if (storehash==process.env.bc_storehash) {
    getBCCustomerWithStoreCredit(storehash, process.env.bc_tokenmc, id, response);
  } else if (storehash==process.env.bc_storehash1) {
    getBCCustomerWithStoreCredit(storehash, process.env.bc_token1mc, id, response);
  } else if (storehash==process.env.bc_sandbox_storehash) {
    getBCCustomerWithStoreCredit(storehash, process.env.bc_sandbox_token, id, response);
  } else {
    response.json({error: "there is no such data"});
  }
});
function getProductsInBC(storehash, token, response, skus, result=[], idx=0) {  
  if (idx<skus.length) {    
    fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products?sku=${skus[idx].sku}&include=primary_image`, {
      headers: {
        "x-auth-token": token,
        accept: "application/json"
      }
    })
    .then(r=>r.json())
    .then(r=>{      
      if (r.data) {
        result = [...result, ...r.data];
        result[result.length-1].classification=skus[idx].classification;
        getProductsInBC(storehash, token, response, skus, result, idx+1);
      }
    })
    .catch(e=>{
      console.log(e);
      getProductsInBC(storehash, token, response, skus, result, idx+1);
    })
  } else {
    response.json({data: result});
  }
}
app.options("/get-homepage-products", cors());
app.post("/get-homepage-products", cors(corsOptions), (request, response)=> {
  let {skus,store_id} = request.body;  
  if (store_id==process.env.bc_store_id) {
    getProductsInBC(process.env.bc_storehash, process.env.bc_tokenmp, response, skus);
  } else if (store_id==process.env.bc_store1_id) {
    getProductsInBC(process.env.bc_storehash1, process.env.bc_token1mp, response, skus);
  } else {
    response.json({data:[]});
  }
});
app.post("/teamdesk-release-skuvault", (request, response)=> {
  let {sku} = request.body;
  response.json({response: "done"});
  let release = {};
  release[sku] = 1;
  fetch(`https://app.skuvault.com/api/sales/releaseHeldQuantities`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      TenantToken: process.env.skuvault_tenant_token,
      UserToken: process.env.skuvault_user_token,
      SkusToRelease: release
    })
  })
    .then(r => r.json())
    .then(d => {
      console.log(d);
      console.log("release from SKUVault");
    })
    .catch(e => {
      console.log(e);
      console.log("Could not release from SKUVault");
    });
});
app.post("/teamdesk-hold-skuvault", (request,response)=>{
  let {sku, desp, duration} = request.body;  
  let exp = new Date();  
  if (Number(duration.split(" ")[0])>0) {
    exp.setHours(exp.getHours()+Number(duration.split(" ")[0]));
  } else {
    exp.setHours(exp.getHours()+24);
  }  
  response.json({response:"done"});
  fetch(`https://app.skuvault.com/api/sales/createHolds`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      TenantToken: process.env.skuvault_tenant_token,
      UserToken: process.env.skuvault_user_token,
      Holds: [{
        Sku: sku,
        Quantity: 1,
        ExpirationDateUtc: exp,
        Description: desp
      }]
    })
  })
    .then(r => r.json())
    .then(d => {
      console.log(d);
      console.log("holded in SKUVault");
    })
    .catch(e => {
      console.log(e);
      console.log("Could not hold in SKUVault");
    });
})
function getBCVariantFromSKU(sku, storehash, token, response) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/catalog/variants?sku=${sku}`,{
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-auth-token': token
    }
  })
  .then(r=>r.json())
  .then(r=>{    
    response.json(r);
  })
  .catch(e=>{
    console.log(e);
    response.josn(e);
  })
}
app.get("/get-bc-variant", cors(corsOptions), (request, response)=> {
  const queryObject = url.parse(request.url, true).query;  
  let {sku,store_id} = queryObject;  
  console.log(queryObject);
  if (store_id==process.env.bc_store_id) {
    getBCVariantFromSKU(sku, process.env.bc_storehash, process.env.bc_token, response);
  } else if (store_id==process.env.bc_store1_id) {
    getBCVariantFromSKU(sku, process.env.bc_storehash1, process.env.bc_token1, response);
  } else if (store_id==process.env.bc_store_sandbox_id) {
    getBCVariantFromSKU(sku, process.env.bc_sandbox_storehash, process.env.bc_sandbox_token, response);
  } else {
    response.json({error: 'non exist store id'});
  }
});
function addCustomItemToCart(storehash, data, response, token) {
  let url = `https://api.bigcommerce.com/stores/${storehash}/v3/carts?include=redirect_urls`;
  if (data.cart_id) {    
    url=`https://api.bigcommerce.com/stores/${storehash}/v3/carts/${data.cart_id}/items`;
  }
  console.log(url);
  fetch(url, {
    method: 'post',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-auth-token': token
    },
    body: JSON.stringify({
      custom_items: [
        {
          sku: crypto.randomBytes(16).toString("hex"),
          name: data.name,
          quantity: data.quantity,
          list_price: data.price
        }
      ]
    })
  })
  .then(r=>r.json())
  .then(d=> {
    console.log(d);
    const db = new sqlite3.Database(dbFile, (err)=> {
      if (err) {
        console.log(err.message);
      }
      db.serialize(() => {
        //gender: f_10905319 <== 1 as men, 0 as women
        
        //men's toupee base: f_13766033        
        //left-right size: f_10902828
        //front-back size: f_10902829                
        //grey percentage: f_10902826        
        //grey hair type: f_10902827                        
        //front hairline shape: f_10902819        
        //additional service <==> Empty Lace or Skin 空余网底的处理 : f_10902843
        
        //women's toupee base: f_13766034
        //base size <==> Size Category f_10902806
        
        //sample type: f_10902814
        //hair density: f_10902823
        //hair type: f_10902822
        //hair style : f_10902821 <==> men hair direction + men addtional options + men hair style final option // <==> women hair style
        //hair length: f_10902808 <==> men hair length // <==> women finished length
        //hair color: f_10902825
        //wave and curl: f_10902824
        //match skin tone <==> men Base Material Color : f_10902830 // <==> women Skin Tone Base
        //additional information <==> Notes // <==> women highlight + additional information 
        db.run(
          `CREATE TABLE IF NOT EXISTS CustomMade (id INTEGER PRIMARY KEY AUTOINCREMENT, cartId TEXT, gender INTEGER DEFAULT 1, toupeeBase TEXT, sampleType TEXT, leftRightSize TEXT, frontBackSize TEXT, hairLength TEXT, hairColor TEXT, greyPercentage TEXT, hairType TEXT, greyHairType TEXT, density TEXT, hairStyle TEXT,waveCurl TEXT, frontHairline TEXT, baseMaterialColor TEXT DEFAULT 'Factory Default', additionalService TEXT, notes TEXT, baseSize TEXT, quantity INTEGER, dateCreated INTEGER, price INTEGER)`, function() {
            db.all(`SELECT cartId from CustomMade where cartId='${d.data.id}'`, function(err,rows) {
              if (rows) {
                if (rows.length==1) {
                  db.run(
                    `Update CustomMade SET gender=${data.gender},toupeeBase=${data.toupeeBase},sampleType=${data.sampleType},leftRightSize=${data.leftRightSize},frontBackSize=${data.frontBackSize},hairLength=${data.hairLength},hairColor=${data.hairColor},greyPercentage=${data.greyPercentage},hairType=${data.hairType},greyHairType=${data.greyHairType},density=${data.density},hairStyle=${data.hairStyle},waveCurl=${data.waveCurl},frontHairline=${data.frontHairline},baseMaterialColor=${data.baseMaterialColor},additionalService=${data.additionalService},notes=${data.notes},baseSize=${data.baseSize},quantity=${data.quantity},dateCreated=${Date.now()},price=${data.price}where id=${rows[0].id}`,
                    error => {
                      db.close();
                      if (error) {
                        console.log("error insert");
                        console.log(error);
                        response.json(error);
                      } else {
                        response.json(d);    
                      }
                    }
                  );  
                } else if (rows.length==0) {
                  db.run(
                    `INSERT INTO CustomMade (cartId, gender, toupeeBase, sampleType, leftRightSize, frontBackSize, hairLength, hairColor, greyPercentage, hairType, greyHairType, density, hairStyle,waveCurl, frontHairline, baseMaterialColor, additionalService, notes, baseSize, quantity, dateCreated, price) VALUES ('${d.data.id}', ${data.gender}, '${data.toupeeBase}', '${data.sampleType}', '${data.leftRightSize}', '${data.frontBackSize}', '${data.hairLength}', '${data.hairColor}', '${data.greyPercentage}', '${data.hairType}', '${data.greyHairType}', '${data.density}', '${data.hairStyle}', '${data.waveCurl}', '${data.frontHairline}', '${data.baseMaterialColor}', '${data.additionalService}', '${data.notes}', '${data.baseSize}','${data.quantity}', ${Date.now()}, ${data.price})`,
                    error => {
                      db.close();
                      if (error) {
                        console.log("error insert");
                        console.log(error);
                        response.json(error);
                      } else {
                        response.json(d);    
                      }
                    }
                  );  
                } else {
                  console.log(rows.length);
                  console.log(util.inspect(rows, false, null, true));
                  console.log("data error");
                  response.json(d);
                }
              } else {
                db.run(
                  `INSERT INTO CustomMade (cartId, gender, toupeeBase, sampleType, leftRightSize, frontBackSize, hairLength, hairColor, greyPercentage, hairType, greyHairType, density, hairStyle,waveCurl, frontHairline, baseMaterialColor, additionalService, notes, baseSize, quantity, dateCreated, price) VALUES ('${d.data.id}', ${data.gender}, '${data.toupeeBase}', '${data.sampleType}', '${data.leftRightSize}', '${data.frontBackSize}', '${data.hairLength}', '${data.hairColor}', '${data.greyPercentage}', '${data.hairType}', '${data.greyHairType}', '${data.density}', '${data.hairStyle}', '${data.waveCurl}', '${data.frontHairline}', '${data.baseMaterialColor}', '${data.additionalService}', '${data.notes}', '${data.baseSize}','${data.quantity}', ${Date.now()}, ${data.price})`,
                  error => {
                    db.close();
                    if (error) {
                      console.log("error insert");
                      console.log(error);
                      response.json(error);
                    } else {
                      response.json(d);    
                    }
                  }
                );  
              }
            })
          }
        );
      });
    });    
  })
  .catch(e=>{
    console.log(e);
    response.json(e);
  })
}
app.options("/bc-add-custom-made", cors());
app.post("/bc-add-custom-made", cors(corsOptions), (request,response) => {
  console.log(request.body);
  if (request.body) {    
    let { store_id, data } = request.body;    
    if (store_id == process.env.bc_store_id) {
      addCustomItemToCart(
        process.env.bc_sandbox_storehash,
        data,
        response,
        process.env.bc_sandbox_token        
      )
    } else if (store_id == process.env.bc_store1_id) {
      
    }
  }
});
// app.options("/bc-checkout-custom-made", cors());
// app.post("/bc-checkout-custom-made", cors(corsOptions), (request, response) => {
//   console.log(request.body);
//   let {cart_id} = request.body;
//   db.serialize(() => {
//     db.each(
//       `SELECT * from CustomMade WHERE cartId='${cart_id}' or dateCreated+${864E5*7}>${Date.now()}`,
//       (err, row) => {
//         console.log("row", row);
//         if (row.id==cart_id) {
//           db.run(`DELETE FROM CustomMade WHERE id=?`, row.id, error => {
//             if (row) {
//               // add to teamdesk
//               console.log(row);
//               console.log('add teamdesk');
//             }
//           }); 
//         } else {
//           db.run(`DELETE FROM CustomMade WHERE id=?`, row.id, error => {
//             if (error) {
//               console.log(error);
//             }
//           });
//         }      
//       },
//       err => {
//         if (err) {
//           response.json(err);
//         } else {
//           response.json({ message: "success" });
//         }
//       }
//     );
//   });   
// });
// let rule1 = new schedule.RecurrenceRule();
// rule1.date = 1;
// rule1.hour = 22;
// rule1.minute = 28;
// rule1.tz = 'Canada/Eastern';
// const delLog= schedule.scheduleJob(rule1, function(){
//   console.log('Delete Old Logs');  
//   deleteOldLogs();
// });
function getWishlistReady(response,dt=[], skip=0, limit=500) {
  fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_wishlist_tb}/select.json?filter=[Quantity on Hand]>0 and [Order Status]<>'Closed' and [Standard or Customized]='Standard' and [Email]<>'georgesmile@gmail.com' and [Order Status]<>'Wish List Closed' and [Order Status]<>'Wish List Notified' and [Order Status]<>'Canceled'&column=*&column=Date Created&column=Invoice %23&column=Quantity on Hand&column=Incoming Quantity&column=Arrival Date First Shipment&column=First Name&column=Last Name&sort=SKU&sort=Date Created&skip=${skip}&top=${limit}`)
  .then(r=>r.json())
  .then(r=>{
    if (r.length>0) {
      dt=[...dt, ...r];      
      getWishlistReady(response,dt, skip+limit, limit);      
    } else {      
      response.json(dt);
    }
  })
  .catch(e=>{
    console.log(e)
  })
}
app.get("/wishlist-ready", cors(corsOptions),(request, response)=> {
  getWishlistReady(response);
})
app.get("/wishlist-link", cors(corsOptions), (request, response)=> {
  const queryObject = url.parse(request.url, true).query;  
  let {id} = queryObject;
  response.json({url: `https://www.teamdesk.net/secure/db/${process.env.teamdesk_store}/preview.aspx?t=${process.env.teamdesk_wishlist_tb_id}&id=${id}`});
})
function checkEmail(storehash, token, response) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/customers`, {
    headers: {
      'x-auth-token': token      
    }
  })
  .then(r=>r.json())
  .then(r=>{
    if (r.data) {
      if (r.data.length>0) {
        response.json({exist:true});
      } else {
        response.json({exist:false});
      }
    } else {
      response.json({exist:false});
    }
  })
  .catch(e=>{
    console.log(e)
    response.json({exist:false});
  });
}
app.get("/bc-customer-exist", cors(corsOptions), (request, response)=> {
  const queryObject = url.parse(request.url, true).query;  
  let {email, store_id} = queryObject;  
  console.log(queryObject);
  if (store_id==process.env.bc_store_id) {
    checkEmail(process.env.bc_storehash, process.env.bc_token, response);
  } else if (store_id==process.env.bc_store1_id) {
    checkEmail(process.env.bc_storehash1, process.env.bc_token1, response);
  } else if (store_id==process.env.bc_store_sandbox_id) {
    checkEmail(process.env.bc_sandbox_storehash, process.env.bc_sandbox_token, response);
  }
});
app.get("/teamdesk-wishlist", cors(corsOptions), (request,response)=>{
  const queryObject = url.parse(request.url, true).query;  
  let {email} = queryObject;
  fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_wishlist_tb}/select.json?filter=Any([Email],'${email}') and Contains([Notes],'Request sent from') and [Type]='Wish List --  Not Paid Yet'`)
  .then(r=>r.json())
  .then(r=>{    
    if (r) {
      let skus = r.map(t=>t.SKU);      
      fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_inv_tb}/select.json?filter=Any([SKU],'${encodeURIComponent(skus.join(","))}')&column=*&column=Unlocked for sale quantity&column=Total Request Quantity`)
      .then(r=>r.json())
      .then(r=>{        
        response.json(r);   
      })
    } else {
      response.json(r);
    }    
  })
  .catch(e=>console.log(e));
});
function createTdShipping(sm, invoiceNo=null, init=true) {
  fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_shipment}/upsert.json`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(sm)
  })
  .then(r=>r.json())
  .then(r=>{
    console.log(util.inspect(r, true, null, false));
    if (r[0].id && init && invoiceNo) {
      createTdShipping({"@row.id": r[0].id, "Invoice": invoiceNo}, false);
    }
  })
  .catch(e=>console.log(e));
}
function createTdShipmentItem(ss, trackingUrl) {
  let td = {
    "Email": ss.customerEmail,
    "Order Number": ss.orderKey,    
    "Tracking #": ss.trackingNumber,
    "Shipment ID in BC": ss.shipmentId,
    "Shipment Cost": ss.shipmentCost,
    "Store ID": ss.advancedOptions.storeId,
    "to City": ss.shipTo.city,
    "to State": ss.shipTo.state,
    "to Country": ss.shipTo.country,
    "to Street": ss.shipTo.street1,
    "Warehouse Code": ss.warehouseId,
    "Shipping Method": ss.serviceCode,
    "Tracking URL": trackingUrl
  }  
  if (ss.shipmentItems) {
    if (ss.shipmentItems.length>0) {
      let items = [];
      for (let i of ss.shipmentItems) {
        if (i.sku) {
          if (i.sku.length>0) {
            items.push(`${i.quantity} x ${i.sku}`);
          } else {
            items.push(`${i.quantity} x ${i.name}`);
          }
        }        
      }
      if (items.length>0) {
        td["Items"]=items.join("\r\n");
      }
    }
  }
  createTdShipping(td, ss.orderNumber);
}
// fedex:
// https://www.fedex.com/fedextrack/?trknbr={tracking_number}
// purolator
// https://www.purolator.com/en/shipping/tracker?pin={tracking_number}
// canada post
// https://www.canadapost-postescanada.ca/track-reperage/en#/details/{tracking_number}
// usps
// https://tools.usps.com/go/TrackConfirmAction.action?tLabels={tracking_number}
function getTdClientShipAddress(email,shipment, date) {  
  fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_client_tb}/select.json?filter=Any([Email],'${shipment.email?shipment.email:email}')`)
  .then(r=>r.json())
  .then(r=>{    
    if (Array.isArray(r)) {
      if (r.length>0) {
        let client = {
          "@row.id": r[0]["@row.id"],
          "Id": r[0]["Id"]
        };
        if (r[0]["Shipping Same as Above"]=="Yes") {
          if (r[0]["Billing Address Line 1"]!=shipment.street_1 ||
          r[0]["City"] != shipment.city ||
          r[0]["State"] != shipment.state ||
          r[0]["Zip"] != shipment.zip ||
          r[0]["Country"] != shipment.country){
            client["Shipping Same as Above"] = "No";
            client["Ship to Last Name"] = shipment.last_name?shipment.last_name:"";
            client["Ship to First Name"] = shipment.first_name?shipment.first_name:shipment.name;          
            client["Shipping Address Line 1"]=shipment.street_1?shipment.street_1:shipment.street1;
            client["Shipping Address Line 2"]=shipment.street_2?shipment.street_2:shipment.street2;
            client["Shipping Address City"]= shipment.city;
            client["Shipping Address State"] = shipment.state;
            client["Shipping Address Zip"] = shipment.zip?shipment.zip:shipment.postalCode;
            client["Shipping Address Country"] = shipment.country;
          }        
        } else {
          if (r[0]["Billing Address Line 1"]==shipment.street_1 &&
          r[0]["City"] == shipment.city &&
          r[0]["State"] == shipment.state &&
          r[0]["Zip"] == shipment.zip &&
          r[0]["Country"] == shipment.country) {
            client["Shipping Same as Above"] = "Yes";
          } else if (r[0]["Shipping Address Line 1"]!=shipment.street_1 ||
          r[0]["Shipping Address City"] != shipment.city ||
          r[0]["Shipping Address State"] != shipment.state ||
          r[0]["Shipping Address Zip"] != shipment.zip ||
          r[0]["Shipping Address Country"] != shipment.country) {
            client["Shipping Same as Above"] = "No";
            client["Ship to Last Name"] = shipment.last_name?shipment.last_name:"";
            client["Ship to First Name"] = shipment.first_name?shipment.first_name:shipment.name;          
            client["Shipping Address Line 1"]=shipment.street_1?shipment.street_1:shipment.street1;
            client["Shipping Address Line 2"]=shipment.street_2?shipment.street_2:shipment.street2;
            client["Shipping Address City"]= shipment.city;
            client["Shipping Address State"] = shipment.state;
            client["Shipping Address Zip"] = shipment.zip?shipment.zip:shipment.postalCode;
            client["Shipping Address Country"] = shipment.country;
          }
        }
        client["Last Ship Out Date"] = date.toISOString();
        // console.log(util.inspect(client,true, null, false));
        createTdClient(client);        
      }
    }
  })
  .catch(e=>{
    console.log(e);
  })
}
function getSSShipment(url, token) {
  fetch(url, {
    headers: {
      authorization: token
    }
  })
  .then(r=>r.json())
  .then(r=>{
    if (r.shipments) {
      if (r.shipments.length>0) {
        let sm = r.shipments[0];
        let url = null;
        if (sm.carrierCode.includes("fedex")) {
          url = `https://www.fedex.com/fedextrack/?trknbr=${sm.trackingNumber}`
        } else if (sm.carrierCode.includes("purolator")) {
          url = `https://www.purolator.com/en/shipping/tracker?pin=${sm.trackingNumber}`
        } else if (sm.carrierCode.includes("canada")) {
          url = `https://www.canadapost-postescanada.ca/track-reperage/en#/details/${sm.trackingNumber}`;
        } else if (sm.serviceCode.includes("usps")) {
          url = `https://tools.usps.com/go/TrackConfirmAction.action?tLabels=${sm.trackingNumber}`;
        }
        createTdShipmentItem(sm, url);
        getTdClientShipAddress(sm.customerEmail, sm.shipTo, new Date(sm.createDate));
      }
    }
  })
}
app.get("/test-change-teamdesk-shipment", (request, response) => {
  let {shipments} = request.body;
  response.json({test:"running"})
  let sm = shipments[0];
  getTdClientShipAddress(sm.customerEmail, sm.shipTo, new Date(sm.createDate));
})
app.get("/webhook-sendcloud-shipment", (request, response) => {
  response.json({result: "working on it"});  
  let currentDate = new Date().toISOString().split("T")[0];
  let noteLog="\n----------------GET\n";
  noteLog+=new Date().toISOString()+"\n";
  noteLog+=`${JSON.stringify(request.url)}\n`;
  fs.appendFile(`./.data/sendcloud.log`, noteLog, function (err) {
    if (err) console.log(err);          
  });
});
app.put("/webhook-sendcloud-shipment", (request, response) => {
  response.json({result: "working on it"});
  console.log(util.inspect(request.body, false, null, true));
  let currentDate = new Date().toISOString().split("T")[0];
  let noteLog="\n----------------PUT\n";
  noteLog+=new Date().toISOString()+"\n";
  noteLog+=`${JSON.stringify(request.body)}\n`;
  fs.appendFile(`./.data/sendcloud.log`, noteLog, function (err) {
    if (err) console.log(err);          
  });
});
app.post("/webhook-sendcloud-shipment", (request, response) => {
  response.json({result: "working on it"});
  console.log(util.inspect(request.body, false, null, true));
  let currentDate = new Date().toISOString().split("T")[0];
  let noteLog="\n----------------POST\n";
  noteLog+=new Date().toISOString()+"\n";
  noteLog+=`${JSON.stringify(request.body)}\n`;
  fs.appendFile(`./.data/sendcloud.log`, noteLog, function (err) {
    if (err) console.log(err);          
  });
});
app.post("/webhook-ss-td-shipment-com", (request, response)=> {
  response.json({result: "working on it"});
  let {resource_url} = request.body;
  if (resource_url) {
    getSSShipment(resource_url, process.env.shipstation_token);
  }
});
app.post("/webhook-ss-td-shipment-ca", (request, response)=> {
  response.json({result: "working on it"});
  let {resource_url} = request.body;
  if (resource_url) {
    getSSShipment(resource_url, process.env.shipstation_token1);
  }
});
function deleteOldLogs() {
  let file = new Date(Date.now()-864E5*6*30).toISOString().split('T')[0].substring(0,7);
  glob(`./.data/${file}*.log`, null, function(er, files) {
    if (files.length>0) {
      for (let f of files) {
        try {
          fs.unlinkSync(f);          
        } catch(err) {
          console.error(err)
        }
      }
    }
  })
  glob(`./.data/manual-${file}*.log`, null, function(er, files) {
    if (files.length>0) {
      for (let f of files) {
        try {
          fs.unlinkSync(f);          
        } catch(err) {
          console.error(err)
        }
      }
    }
  })
}
app.post("/delete-old-data", (request,response)=>{
  response.json({test:'test'});  
  deleteOldLogs();
})
app.get("/time", (request, response)=> {
  console.log(new Date().toISOString());
  response.json({time:"runn"});
})
app.get("/get-chrome-client", cors(corsOptions), (request,response)=> {
  const queryObject = url.parse(request.url, true).query;
  console.log(queryObject);
  let {email} = queryObject;
  fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_client_tb}/select.json?filter=Any([Email],'${email}')`)
  .then(r=>r.json())
  .then(r=>{
    response.json(r)
  })
  .catch(e=>console.log(e));
});
app.get("/get-chrome-sku", cors(corsOptions), (request, response)=> {
  const queryObject = url.parse(request.url, true).query;
  let {sku}= queryObject;    
  console.log(sku);
  let selectURL = Array.isArray(sku)?`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_inv_tb}/select.json?filter=Any([SKU],'${encodeURIComponent(sku.join(','))}')&column=SKU`:`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_inv_tb}/select.json?filter=Any([SKU],'${encodeURIComponent(sku)}')&column=SKU`;  
  fetch(selectURL)
  .then(r=>r.json())
  .then(r=>{
    response.json(r);
  })
  .catch(e=>{
    console.log(e);
    response.json(e);
  })
});
function getProductFromBC(response, storehash, token, productId) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products/${productId}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-auth-token': token
    }
  })
  .then(r=>r.json())
  .then(r=>{
    if (r.data) {
      console.log(r.data.sku);
      let filter = `Any([Part Number],'${encodeURIComponent(r.data.sku)}')`;
      searchInventory(filter, response);
    }
  })
  .catch(e=>console.log(e));
}
app.get("/get-chrome-inventory", cors(corsOptions), (request, response) => {
  const queryObject = url.parse(request.url, true).query;
  console.log(queryObject);
  let {storehash, productId} = queryObject;
  if (storehash == process.env.bc_storehash) {
    getProductFromBC(response, storehash, process.env.bc_token, productId);
  } else if (storehash == process.env.bc_storehash1) {
    getProductFromBC(response, storehash, process.env.bc_token1, productId);
  } else {
    getProductFromBC(response, process.env.bc_sandbox_storehash, process.env.bc_sandbox_token, productId);
  }
})

function searchInventory(filter, response, result=[], skip=0, limit=500) {
  fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_inv_tb}/select.json?column=*&column=Unlocked for sale quantity&column=Total Request Quantity&column=Total On Hand&filter=${filter}&skip=${skip}&limit=${limit}`)
  .then(r=>r.json())
  .then(d=>{        
    if (d.length>0) {
      result = [...result, ...d];
      searchInventory(filter, response, result, skip+limit, limit);
    } else {      
      response.json(result);
    }
  })
  .catch(e=>console.log(e));
}
app.options("/search-inventory", cors());
app.post('/search-inventory', cors(corsOptions), (request, response) => {
  console.log(request.body);
  let {filter} = request.body;  
  searchInventory(filter, response);
});

app.get("/auth-squareup", (request, response)=> {
  const queryObject = url.parse(request.url, true).query;
  console.log(util.inspect(queryObject, true, null, false));
  response.json({test: 'done'});
})

app.get("/auth-instagram", (request, response)=> {
  const queryObject = url.parse(request.url, true).query;
  console.log(util.inspect(queryObject, true, null, false));
  response.json({test: 'done'});
})

app.get("/auth-temp",(request,response)=> {
  response.json({test: "done"});
});

function sendCustomerActivity(storehash, omnkey, email) {
  fetch(`https://stamped.io/api/v2/${storehash}/dashboard/customers?search=${email}`,
  {
    method: "get",
    headers: {
      Authorization: process.env.stamped_auth
    }
  })
  .then(r=>r.json())
  .then(d=>{
    if (d.results) {
      let customer = d.results[0].customer;
      let cDate = new Date(customer.dateLastActivityRewards);
      let dExpire = new Date(cDate.setMonth(cDate.getMonth()+24));
      fetch(`https://api.omnisend.com/v3/contacts?email=${email}`, {
        method: 'PATCH',
        headers: {
          "x-api-key": omnkey,
          "content-type": "application/json",
          'accept': 'application/json'
        },
        body: JSON.stringify({
          firstName: customer.first_name,
          lastName: customer.last_name,
          tags: ['source: Stamped API'],          
          customProperties: {
            stamped_ipAddressSource: customer.ipAddressSource,
            stamped_isSubscribed: customer.isSubscribed?customer.isSubscribed:false,
            stamped_rewards_points: customer.points?customer.points:0,
            stamped_totalSpent: customer.totalSpent?customer.totalSpent:0,
            stamped_isConfirmed: customer.isConfirmed?customer.isConfirmed:false,
            stamped_dateLastLogin: customer.dateLastLogin,
            stamped_dateLastActivityRewards: customer.dateLastActivityRewards,
            stamped_dateExipireRewards: dExpire.toISOString()
          }
        })
      })
      .then(r=>r.json())
      .then(d=>{
        console.log(d);
      })
      .catch(e=>console.log(e));
    }
  })
  .catch(e=>console.log(e));
}
app.post("/omn-rewards-update",(request, response)=> {
  console.log(request.body);
  response.json({result: "working rewards update..."});
  let {customer_email, date_created} = request.body;
  sendCustomerActivity(process.env.stamped_us_storehash, process.env.omnisend_key, customer_email);
})
app.post("/omn-rewards-update1",(request, response)=> {
  console.log(request.body);
  response.json({result: "working rewards update..."});
  let {customer_email, date_created} = request.body;
  sendCustomerActivity(process.env.stamped_canada_storehash, process.env.omnisend_key1, customer_email);
})

function getBCProducts1(response, storehash, token, data=[], page=1, limit=250) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products?limit=${limit}&page=${page}`,{
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-auth-token': token
    }
  })
  .then(r=>r.json())
  .then(r=> {
    if (r.data.length==0) {
      response.json(data);
    } else {
      data = [...data, ...r.data];
      console.log(page);
      getBCProducts1(response, storehash, token, data, page+1, limit);
    }
  })
}
app.get("/get-bc-products", cors(corsOptions), (request, response)=> {
  const queryObject = url.parse(request.url, true).query;
  if (queryObject.id === process.env.bc_store_id) {
    getBCProducts1(response, process.env.bc_storehash, process.env.bc_tokenmp);
  } else if (queryObject.id == process.env.bc_store1_id) {
    getBCProducts1(response, process.env.bc_storehash1, process.env.bc_token1mp);
  } else {
    response.json({ result: "Invalid store id" });
  }
})

function getBCCategories(
  response,
  storehash,
  token,
  data = [],
  page = 1,
  limit = 250
) {
  fetch(
    `https://api.bigcommerce.com/stores/${storehash}/v3/catalog/categories?limit=${limit}&page=${page}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-auth-token": token
      }
    }
  )
    .then(r => r.json())
    .then(d => {
      if (d.data) {
        if (d.data.length == 0) {          
          response.json(data);
        } else {
          data = [...data, ...d.data];
          getBCCategories(response, storehash, token, data, page + 1, limit);
        }
      }
    })
    .catch(e => {
      console.log(e);
      response.json(e);
    });
}
app.get("/get-bc-categories", cors(corsOptions), (request, response) => {
  const queryObject = url.parse(request.url, true).query;
  console.log(queryObject);
  if (queryObject.id == process.env.bc_store_id) {
    getBCCategories(
      response,
      process.env.bc_sandbox_storehash,
      process.env.bc_sandbox_token
    );
    // getBCCategories(response, process.env.bc_storehash, process.env.bc_tokenmp);
  } else if (queryObject.id == process.env.bc_store1_id) {
    getBCCategories(response, process.env.bc_storehash1, process.env.bc_token1mp);
  } else {
    response.json({ result: "Invalid store id" });
  }
});

function updateProduct(storehash, token, data, response) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products/${data.id}`, {
    method: 'PUT',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-auth-token': token
    },
    body: JSON.stringify({
      description: data.desp
    })
  })
  .then(r=>r.json())
  .then(d=>{
    console.log(d);
    response.json(d);
  })
  .catch(e=>{
    console.log(e);
    response.json(e);
  })
}
app.options("/update-bc-product", cors()); 
app.post("/update-bc-product", cors(corsOptions), (request, response)=> {
  let {store_id, data} = request.body;
  if (store_id == process.env.bc_store_id) {
    updateProduct(process.env.bc_storehash, process.env.bc_tokenmp, data, response);
  } else if (store_id == process.env.bc_store1_id) {
    updateProduct(process.env.bc_storehash1, process.env.bc_token1mp, data, response);
  } else {
    response.json({result: "Invalid store id"});
  }
})

function updateCategory(storehash, token, data, response) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/catalog/categories/${data.id}`, {
    method: 'PUT',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-auth-token': token
    },
    body: JSON.stringify({
      description: data.desp
    })
  })
  .then(r=>r.json())
  .then(d=>{
    console.log(d);
    response.json(d);
  })
  .catch(e=>{
    console.log(e);
    response.json(e);
  })
}
app.options("/update-bc-category", cors());
app.post("/update-bc-category", cors(corsOptions), (request, response) => {
  console.log(request.body);
  let {store_id, data} = request.body;
  if (store_id == process.env.bc_store_id) {
    // updateCategory(process.env.bc_storehash, process.env.bc_tokenmp, data, response);
    updateCategory(process.env.bc_sandbox_storehash, process.env.bc_sandbox_token, data, response);
  } else {
    updateCategory(process.env.bc_storehash1, process.env.bc_token1mp, data, response);
  }
});

function updateShippingGroup(vinv, storehash, isPreOrder) {
  let token = "";
  if (storehash == process.env.bc_storehash) {
    token = process.env.bc_tokenmp;
  } else {
    token = process.env.bc_token1mp;
  }
  fetch(
    `https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products/${vinv.product_id}/variants/${vinv.id}/metafields?key=shipping-groups`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-auth-token": token
      }
    }
  )
    .then(r => r.json())
    .then(vmeta => {
      if (vmeta.data) {
        if (isPreOrder) {
          if (vmeta.data.length == 0) {
            fetch(
              `https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products/${vinv.product_id}/variants/${vinv.id}/metafields`,
              {
                method: "POST",
                headers: {
                  accept: "application/json",
                  "content-type": "application/json",
                  "x-auth-token": token
                },
                body: JSON.stringify({
                  key: "shipping-groups",
                  namespace: "shipping.shipperhq",
                  permission_set: "write",
                  resource_id: vinv.id,
                  resource_type: "variant",
                  value: '[\"Pre-Order\"]'
                })
              }
            )
              .then(r => r.json())
              .then(d => {
                console.log(d);
                console.log('created pre-order');
                let currentDate = new Date().toISOString().split("T")[0];
                let noteLog="\n----------------\n";
                noteLog+=new Date().toISOString().split("T")[1]+"\n";
                noteLog+=`Created pre-order - ${storehash}: (product id) ${vinv.product_id} (variant id) ${vinv.id}\n`;
                fs.appendFile(`./.data/${currentDate}.log`, noteLog, function (err) {
                  if (err) console.log(err);          
                });
              })
              .catch(e => console.log(e));
          } else if (vmeta.data[0].value.includes('Pre-Order')==false) {
            fetch(
              `https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products/${vinv.product_id}/variants/${vinv.id}/metafields/${vmeta.data[0].id}`,
              {
                method: "PUT",
                headers: {
                  accept: "application/json",
                  "content-type": "application/json",
                  "x-auth-token": token
                },
                body: JSON.stringify({                  
                  value: '[\"Pre-Order\"]'
                })
              }
            )
              .then(r => r.json())
              .then(d => {
                console.log(d);
                console.log('updated pre-order');
                let currentDate = new Date().toISOString().split("T")[0];
                let noteLog="\n----------------\n";
                noteLog+=new Date().toISOString().split("T")[1]+"\n";
                noteLog+=`Updated pre-order - ${storehash}: (product id) ${vinv.product_id} (variant id) ${vinv.id} (metafield id) ${vmeta.data[0].id}\n`;
                fs.appendFile(`./.data/${currentDate}.log`, noteLog, function (err) {
                  if (err) console.log(err);          
                });
              })
              .catch(e => console.log(e));
          }
        } else {
          if (vmeta.data.length > 0) {
            console.log(vmeta.data[0].value);
            fetch(
              `https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products/${vinv.product_id}/variants/${vinv.id}/metafields/${vmeta.data[0].id}`,
              {
                method: "DELETE",
                headers: {
                  accept: "application/json",
                  "content-type": "application/json",
                  "x-auth-token": token
                }
              }
            )
              .then(r => {
              console.log(r);
              console.log('deleted pre-order');
              let currentDate = new Date().toISOString().split("T")[0];
              let noteLog="\n----------------\n";
              noteLog+=new Date().toISOString().split("T")[1]+"\n";
              noteLog+=`Deleted pre-order - ${storehash}: (product id) ${vinv.product_id} (variant id) ${vinv.id}\n`;
              fs.appendFile(`./.data/${currentDate}.log`, noteLog, function (err) {
                if (err) console.log(err);          
              });
              })              
              .catch(e => console.log(e));
          } 
        }        
      }
    });
}
function getTeamdeskInventory(storehash, token, vinv, value) {
  let filter = encodeURIComponent(`Ends([SKU],'${vinv.sku}')`);
  fetch(
    `https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_inv_tb}/select.json?filter=${filter}&column=*&column=Available for Sale`
  )
    .then(r => r.json())
    .then(d => {
      if (d.length > 0) {
        let tinv = d.filter(t => t.SKU.toUpperCase() == vinv.sku.toUpperCase());
        if (tinv.length > 0) {
          tinv = tinv[0];
          if (tinv["Virtual Quantity"]) {
            console.log(`SKU ${vinv.sku}:  Inventory level ${vinv.inventory_level} - WH1 inventory: ${tinv["WH1"]} - 2 inventory: ${tinv["2"]} - Pending inventory: ${tinv["Quantity Pending"]} - Teamdesk Inventory ${Number(tinv["WH1"]) +Number(tinv["2"]) - Number(tinv["Quantity Pending"])} - Value ${value} - Teamdesk virtual ${tinv["Virtual Quantity"]}`);
            // if (Number(tinv["WH1"]) + Number(tinv["2"]) - Number(tinv["Quantity Pending"]) + Number(value) <= 0) {
            //   updateShippingGroup(vinv, storehash, true);
            // } else {
            //   updateShippingGroup(vinv, storehash, false);
            // }
            if (Number(tinv["Virtual Quantity"]) >= vinv.inventory_level) {
              updateShippingGroup(vinv, storehash, true);
            } else {
              updateShippingGroup(vinv, storehash, false);
            }
          }
        }
      }
    })
    .catch(e => console.log(e));
}
function getBCInventory(storehash, token, data) {  
  fetch(
    `https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products/${data.inventory.product_id}/variants/${data.inventory.variant_id}`,
    {
      method: 'GET',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-auth-token": token
      }
    }
  )
    .then(r => r.json())
    .then(vinv => {      
      if (vinv.data) {
        vinv = vinv.data;
        getTeamdeskInventory(storehash, token, vinv, data.inventory.value);
      }
    })
    .catch(e => console.log(e));
}
app.post("/bc-inventory-updated", (request, response) => {
  console.log(request.body);
  let { store_id, data } = request.body;
  response.json({ result: "working on it.." });
  if (store_id == process.env.bc_store_id) {
    getBCInventory(process.env.bc_storehash, process.env.bc_token, data);
  } else {
    getBCInventory(process.env.bc_storehash1, process.env.bc_token1, data);
  }
});
function getBCProductVariants(storehash, token, data, response) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products?sku%3Ain=${data.sku}&include=variants`, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-auth-token': token
    }
  })
  .then(r=>r.json())
  .then(d=>{
    response.json(d);
  })
  .catch(e=>{
    console.log(e);
    response.json(e);
  })
}
app.options("/get-bc-product-variants", cors());
app.post('/get-bc-product-variants', cors(corsOptions), (request, response) => {
  let {store_id, data} = request.body;
  if (store_id == process.env.bc_store_id) {
    getBCProductVariants(process.env.bc_storehash, process.env.bc_token, data, response);
  } else {
    getBCProductVariants(process.env.bc_storehash1, process.env.bc_token1, data, response);
  }
});
function getTeamdesk(table, options, response, data=[],skip=0, limit=500) {
  let f = options;
  if (options.includes("?")) {
    f+=`&skip=${skip}&limit=${limit}`;
  } else {
    f+=`?skip=${skip}&limit=${limit}`;
  }   
  fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${table}/select.json${f}`)
    .then(r=>r.json())
    .then(d=>{      
      if (d.length>0) {
        data=[...data, ...d];
        getTeamdesk(table, options, response, data, skip+limit, limit);
      } else {
        response.json(data);
      }
    })
    .catch(e=>{
      console.log(e);
      response.json(e);
    });
}
app.options("/get-teamdesk", cors());
app.post('/get-teamdesk', cors(corsOptions), (request, response) => {
  // console.log(request.body);
  let {table} = request.body;
  if (table == process.env.teamdesk_inv_tb) {
    let {filter} = request.body;
    fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${table}/select.json?column=*&column=Available for Sale&column=Unlocked for sale quantity&column=Total Request Quantity&column=Total On Hand&column=EU Quantity&filter=${filter}&sort=Color code value`)
      .then(r=>r.json())
      .then(d=>{
        response.json(d);     
      })
      .catch(e=>console.log(e));
  } else {
    let {options} = request.body;
    getTeamdesk(table, options, response);
  }
});
app.options("/add-teamdesk", cors());
app.post("/add-teamdesk", cors(corsOptions), (request, response)=>{
  let {table, body} = request.body;
  // console.log(table);
  console.log(body);
  fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${table}/upsert.json`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  })
  .then(r=>r.json())
  .then(d=>{
    console.log(d);
    response.json(d);
  })
  .catch(e=>{
    console.log(e);
    response.json(e);
  })
});
function refreshInstagramToken(tokenFile, token, response, ir=false) {
  fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token.access_token}`)
  .then(r=>r.json())
  .then(d=>{
    if (d.access_token) {
      fs.writeFile(
          tokenFile,
          JSON.stringify(d),          
          function(err) {
            if (err) {
              response.json(err);
            } else {
              if (ir) {
                getInstagramPost(tokenFile, d, response); 
              }              
            }
          }
        );
    }
  }).catch(e=>{
    console.log(e);
    response.json(e);
  })
}
function getInstagramPost(tokenFile, token, response) {    
  fetch('https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink', {    
    headers: {
      Authorization: `${token.token_type[0].toUpperCase()+token.token_type.substring(1)} ${token.access_token}`,
      accept: 'application/json'
    }
  })
  .then(r=>{
    if (r.status==200) {
      return r.json();
    } else {
      return {error: r.text()};
    }
  })
  .then(d=>{    
    if (d.data) {
      response.json(d);
    } else if (d.error) {
      refreshInstagramToken(tokenFile, token, response, true);
    } else {
      response.json({data:[]});
    }
  })
  .catch(e=>{
    console.log(e);
    response.json(e);
  })
}
app.options("/instagram-refresh", cors(corsOptions));
app.post("/instagram-refresh", cors(corsOptions), (request, response)=>{
  const tokenFile = "./.data/instagram_token.json";
  fs.readFile(tokenFile, function(err,data) {
    if (err) {
      response.json(err);
    } else {
      console.log(data);
      response.json(data);
      if (data.length>1) {
        let token = JSON.parse(data);        
        refreshInstagramToken(tokenFile, token, response);                
      }
    }
  })  
})
app.get("/instagram-post", cors(corsOptions), (request, response)=>{
  const tokenFile = "./.data/instagram_token.json";
  fs.readFile(tokenFile, function(err,data) {
    if (err) {
      response.json(err);
    } else {
      console.log(data);
      if (data.length>1) {
        let token = JSON.parse(data);
        // refreshInstagramToken(tokenFile, token, response);        
        getInstagramPost(tokenFile, token, response);
      }
    }
  })  
})
app.options("/stamped-donate", cors());
app.post("/stamped-donate", cors(corsOptions), (request, response) => {
  console.log(request.body);
  let {id, point, storeId} = request.body;
  fetch(`https://stamped.io/api/v2/${storeId}/dashboard/customers/${id}/pointsAdjustment?points=-${point}&reason=Donation`, {
    method: 'post',
    headers: {
      authorization: process.env.stamped_auth,
      'content-type': 'application/json',
      accept: 'application/json'
    }
  })
  .then(r=>r.json())
  .then(d=>{
    console.log(d);
    response.json(d);
  })
  .catch(e=>{
    console.log(e);
    response.json(e);
  })
});
app.get("/stamped-customer-search", cors(corsOptions), (request, response)=> {
  const queryObject = url.parse(request.url, true).query;
  fetch(`https://stamped.io/api/v2/${queryObject.storeId}/dashboard/customers/?search=${queryObject.email}`, {
    method: 'get',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      authorization: process.env.stamped_auth
    }
  })
  .then(r=>r.json())
  .then(d=>{
    console.log(d)
    response.json(d);
  })
  .catch(e=>console.log(e));
});
app.get("/dropbox-euwholesale-refresh", cors(corsOptions), (request, response) => {
  response.json({token: process.env.dropbox_euwholesale_refresh, auth: process.env.dropbox_eu_auth});
});
app.get("/dropbox-token", cors(corsOptions), (request, response) => {
  response.json({token: process.env.dropbox_auth});
});
app.get("/dropbox-supplier-token", cors(corsOptions), (request, response) => {
  response.json({ token: process.env.dropbox_supplier_token });
});
function getBCProducts(response, storehash, token, query, result={data:[]}, page=1, limit=250) {  
  let url = "";
  if (query) {
    url = `https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products?${query}&limit=${query.includes("modifiers")?10:limit}&page=${page}`;
  } else {
    url = `https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products?limit=${limit}&page=${page}`;
  }
  fetch(url, {
    method: "get",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-auth-token": token
    }
  })
    .then(r => r.json())
    .then(r => {   
      // console.log(page);
      // console.log(r.data.length);      
      if (r.data.length==0) {
        response.json(result);
      } else {
        result.data = [...result.data, ...r.data];        
        getBCProducts(response, storehash, token, query, result, page+1, limit)
      }
    })
    .catch(e => {
      console.log(e);
      response.json(e);
    });
}
app.options("/bc-products", cors());
app.post("/bc-products", cors(corsOptions), (request, response) => {
  console.log(request.body)
  let { storeid, query } = request.body;
  if (storeid == process.env.bc_store_id) {
    getBCProducts(
      response,
      process.env.bc_storehash,
      process.env.bc_token,
      query
    );
  } else if (storeid == process.env.bc_store1_id) {
    getBCProducts(
      response,
      process.env.bc_storehash1,
      process.env.bc_token1,
      query
    );
  } else if (storeid == process.env.bc_store_sandbox_id) {
    getBCProducts(
      response,
      process.env.bc_sandbox_storehash,
      process.env.bc_sandbox_token,
      query
    );
  } else {
    response.json({ result: "Invalid store id" });
  }
});
function getBCProduct(response, storehash, token, productId) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/catalog/products/${productId}?include=variants,primary_image`, {
    method: 'get',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-auth-token': token
    }
  })
  .then(r=>r.json())
  .then(product=>{
    response.json(product);
  })
  .catch(e=> {
    console.log(e);
    response.json(e);
  })
}
app.get("/bc-product", cors(corsOptions), (request, response) => {
  const queryObject = url.parse(request.url, true).query;
  // console.log(queryObject);
  if (queryObject.id == process.env.bc_store_id) {
    getBCProduct(response, process.env.bc_storehash, process.env.bc_token, queryObject.productId);
  } else if (queryObject.id == process.env.bc_store1_id) {
    getBCProduct(response, process.env.bc_storehash1, process.env.bc_token1, queryObject.productId);
  } else {
    // response.json({result: 'Invalid store id'});
    getBCProduct(response, process.env.bc_sandbox_storehash, process.env.bc_sandbox_token, queryObject.productId);
  }
});
app.options('/stamped-review-vote', cors());
app.post("/stamped-review-vote", cors(corsOptions), (request, response) => {  
  console.log(request.header('Origin'));
  console.log(request.body);
  let {productId, reviewId, vote, storeUrl} = request.body;
  let body = new URLSearchParams();
  body.append("productId", productId);
  body.append("reviewId", reviewId);
  body.append("vote", vote);
  body.append("storeUrl", storeUrl);
  body.append("apiKey", process.env.stamped_apiKey);
  fetch('https://stamped.io/api/reviews/vote', {
    method: 'post',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  })
  .then(r=>r.json())
  .then(d=>{
    // console.log(d);
    response.json(d);
  })
  .catch(e=>{
    console.log(e);
    response.json(e);
  })
});
function getStampedCustomersReview(emails,stores,idx,response,result=[]) {
  if (idx<emails.length) {
    fetch(`https://stamped.io/api/widget/reviews?email=${emails[idx]}&storeUrl=${stores[idx]}&take=2&isWithPhotos=true&apiKey=${process.env.stamped_apiKey}`, {
      method: 'get',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        authorization: process.env.stamped_auth
      }
    })
    .then(r=>r.json())
    .then(d=>{
      result=[...result, ...d.data];
      getStampedCustomersReview(emails,stores,idx+1,response,result);
    })
    .catch(e=>{
      console.log(e);
      getStampedCustomersReview(emails,stores,idx+1,response,result);
    });
  } else {
    response.json(result);
  }
}
app.get("/stamped-review-by-emails", cors(corsOptions), (request, response) => {
  const queryObject = url.parse(request.url, true).query;
  console.log(queryObject);
  getStampedCustomersReview(queryObject.email,queryObject.store,0,response);
});
app.get("/stamped-review-by-email", cors(corsOptions), (request, response) => {
  const queryObject = url.parse(request.url, true).query;
  console.log(queryObject);
  let {email, store} = queryObject;
  fetch(`https://stamped.io/api/widget/reviews?email=${email}&storeUrl=${store}&isWithPhotos=true&apiKey=${process.env.stamped_apiKey}`, {
    method: 'get',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      authorization: process.env.stamped_auth
    }
  })
  .then(r=>r.json())
  .then(d=>{    
    response.json(d.data);
  })
  .catch(e=>{
    console.log(e);
    response.json(e);
  });
});
app.get("/stamped-review", cors(corsOptions), (request, response) => {
  const queryObject = url.parse(request.url, true).query;
  fetch(
    `https://stamped.io/api/v2/${queryObject.id}/dashboard/reviews/?search=${queryObject.email}`,
    {
      method: "GET",
      headers: {
        Authorization: process.env.stamped_auth
      }
    }
  )
    .then(r => r.json())
    .then(d => {
      // console.log(d);
      response.json(d);
    });
});
function holdItemInSKUVault(products, orderId, idx = 0, holds = []) {
  if (idx == products.length) {
    if (holds.length>0) {
      console.log(util.inspect(holds, false, null, true));
      fetch(`https://app.skuvault.com/api/sales/createHolds`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          TenantToken: process.env.skuvault_tenant_token,
          UserToken: process.env.skuvault_user_token,
          Holds: holds
        })
      })
        .then(r => r.json())
        .then(d => {
          console.log(d);
          console.log("holded in SKUVault");
        })
        .catch(e => {
          console.log(e);
          console.log("Could not hold in SKUVault");
        });
    }    
  } else {
    let product = products[idx];
    let reg = /^(M|HD|P)[0-9]+/g;
    if (product.sku.match(reg)) {
      fetch(`https://app.skuvault.com/api/products/getProduct`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          ProductSKU: product.sku,
          TenantToken: process.env.skuvault_tenant_token,
          UserToken: process.env.skuvault_user_token
        })
      })
        .then(r => r.json())
        .then(d => {
          // console.log(d);
          if (d.Product) {
            let exp = new Date();
            exp.setDate(exp.getDate() + 2);
            holds.push({
              Sku: product.sku,
              Quantity: product.quantity,
              ExpirationDateUtc: exp,
              Description: `HOLD for order ${orderId}, please cancel first before you change order status in Bigcommerce`
            });
          }
          holdItemInSKUVault(products, orderId, idx + 1, holds);
        })
        .catch(e => {
          console.log(e);
          holdItemInSKUVault(products, orderId, idx + 1, holds);
        });
    } else {
      holdItemInSKUVault(products, orderId, idx + 1, holds);
    }
  }
}
function addInTransitData(data) {
  console.log(data);
  fetch(
    `https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_inv_tb}/update.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  )
  .then(r=>r.json())
  .then(d=>{
    console.log(d);    
  })
  .catch(e=>console.log(e));
}
function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}
function virtualSection(
  inv,
  invNote,
  poItems,
  qty,
  noteLog,
  inTransit,
  order,
  inComing
) {
  let allureItems = [
    "coco",
    "rose",
    "adele",
    "angelina",
    "jessica",
    "selena",
    "taylor",
    "julia",
    "nicole",
    "gwyneth",
    "ev7914",
    "tl6814",
    "ev5714",
    "mo5514",
    "mo7608",
    "ev5512",
    "ev5706",
    "ev6810",
    "eg6612",
    "eh16",
    "mh2206",
    "sh5206",
    "ep3608",
    "mh2216",
    "maya",
    "noya",
  ];
  if (inv["Virtual Location"]) {
    if (
      inv["Lock Status"] != "Locked for processing" &&
      Number(inv["Unlocked for sale quantity"]) +
        Number(inv["Available Quantity"]) >=
        qty
    ) {
      invNote.week.push(inv.SKU);
      let inTransitNote = inv["Sales Note #1"]
        ? inv["Sales Note #1"].split(",")
        : [];
      inTransitNote.push(order.id);
      inTransit.push({
        "@row.id": inv["@row.id"],
        "Hold for Pre-Sold Quantity":
          Number(inv["Hold for Pre-Sold Quantity"]) + qty,
        "Sales Note #1": inTransitNote.join(","),
      });
    } else if (
      Number(inv["Quantity Incoming"]) +
        Number(inv["Available Quantity"]) -        
        2 >=
        qty &&
      poItems.length > 0
    ) {
      let i = -1;
      let qtyPO =
        Number(inv["Available Quantity"]) -        
        2;
      while (qtyPO < qty && i < poItems.length - 1) {
        i++;
        qtyPO += poItems[i]["Incoming Quantity"];
      }
      let mDiff = monthDiff(
        new Date(),
        new Date(poItems[i]["Arrival Due Date"])
      );
      if (mDiff <= 0) {
        if (allureItems.includes(inv["Part Number"].toLowerCase())) {
          if (invNote.virtual["3M"]) {
            invNote.virtual["3M"].push(inv.SKU);
          } else {
            invNote.virtual["3M"] = [inv.SKU];
          }
        } else {
          if (invNote.virtual["1M"]) {
            invNote.virtual["1M"].push(inv.SKU);
          } else {
            invNote.virtual["1M"] = [inv.SKU];
          }
        }
      } else {
        if (allureItems.includes(inv["Part Number"].toLowerCase())) {
          mDiff = Number(mDiff) + 2;
        }
        if (invNote.virtual[`${mDiff}M`]) {
          invNote.virtual[`${mDiff}M`].push(inv.SKU);
        } else {
          invNote.virtual[`${mDiff}M`] = [inv.SKU];
        }
      }
      inComing.push(inv.SKU);
    } else {
      if (invNote.virtual[inv["Virtual Location"]]) {
        invNote.virtual[inv["Virtual Location"]].push(inv.SKU);
      } else {
        invNote.virtual[inv["Virtual Location"]] = [inv.SKU];
      }
    }
  }
}
app.post("/test-cmh",(request,response)=>{
  response.json({test:'working on it..'});
  // const db = new sqlite3.Database(dbFile, (err)=>{
  //   if (err) {
  //     console.log(err.message);
  //   }
  //   db.serialize(()=> {
  //     db.all(`SELECT * from CustomMade`, function(err,rows){
  //       rows.forEach(function(row){
  //         console.log(row);
  //       })
  //     })
  //   })
  // });
  let order = {
    cart_id: '00da0926-e4b1-4d63-9cc2-2f1d58a34c18',
    id: 173,
    payment_status: 'captured'
  }, shipmentData = {
    first_name: 'Nana',
    last_name: 'Phan'
  }
  addCMHToTeamdesk(order);
});
function addCMHToTeamdesk(order) {
  const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
      console.log(err.message);
    }
    db.serialize(()=> {      
      db.all(`SELECT * from CustomMade where cartId='${order.cart_id}'`, function(err, rows) {
        let body=[];
        rows.forEach(function(row) {
          body.push({
            "Order Status": "To be Checked",
            "f_10902805": "New Unit 新货",
            "Invoice Number": order.id,
            "Payment Status": order.payment_status=="captured"?"Full Payment Received":order.payment_method,
            "Quantity": row.quantity,
            "Price": row.price,
            f_10905319: row.gender?'Male':'Female',
            f_13766033: row.gender?row.toupeeBase:null,
            f_13766034: row.gender?null:row.toupeeBase,
            f_10902814: row.sampleType,
            f_10902828: row.leftRightSize,
            f_10902829: row.frontBackSize,
            f_10902808: row.hairLength,
            f_10902825: row.hairColor,
            f_10902826: row.greyPercentage,
            f_10902827: row.hairType,
            f_10902827: row.greyHairType,
            f_10902823: row.density,
            f_10902821: row.hairStyle,
            f_10902824: row.waveCurl,
            f_10902819: row.frontHairline,
            f_10902830: row.baseMaterialColor,
            f_10902843: row.additionalService,
            Notes: row.notes,
            f_10902806: row.baseSize            
          })
        })
        db.close();
        console.log(body);
        fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_cmh_tb}/upsert.json`,{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(body)
        })
        .then(r=>r.json())
        .then(d=>{
          console.log(util.inspect(d,true,null,false));    
        })
        .catch(e=>{
          console.log(util.inspect(e,true,null,false));    
        })
      })
    });
  });    
}
/*
** Tier 1 No Signature (.com 12) => NS100
** Extensions Wholesale No Signature (.ca 17) => NS100
** Order subtotal > 500 => SQ500
** New comer (.com 11, .ca 16) && subtotal > 150 => NC300
** Retail Signature Required (.com 13) => SQ500Q
** Blocklist (.com 10, .ca 9) => SQ500Q
** (Ted@aihair.com,  ninafilice111@gmail.com) => SQ500Q
**/
async function checkCustomerGroupDeliverNote(order, storehash, token) {
  let sqq=["ted@aihair.com","ninafilice111@gmail.com"];
  if (storehash==process.env.bc_storehash){
    token=process.env.bc_token;
  }
  else if (storehash==process.env.bc_storehash1) {
    token=process.env.bc_token1;
  }
  const res = await fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/customers?id%3Ain=${order.customer_id}`, {
    headers: {
      'x-auth-token': token,
      'Accept': "application/json"
    }
  });
  console.log(res);
  const r = await res.json();
  if (r.data.length>0) {
    let customer=r.data[0];
    if (storehash==process.env.bc_storehash && customer.customer_group_id == 12){
      return "NS100";
    } else if (storehash==process.env.bc_storehash1 && (customer.customer_group_id == 17 || customer.customer_group_id == 18)) {
      return "NS100";
    } else if (storehash==process.env.bc_sandbox_storehash && customer.customer_group_id == 2) {
      return "NS100";
    } else if (order.subtotal_ex_tax>500) {
      return "SQ500";
    } else if (storehash==process.env.bc_storehash && (customer.customer_group_id == 11 || customer.customer_group_id == 15) && order.subtotal_ex_tax>150) {
      return "NC300";
    } else if (storehash==process.env.bc_storehash1 && (customer.customer_group_id == 16 || customer.customer_group_id == 19) && order.subtotal_ex_tax>150) {
      return "NC300";
    } else if (storehash==process.env.bc_sandbox_storehash && customer.customer_group_id == 5 && order.subtotal_ex_tax>150) {
      return "NC300";
    } else if (storehash==process.env.bc_storehash && (customer.customer_group_id == 13 || customer.customer_group_id == 10)) {
      return "SQ500Q";
    } else if (storehash==process.env.bc_storehash1 && customer.customer_group_id == 9) {
      return "SQ500Q";
    } else if (sqq.includes(customer.email.toLowerCase())) {
      return "SQ500Q";
    }
  }  
  return null;
}
/**
 * Fill delivery content to BC order note
 * 
 * @param {string} storehash BC storehash for API calling
 * @param {string} token BC token for API calling
 * @param {Array} products Product list of order
 * @param {Array} tdPO Teamdesk PO list
 * @param {Array} tdInv Teamdesk Inventory list 
 * @param {json} order Order object information
 */
 async function addNoteContent(storehash, token, products, tdPO, tdInv, order) {    
  let note = "";
  let noteLog = `\n-------${storehash}---------\n`;
  noteLog += new Date().toISOString().split("T")[1] + "\n";
  noteLog += `Order number ${order.id}\n`;
  let qtyChecked={};
  let cmhRushItems = ["CMSKIN", "CMMONO", "CMLACE", "CMLACEPOLY"];
  for (let product of products) {    
    let clientName = product.product_options.find(op=>op.display_name.toLowerCase().includes("client name"))    
    let inv = tdInv.find(td=>td.SKU.toUpperCase() == product.sku.toUpperCase());
    if (inv) {        
        let qty = product.quantity;
        let buff = qtyChecked[inv.SKU]?qtyChecked[inv.SKU]:0;
        if (qtyChecked[inv.SKU]) {                                
            qtyChecked[inv.SKU]+=qty;
        } else {
            qtyChecked[inv.SKU]=qty;
        }
        note+=`- ${product.sku}${clientName ? " - Client: " + clientName.display_value : ""}\n`;
        noteLog += `${inv.SKU}: (2) ${inv["2"]} (WH1) ${inv.WH1} (Total on hand) ${inv["Total On Hand"]} (In-transit status) ${inv["Lock Status"]} (In-transit) ${
            inv["Unlocked for sale quantity"]
        } (Hold In-transit) ${inv["Hold for Pre-Sold Quantity"]} (Incoming) ${inv["Quantity Incoming"]} (Available) ${Number(inv["Available Quantity"])} (Qty) ${
            qty
        }\n`;   
        if (inv["Total On Hand"] != inv["Available Quantity"]) {
            if (Number(inv["Available Quantity"])>0) {
                if (storehash == process.env.bc_fr_storehash) {
                  if (Number(inv["Available Quantity"])-buff>0) {
                    note+=`  Dans 3-8 jours: quantité ${Math.min(inv["Available Quantity"]-buff, qty)}\n`;
                    qty = qty - Math.min(inv["Available Quantity"]-buff, qty);
                    buff=0;
                  } else {
                      buff -= Number(inv["Available Quantity"]);
                  }
                } else if (storehash == process.env.bc_es_storehash) {
                  if (Number(inv["Available Quantity"])-buff>0) {
                    note+=`  En 3-8 días: cantidad ${Math.min(inv["Available Quantity"]-buff, qty)}\n`;
                    qty = qty - Math.min(inv["Available Quantity"]-buff, qty);
                    buff=0;
                  } else {
                      buff -= Number(inv["Available Quantity"]);
                  }
                } else {
                  if (Number(inv["Available Quantity"])-Number(inv["EU Quantity"])-buff>0) {
                    note+=`  1-4 days: quantity ${Math.min(Number(inv["Available Quantity"])-Number(inv["EU Quantity"])-buff, qty)}\n`;
                    qty = qty - Math.min(Number(inv["Available Quantity"])-Number(inv["EU Quantity"])-buff, qty);
                    buff=0;
                  } else {
                      buff -= Number(inv["Available Quantity"])-Number(inv["EU Quantity"]);
                  }
                }
            }                                    
        } else {
            if (storehash.includes(process.env.bc_storehash1)) {                                
                if (Number(inv["Quantity Canada"])>0 && qty>0) {
                    if (Number(inv["Quantity Canada"])-buff>0) {
                        note+=`  Immediately: quantity ${Math.min(inv["Quantity Canada"]-buff, qty)}\n`;
                        qty = qty - Math.min(inv["Quantity Canada"]-buff, qty);
                        buff=0;
                    } else {
                        buff -= Number(inv["Quantity Canada"]);
                    }
                }
                if (Number(inv["Quantity USA"])>0) {
                    if (Number(inv["Quantity USA"])-buff>0) {
                        note+=`  2-4 days: quantity ${Math.min(inv["Quantity USA"]-buff, qty)}\n`;
                        qty = qty - Math.min(inv["Quantity USA"]-buff, qty);
                        buff=0;
                    } else {
                        buff-=Number(inv["Quantity USA"]);
                    }
                }                 
            } else if (storehash.includes(process.env.bc_storehash)) {
                if (Number(inv["Quantity USA"])>0) {
                    if (Number(inv["Quantity USA"])-buff>0) {
                        note+=`  Immediately: quantity ${Math.min(inv["Quantity USA"]-buff, qty)}\n`;
                        qty = qty - Math.min(inv["Quantity USA"]-buff, qty);
                        buff=0;
                    } else {
                        buff-=Number(inv["Quantity USA"]);
                    }
                }    
                if (Number(inv["Quantity Canada"])>0 && qty>0) {
                    if (Number(inv["Quantity Canada"])-buff>0) {
                        note+=`  2-4 days: quantity ${Math.min(inv["Quantity Canada"]-buff, qty)}\n`;
                        qty = qty - Math.min(inv["Quantity Canada"]-buff, qty);
                        buff=0;
                    } else {
                        buff -= Number(inv["Quantity Canada"]);
                    }
                }             
            } else if (storehash.includes(process.env.bc_fr_storehash)) {
              if (Number(inv["Quantity USA"])>0) {
                if (Number(inv["Quantity USA"])-buff>0) {
                    note+=`  Dans 3-4 jours : quantité  ${Math.min(inv["Quantity USA"]-buff, qty)}\n`;
                    qty = qty - Math.min(inv["Quantity USA"]-buff, qty);
                    buff=0;
                } else {
                    buff-=Number(inv["Quantity USA"]);
                }
              }    
              if (Number(inv["Quantity Canada"])>0 && qty>0) {
                  if (Number(inv["Quantity Canada"])-buff>0) {
                      note+=`  Dans 5-8 jours: quantité ${Math.min(inv["Quantity Canada"]-buff, qty)}\n`;
                      qty = qty - Math.min(inv["Quantity Canada"]-buff, qty);
                      buff=0;
                  } else {
                      buff -= Number(inv["Quantity Canada"]);
                  }
              }             
            } else if (storehash.includes(process.env.bc_es_storehash)) {
              if (Number(inv["Quantity USA"])>0) {
                if (Number(inv["Quantity USA"])-buff>0) {
                    note+=`  En 3-4 días: cantidad  ${Math.min(inv["Quantity USA"]-buff, qty)}\n`;
                    qty = qty - Math.min(inv["Quantity USA"]-buff, qty);
                    buff=0;
                } else {
                    buff-=Number(inv["Quantity USA"]);
                }
              }    
              if (Number(inv["Quantity Canada"])>0 && qty>0) {
                  if (Number(inv["Quantity Canada"])-buff>0) {
                      note+=`  En 5-8 días: cantidad ${Math.min(inv["Quantity Canada"]-buff, qty)}\n`;
                      qty = qty - Math.min(inv["Quantity Canada"]-buff, qty);
                      buff=0;
                  } else {
                      buff -= Number(inv["Quantity Canada"]);
                  }
              }             
            } else {
                if (Number(inv["Available Quantity"])-Number(inv["EU Quantity"])>0) {
                    if (Number(inv["Available Quantity"])-Number(inv["EU Quantity"])-buff>0) {
                        note+=`  2-4 days: quantity ${Math.min(Number(inv["Available Quantity"])-Number(inv["EU Quantity"])-buff, qty)}\n`;
                        qty = qty - Math.min(inv["Available Quantity"]-buff, qty);
                        buff=0;
                    } else {
                        buff -= Number(inv["Available Quantity"])-Number(inv["EU Quantity"]);
                    }
                }          
            }                            
        }
        if (storehash == process.env.bc_storehash || storehash == process.env.bc_storehash1) {
          note = addNoteVirtualContent(inv, qty, note, buff, tdPO, product);
        }
    } else if (cmhRushItems.includes(product.sku.toUpperCase())) {
        if (storehash == process.env.bc_fr_storehash){
          note+=`- ${product.sku}: Ivraison garantie dans un délai de trois mois\n`;
        } else if (storehash == process.env.bc_es_storehash){
          note+=`- ${product.sku}: Envío garantizado en 3 meses\n`;
        } else {
          note+=`- ${product.sku}: 3-month guaranteed delivery\n`;
        }  
    } else if (hairService.includes(product.sku)) {
        if (storehash == process.env.bc_fr_storehash) {
          note+=`- ${product.sku}: Dans 2-3 semaines\n`;
        } else if (storehash == process.env.bc_es_storehash) {
          note+=`- ${product.sku}: En 2-3 semanas\n`;
        } else {
          note+=`- ${product.sku}: Handling time 1-2 weeks\n`;
        }       
    }              
  }

  if (note.length > 0) { 
    let currentDate = new Date().toISOString().split("T")[0];
    fs.appendFile(`./.data/${currentDate}.log`, noteLog + note, function (err) {
        if (err) console.log(err);
    });           
    if (storehash==process.env.bc_fr_storehash){
      note = `${order.customer_message.length > 0 ? order.customer_message + "\n-----Note du système de commande-----\n\n" : "-----Note du système de commande-----\n\nHeure d'expédition prévue:\n\n"}${note}`;
    } else if (storehash==process.env.bc_es_storehash){
      note = `${order.customer_message.length > 0 ? order.customer_message + "\n-----Nota del sistema-----\n\n" : "-----Nota del sistema-----\n\nTiempo estimado de envío:\n\n"}${note}`;
    } else {
      note = `${order.customer_message.length > 0 ? order.customer_message + "\n----------Order system note----------\n\n" : "----------Order system note----------\n\nEstimated ship out time:\n\n"}${note}`;
    }
    let cgSign = await checkCustomerGroupDeliverNote(order, storehash, token);
    if (cgSign) {
        note += `\n${cgSign}\n`;
    }
    console.log(note);
    fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/orders/${order.id}`, {
        method: "PUT",
        headers: {
            "x-auth-token": token,
            accept: "application/json",
            "content-type": "application/json",
        },
        body: JSON.stringify({
            customer_message: note,
        }),
    })
    .then((r) => r.json())
    .then((r) => {
        if (storehash == process.env.bc_storehash || storehash == process.env.bc_storehash1 || storehash == process.env.bc_fr_storehash) {
            loadAndSearchCustomerPhone(storehash, order.id, token, note);
        }
    })
    .catch((e) => console.log(e));
  }
}

/**
 * Add Note content for virtual quantity
 * 
 * @param {json} inv Teamdesk record of the product
 * @param {integer} qty Current check Quantity
 * @param {string} note Current note content
 * @param {integer} buff Current buff value
 * @param {Array} tdPO PO list
 * 
 * @return note content
 */
function addNoteVirtualContent(inv, qty, note, buff, tdPO, product) {
  if (inv["Virtual Quantity"] && qty>0) {   
    const options = {year: 'numeric', month: 'long'};                                                             
    if (inv["Lock Status"]!="Locked for processing" && Number(inv["Unlocked for sale quantity"]) > 0 && qty>0) {
        if (Number(inv["Unlocked for sale quantity"])-buff > 0) {                                    
            note+=`  1 week later: quantity ${Math.min(inv["Unlocked for sale quantity"]-buff, qty)}\n`;                                    
            qty = qty - Math.min(inv["Unlocked for sale quantity"]-buff, qty);                                    
            buff=0;
        } else {
            buff-=Number(inv["Unlocked for sale quantity"]);
        }
    }          
    if (Number(inv["Quantity Incoming"])-2 > 0 && qty>0) {                                            
        if (Number(inv["Quantity Incoming"])-2 -buff > 0) {                  
            let inItems = tdPO.filter(p=>p.SKU.toUpperCase() == product.sku.toUpperCase());
            let i=0, totalP=buff, tempqty = qty;
            while (i<inItems.length && tempqty>0) {
                totalP+=Number(inItems[i]["Incoming Quantity"]);
                tempqty = tempqty - Math.min(Number(inItems[i]["Incoming Quantity"]), tempqty);
                i++;                                
            }
            if (i>0) {
                let inItem = inItems[i-1];
                let allureException = ['coco', 'rose', 'adele', 'angelina', 'jessica', 'selena', 'taylor', 'julia', 'nicole', 'gwyneth', 'ev7914', 'tl6814', 'ev5714', 'mo5514', 'mo7608', 'ev5512', 'ev5706', 'ev6810', 'eg6612', 'eh16', 'mh2206', 'sh5206', 'ep3608', 'mh2216', 'maya', 'noya'];
                let mdiff = monthDiff(new Date(), new Date(inItem["Arrival Due Date"]));
                if (mdiff==0) {                                    
                    if (allureException.includes(inItem["Part Number"])) {
                        mdiff+=3;
                    } else {
                        mdiff+=1;
                    }
                } else if (allureException.includes(inItem["Part Number"])) {
                    mdiff+=2;
                }                      
                let date1 = new Date();
                date1 = new Date(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate());
                const options = {year: 'numeric', month: 'long'};
                date1.setMonth(date1.getMonth()+Number(mdiff));
                note+=`  Incoming, ship out on ${date1.toLocaleDateString('en-US', options)}: quantity ${Math.min(totalP, qty)}\n`;
                qty = tempqty;
                buff=0;
            }
        } else {
            buff = buff - Number(inv["Quantity Incoming"]) + 2;
        }
    }
    if (qty>0) {              
        let m = inv["Virtual Location"].slice(0,-1);
        if (Number(m)) {
          let date2 = new Date();
          date2 = new Date(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate());
          date2.setMonth(date2.getMonth()+Number(m));
          note+=`  Preparing, ship out on ${date2.toLocaleDateString('en-US', options)}: quantity ${qty}\n`;
        } else {
          note+=`  Preparing time ${m.replace("_","-")} months later: quantity ${qty}\n`;
        }              
    }          
  }
  return note;
}

function addDeliverToNote(storehash, token, order, products) {
  let sku = products.map((p) => p.sku);        
  let filter = encodeURIComponent(`Any([SKU], '${sku.join(",")}')`);
  fetch(
      `https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_inv_tb}/select.json?column=*&column=Unlocked for sale quantity&column=Total On Hand&column=Total Request Quantity&filter=${filter}`
  )
      .then((r) => r.json())
      .then(async (d) => {
          console.log("teamdesk length: " + d.length);
          if (d.length > 0) {
              fetch(
                  `https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/${process.env.teamdesk_po_tb}/select.json?filter=${filter} and [Incoming Quantity]>0 and [Arrival Due Date]>ToDate('1/1/1')&sort=Arrival Due Date//ASC`
              )
                  .then((r) => r.json())
                  .then(async (tdPO) => {                        
                      addNoteContent(storehash, token, products, tdPO, d, order);
                  })
                  .catch((e) => console.log(e));
          } else {
              addNoteContent(storehash, token, products, [], [], order);
          }
      })
      .catch((e) => console.log(e));
}
function createTdInvoice(invoice) {
  fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/Invoice/upsert.json`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(invoice)
  })
  .then(r=>r.json())
  .then(r=>{
    console.log("created td invoice");
    console.log(util.inspect(r, false, null, true));
  })
  .catch(e=>console.log(e));
}
function createTdInvoiceItem(order, products, domain) {
  let invoice = {
    "Invoice Number": order.id,    
    "Invoice Link": domain+`/manage/orders/`+order.id,
    "Client Original": order.billing_address.country=="Canada"?"Canada":"USA & Other",
    "Client Email": order.billing_address.email,
    "Products Total Value": order.subtotal_ex_tax,
    "Payment Status": order.payment_status,
    "Payment Method": order.payment_method,
    "Shipment Collected": order.shipping_cost_inc_tax,
    "Invoice Grand Total": order.total_inc_tax,
    "Customer ID": order.customer_id    
  }
  if (order.billing_address) {
    let bill = order.billing_address;
    invoice["Billing Company"] = bill.company;
    invoice["Client First name"] = bill.first_name;
    invoice["Client Last name"] = bill.last_name;    
    invoice["Billing Address 1"] = bill.street_1;
    invoice["Billing Address 2"] = bill.street_2;
    invoice["Billing City"] = bill.city;
    invoice["Billing Zip"] = bill.zip;
    invoice["Billing State"] = bill.state;
    invoice["Billing Country"] = bill.country;
    invoice["Billing country ISO"] = bill.country_iso2;
    invoice["Phone"] = bill.phone;
  }
  if (Number(order.coupon_discount)>0) {
    invoice["Coupon Discount"]=order.coupon_discount;
  }
  if (Number(order.discount_amount)>0) {
    invoice["Discount Amount"]=order.discount_amount;
  }
  if (products.length>0) {
    let pds= [],pdprice=[],ptax=[], qty=[],wg=[],extax=[],intax=[];
    for (let val of products) {
      if (val.sku) {
        pds.push(val.sku);
      } else {
        pds.push(val.name);
      }
      qty.push(val.quantity);
      wg.push(val.weight);
      pdprice.push(val.price_ex_tax);
      extax.push(val.total_ex_tax);
      ptax.push(val.total_tax);
      intax.push(val.total_inc_tax);      
    }
    invoice["Products SKU"]=pds.join(",");
    invoice["Products1 quantity"] = qty.join(",");
    invoice["Products1 Weight"] = wg.join(",");
    invoice["Products1 Price"] = pdprice.join(",");
    invoice["Products1 Excl Tax"] = extax.join(",");
    invoice["Products tax"]=ptax.join(",");
    invoice["Products1 total Include Tax"]=intax.join(",");
    createTdInvoice(invoice);
  }
}
function checkAndUpdateGenCCustomer(storehash, id, token) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/customers?id%3Ain=${id}`, {
      method: 'GET',
      headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-auth-token': token
      }
  })
  .then(r => r.json())
  .then(r => {
      if (r.data) {
        if (r.data.length>0) {
          if (r.data[0].customer_group_id == 3) {
            fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/customers`, {
                method: 'PUT',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify([
                    {
                        id,
                        customer_group_id: 2
                    }
                ])
            })
            .then(r => r.json())
            .catch(e=>console.log(e))

          }
        }
      }            
  })
  .catch(e=>console.log(e))
}
function getProductsFromBC(storehash, id, token, noNote=false) {  
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/orders/${id}`, {
    headers: {
      "x-auth-token": token,
      "accept": "application/json",
      "content-type": "application/json"
    }
  })
    .then(result => result.json())
    .then(order => {
      console.log(util.inspect(order, true, null, false));
      if (storehash == process.env.bc_genc_storehash) {
        checkAndUpdateGenCCustomer(storehash, order.customer_id, token);
      } else {
        if (order.status) {
          if (order.customer_message.includes("Order system note") == false && order.order_source!="external") {
            console.log(order.status);
            fetch(
              `https://api.bigcommerce.com/stores/${storehash}/v2/orders/${id}/products`,
              {
                headers: {
                  "x-auth-token": token,
                  accept: "application/json",
                  "content-type": "application/json",
                },
              }
            )
              .then((result) => result.json())
              .then((products) => {
                // console.log("products");
                // console.log(util.inspect(products, false, null, true));
                // response.json({ result: "done" });
                if (Array.isArray(products)) {
                  // addDeliverToNote(storehash, token, order, products);
                  if (storehash == process.env.bc_storehash) {
                    createTdInvoiceItem(order,products, "https://www.superhairpieces.com");
                  } else if (storehash == process.env.bc_storehash1) {
                    createTdInvoiceItem(order,products, "https://superhairpieces.ca");
                  } else if (storehash == process.env.bc_eu_storehash) {
                    createTdInvoiceItem(order,products, "https://superhairpieces.nl");
                  } else if (storehash == process.env.bc_fr_storehash) {
                    createTdInvoiceItem(order,products, "https://superhairpieces.fr");
                  }
                  if (noNote == false) {
                    setTimeout(function() {
                      addDeliverToNote(storehash, token, order, products);
                    },1e3);
                  }
                } else {
                  console.log("no product information");
                }
              })
              .catch((error) => {
                console.log(error);
                console.log("could not get products from order");
              });
          }
        } else {
          console.log("no status");
        }
      }      
    })
    .catch(error => {
      console.log(error);      
    });
}
function addTeamdeskDelivery(id, dlmethod) {  
  setTimeout(function() {    
    fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/Invoice/select.json?filter=[Invoice Number]=${id}`)
    .then(r=>r.json())
    .then(r=>{
      if (r.length>0) {
        if (r[0]["Delivery Method"] == null) {          
          fetch(`https://www.teamdesk.net/secure/api/v2/${process.env.teamdesk_store}/${process.env.teamdesk_token}/Invoice/upsert.json`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              "@row.id": r[0]["@row.id"],
              "Delivery Method": dlmethod
            })
          })
          .then(rrr=>rrr.json())
          .then(rrr=>{
            console.log(rrr);
          })
          .catch(e=>console.log(e));
        }
      }
    })
    .catch(e=>console.log(e));
  }, 36e4);
}
app.post("/test-teamdesk-delivery", (request, response) => {
  const {id, dlmethod} = request.body;
  addTeamdeskDelivery(id, dlmethod);
  response.json({run:"running.."});
});
/**
* Add GTA information to customer once they make order based on their shipping address
* This is GTA information https://en.wikipedia.org/wiki/Greater_Toronto_Area#/media/File:Greater_toronto_area_map.svg
*
* @params {string} email Customer email address
* @params {string} key Omnisend token
* @params {string} firstName Customer first name
* @params {string} lastName Customer last name
* @params {boolean} isGTA True if latest shipping address in GTA
*/
function addOmnisendGTA(email, key, firstName, lastName, isGTA) {
  fetch(
    `https://api.omnisend.com/v3/contacts?email=${email}`,
    {
      method: "PATCH",
      headers: {
        "x-api-key": key,
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        tags: ["source: BigCommerce API"],
        customProperties: {
          isGTA,
        },
      }),
    }
  )
    .then((result) => result.json())
    .then((data) => {
      console.log(data);                  
    });
}
function loadAndSearchCustomerPhone(storehash, id, token, note=null) {
  console.log("customer phone");
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/orders/${id}/shipping_addresses`, {
    headers: {
      "x-auth-token": token,
      accept: "application/json",
      "content-type": "application/json"
    }
  })
    .then(result => result.json())
    .then(d => {      
      // twilioSendSMS(process.env.TWILIO_PHONE, phone, `Hi ${customer.first_name} ${customer.last_name}. Your Superhairpieces order #${id} has been confirmed! We will provide you with a tracking number once it's shipped.`);                    
      if (d.length>0) {
        let shipping = d[0];
        if (shipping.country == "United States" || shipping.country == "Canada") {
          let phone = shipping.phone.replace(/[ |\-|(|)]+/g,"");
          if (phone.includes("+")) {
            twilioSendSMS(process.env.TWILIO_PHONE, phone, `Hi ${shipping.first_name} ${shipping.last_name}. Your order #${id} has been confirmed! Tracking no. will be provided once shipped. Please do not reply.`);                    
            // twilioSendSMS(process.env.TWILIO_PHONE, process.env.rc_phone_from, `Hi ${shipping.first_name} ${shipping.last_name}. Your order #${id} ${phone}. country ${shipping.country}`);                    
          } else if (phone[0]=='1') {                  
            twilioSendSMS(process.env.TWILIO_PHONE, '+'+phone, `Hi ${shipping.first_name} ${shipping.last_name}. Your order #${id} has been confirmed! Tracking no. will be provided once shipped. Please do not reply.`);                                    
            // twilioSendSMS(process.env.TWILIO_PHONE, process.env.rc_phone_from, `Hi ${shipping.first_name} ${shipping.last_name}. Your order #${id} --add +${phone}. country ${shipping.country}`);                    
          } else {                  
            twilioSendSMS(process.env.TWILIO_PHONE, '+1'+phone, `Hi ${shipping.first_name} ${shipping.last_name}. Your order #${id} has been confirmed! Tracking no. will be provided once shipped. Please do not reply.`);                                     
            // twilioSendSMS(process.env.TWILIO_PHONE, process.env.rc_phone_from, `Hi ${shipping.first_name} ${shipping.last_name}. Your order #${id} --add-- +1${phone}. country ${shipping.country}`);                    
          }
        }
        if (note) {
          let omnkey, omnevid;
          if (storehash==process.env.bc_storehash) {
            omnkey = process.env.omnisend_key;
            omnevid = process.env.omn_confirm_event_id;
          } else {
            omnkey = process.env.omnisend_key1;
            omnevid = process.env.omn_confirm_event_id1;
          }
          fetch(`https://api.omnisend.com/v3/events/${omnevid}`, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-api-key': omnkey,
              accept: 'application/json'
            },
            body: JSON.stringify({
              email: shipping.email,
              fields: {
                recipient_name: `${shipping.first_name} ${shipping.last_name}`,
                order_number: `${id}`,
                system_order_note: note.replace(/\n/g,'<br/>')
              }
            })
          })
          .then(r=>{
            console.log(r);
          })  
          .catch(e=>{
            console.log(e);          
          }); 
        }
        console.log("will run add td delivery");
        addTeamdeskDelivery(id, shipping.shipping_method);
        if (storehash == process.env.bc_storehash1) {
          if (shipping.shipping_zone_name == "GTA Same day zone") {
            addOmnisendGTA(shipping.email, process.env.omnisend_key1, shipping.first_name, shipping.last_name, true)
          } else {
            addOmnisendGTA(shipping.email, process.env.omnisend_key1, shipping.first_name, shipping.last_name, false)
          }
          // if (shipping.state.toLowerCase().includes("ontario")) {
          //   let cities = ["ajax","aurora","brampton","brock","burlington","caledon","clarington","east gwilimbury","georgina","halton hills","king","markham","milton","mississauga","newmarket","oakville","oshawa","pickering","richmond hill","scugog","toronto","uxbridge","vaughan","whitby","whitchurch-stouffville"];
          //   const result = cities.findIndex(element => {
          //     return element.toLowerCase() === shipping.city.toLowerCase();
          //   });
          //   if (result>=0) {
          //     addOmnisendGTA(shipping.email, process.env.omnisend_key1, shipping.first_name, shipping.last_name, true)
          //   } else {
          //     addOmnisendGTA(shipping.email, process.env.omnisend_key1, shipping.first_name, shipping.last_name, false)
          //   }
          // }
        }
      }
    })
    .catch(error => {
      console.log(error);      
    });
}
app.post("/bc-order-status-updated", (request, response)=> {
  console.log(request.body);
  let { store_id, data } = request.body;
  response.json({ result: "working on it.." });
  if (data.status.previous_status_id==0) {
    if (store_id == process.env.bc_store_id) {      
      // getProductsFromBC(
      //   process.env.bc_storehash,
      //   data.id,               
      //   process.env.bc_tokenmo
      // );      
    } else if (store_id == process.env.bc_store1_id) {      
      // getProductsFromBC(
      //   process.env.bc_storehash1,
      //   data.id,                
      //   process.env.bc_token1mo
      // );      
    } else if (store_id == process.env.bc_eu_storeid) {
      getProductsFromBC(
        process.env.bc_eu_storehash,
        data.id,                
        process.env.bc_eu_token
      );      
    } else if (store_id == process.env.bc_fr_storeid) {
      getProductsFromBC(
        process.env.bc_fr_storehash,
        data.id,                
        process.env.bc_fr_token
      );      
    } else if (store_id == process.env.bc_es_storeid) {
      getProductsFromBC(
        process.env.bc_es_storehash,
        data.id,                
        process.env.bc_es_token
      );      
    } else if (store_id == process.env.bc_genc_storeid) {
      getBCOrder(process.env.bc_genc_storehash, process.env.bc_genc_token, data.id, response)
    } else {
      // getProductsFromBC(
      //   process.env.bc_storehash2,
      //   data.id,                
      //   process.env.bc_token2
      // ); 
      // getProductsFromBC(process.env.bc_sandbox_storehash,
      //   data.id,               
      //   process.env.bc_sandbox_token
      // );
    }
  }
})
app.post("/bc-order-created", (request, response) => {
  console.log(request.body);
  response.json({result: 'working on...'});
  // if (request.body) {
  //   let { store_id, producer, data } = request.body;
  //   if (store_id == process.env.bc_store_id) {      
  //     getProductsFromBC(
  //       process.env.bc_storehash,
  //       data.id,               
  //       process.env.bc_tokenmo
  //     );      
  //   } else if (store_id == process.env.bc_store1_id) {      
  //     getProductsFromBC(
  //       process.env.bc_storehash1,
  //       data.id,                
  //       process.env.bc_token1mo
  //     );      
  //   }
  // }
});
// app.get("/bc-instock", (request, response) => {
//   // console.log(request.header('Origin'));
//   let whitelist = ['https://www.superhairpieces.com', 'https://superhairpieces.com', 'https://superhairpieces.ca', 'https://superhairpiecessandbox4.mybigcommerce.com'];
//   whitelist = [...whitelist, 'http://localhost:3000', undefined];
//   if (whitelist.includes(request.header('Origin'))) {
//     response.header("Access-Control-Allow-Origin", "*");
//     response.header(
//       "Access-Control-Allow-Headers",
//       "Origin, X-Requested-With, Content-Type, Accept"
//     );
//     let {category, pageSize, page} = request.query;
//     fetch(`https://api.bigcommerce.com/stores/${process.env.bc_storehash}/v3/catalog/products?page=${page}&limit=${pageSize}&inventory_low=0&include=primary_image&&categories:in=${category}`, {
//       method: 'GET',
//       headers: {
//         "x-auth-token": process.env.bc_token
//       }
//     })
//     .then(r=>r.json())
//     .then(d=>{
//       // console.log(util.inspect(d, false, null, true));
//       response.json(d);
//     })
//     .catch(e=>console.log(e));
    
//   //   fetch('https://www.superhairpieces.com/graphql', {
//   //     method: 'POST',
//   //     headers: {
//   //       'Content-Type': 'application/json',
//   //       'Authorization': `Bearer ${process.env.bc_storefront_token}`
//   //     },
//   //     body: JSON.stringify({
//   //       query: `query paginateProducts(
//   //         $pageSize: Int = 250
//   //         $cursor: String
//   //       ) {
//   //         site {
//   //           products (first: $pageSize, after:$cursor, hideOutOfStock: true) {
//   //             pageInfo {
//   //               startCursor
//   //               endCursor
//   //             }
//   //             edges {
//   //               cursor
//   //               node {
//   //                 entityId
//   //                 name
//   //                 sku
//   //                 path
//   //                 inventory {
//   //                   isInStock
//   //                   hasVariantInventory
//   //                 }
//   //                 defaultImage {
//   //                   urlOriginal
//   //                 }
//   //               }
//   //             }
//   //           }
//   //         }
//   //       }`
//   //     })
//   //   })
//   //   .then(r=>r.json())
//   //   .then(data => {
//   //     console.log(util.inspect(data, false, null, true));
//   //     response.json({result: "done"});
//   //   })
//   //   .catch(e=>{
//   //     console.log(e)
//   //     response.json({result: "error"});
//   //   })
//   } else {
//     response.json({})
//   }  
// })
function twilioSendSMS(from, to, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;  
  const client = require('twilio')(accountSid, authToken);
  client.messages
  .create({
     body,
     from,
     statusCallback: '',
     to
   })
  .then(message => console.log(message.sid));  
}
function sendSMS(from, to, text) {
  const accountId = process.env.rc_account_id;
  const extensionId = process.env.rc_extension_id;
  const SDK = require("ringcentral");
  const rcsdk = new SDK({
    server: SDK.server.production,
    appKey: process.env.rc_client_id,
    appSecret: process.env.rc_client_secret
  });
  const platform = rcsdk.platform();
  const body = {
    from: {
      phoneNumber: from
    },
    to: [
      {
        phoneNumber: to
      }
    ],
    text: text
  };

  platform
    .login({
      username: process.env.rc_username,
      extension: process.env.rc_extension,
      password: process.env.rc_password
    })
    .then(() => {
      platform
        .post(
          `/restapi/v1.0/account/${accountId}/extension/${extensionId}/sms`,
          body
        )
        .then(r => {
          // console.log(r);
          console.log(text);
        });
    });
}
function loadAndSearchCustomer(phone, page, totalPage, found, empid = null) {
  if ((page > totalPage && page > 1) || found) {
    if (found) {
      fetch(
        `https://api.bigcommerce.com/stores/${process.env.bc_storehash}/v2/orders?sort=date_created%3Adesc&customer_id=${empid}&limit=1`,
        {
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-auth-token": process.env.bc_token
          }
        }
      )
        .then(rs => rs.json())
        .then(dt => {
          // console.log(dt);
          sendSMS(process.env.rc_phone_from, phone, dt[0].status);
        })
        .catch(err => {
          console.log(err);
          sendSMS(
            process.env.rc_phone_from,
            phone,
            "We can not find the order based on your phone number. Please contact customer support for your order"
          );
        });
    } else {
      sendSMS(
        process.env.rc_phone_from,
        phone,
        "We can not find the order based on your phone number. Please contact customer support for your order"
      );
    }
  } else {
    fetch(
      `https://api.bigcommerce.com/stores/${process.env.bc_storehash}/v3/customers?limit=250&page=${page}`,
      {
        headers: {
          "x-auth-token": process.env.bc_token
        }
      }
    )
      .then(result => result.json())
      .then(data => {
        if (data.data) {
          for (let i = 0; i <= data.data.length; i++) {
            if (i == data.data.length) {
              loadAndSearchCustomer(
                phone,
                page + 1,
                data.meta.pagination.total_pages,
                false
              );
            }
            let emp = data.data[i];
            if (emp) {
              if (emp.phone) {
                // console.log(emp.phone.replace(/[(]+|[)]+|[\s]+|[-]+|[.]/g, ''));
                let emp_phone = emp.phone.replace(
                  /[(]+|[)]+|[\s]+|[-]+|[.]/g,
                  ""
                );
                if (phone.includes(emp_phone) && emp_phone.length >= 10) {
                  console.log(emp);
                  loadAndSearchCustomer(phone, page, totalPage, true, emp.id);
                  break;
                }
              }
            }
          }
        } else {
          sendSMS(
            process.env.rc_phone_from,
            phone,
            "We can not find the order based on your phone number. Please contact customer support for your order"
          );
        }
      })
      .catch(err => console.log(err));
  }
}
app.post("/rcwebhook", (request, response) => {
  response.header("Validation-Token", request.headers["validation-token"]);
  console.log(request.body);
  response.json({ done: "done" });
  // loadAndSearchCustomer(request.body.body.from.phoneNumber, 1, 0, false, null);
});
function updateGroupToOmnisendFromBc(id, storehash, key, token) {
  fetch(
    `https://api.bigcommerce.com/stores/${storehash}/v3/customers?id:in=${id}`,
    {
      headers: {
        "x-auth-token": token,
      },
    }
  )
    .then((result) => result.json())
    .then((customers) => {
      // console.log(customers);
      if (customers.data.length > 0) {
        let customer = customers.data[0];
        fetch(
          `https://api.bigcommerce.com/stores/${storehash}/v2/customer_groups/${customer.customer_group_id}`,
          {
            headers: {
              "x-auth-token": token,
              accept: "application/json",
            },
          }
        )
          .then((result) => result.json())
          .then((group) => {
            // console.log(group);
            if (group.name) {
              fetch(
                `https://api.omnisend.com/v3/contacts?email=${customer.email}`,
                {
                  method: "PATCH",
                  headers: {
                    "x-api-key": key,
                    accept: "application/json",
                    "content-type": "application/json",
                  },
                  body: JSON.stringify({
                    firstName: customer.first_name,
                    lastName: customer.last_name,
                    tags: ["source: BigCommerce API"],
                    customProperties: {
                      Customer_Group: group.name,
                    },
                  }),
                }
              )
                .then((result) => result.json())
                .then((data) => {
                  console.log(data);                  
                });
            }
          })
          .catch((error) => {
            console.log(error);            
          });
      }
    })
    .catch((error) => {
      console.log(error);      
    });
}
app.post("/omn-bc-webhook-update", (request, response) => {
  console.log(request.body);
  response.json({"result": "working on it"});
  if (request.body) {
    let { store_id, producer, data } = request.body;
    if (store_id == process.env.bc_store_id) {
      updateGroupToOmnisendFromBc(
        data.id,
        process.env.bc_storehash,
        process.env.omnisend_key,
        process.env.bc_token
      );
    } else if (store_id == process.env.bc_store1_id) {
      updateGroupToOmnisendFromBc(
        data.id,
        process.env.bc_storehash1,
        process.env.omnisend_key1,
        process.env.bc_token1
      );
    }
  }
});
function addGroupToOmnisendFromBc(response, id, storehash, created_at, key, token) {
  fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/customers?id:in=${id}`, {
        headers: {
          "x-auth-token": token
        }
      })
      .then(result => result.json())
      .then(customers=>{
        // console.log(customers);
        if (customers.data.length>0) {
          let customer = customers.data[0];
          fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/customer_groups/${customer.customer_group_id}`,{
            headers: {
              "x-auth-token": token,
              "accept": "application/json"
            }
          })
          .then(result => result.json())
          .then(group=>{
            // console.log(group);
            if (group.name) {
              fetch(`https://api.omnisend.com/v3/contacts`, {
                method: 'POST',
                headers: {
                  "x-api-key": key,
                  "content-type": "application/json"                  
                },
                body: JSON.stringify({
                  firstName: customer.first_name,
                  lastName: customer.last_name,
                  tags: ['source: BigCommerce API'],
                  identifiers: [
                    {
                      type: 'email',
                      id: customer.email,
                      channels: {
                        email: {
                          status: 'subscribed',
                          statusDate: new Date(created_at*1000).toISOString()
                        }
                      }
                    }
                  ],
                  customProperties: {
                    Customer_Group: group.name
                  }
                })
              })
              .then(result=>{
                // console.log(result);
                response.json({done: "done"});
              })
              .catch(error=>{
                console.log(error);
                response.json({error: 'Could not add to omnisend'});
              })
            }
          })
          .catch(error=> {
            console.log(error);
            response.json({error: "could not find group"});
          })
        }
      })
      .catch(error=>{
        console.log(error);
        response.json({error: "could not find customer"})
      })
}
app.post("/omn-bc-webook", (request, response) => {
  console.log(request.body);  
  if (request.body) {
    let {store_id, producer, data, created_at} = request.body;    
    if (store_id == process.env.bc_store_id) {
      addGroupToOmnisendFromBc(response, data.id, process.env.bc_storehash, created_at, process.env.omnisend_key, process.env.bc_token)
    } else if (store_id == process.env.bc_store1_id) {      
      addGroupToOmnisendFromBc(response, data.id, process.env.bc_storehash1, created_at, process.env.omnisend_key1, process.env.bc_token1)
    }
  }
})
function sendSentimentScore(storehash, omnkey, email) {
  fetch(
    `https://stamped.io/api/v2/${storehash}/dashboard/customers/?search=${email}`,
    {
      method: "get",
      headers: {
        Authorization: process.env.stamped_auth
      }
    }
  )
    .then(result => result.json())
    .then(data => {
      // console.log(data);
      if (data.results.length > 0) {
        // console.log(data.results[0].customer.sentimentScore);
        fetch(`https://api.omnisend.com/v3/contacts?email=${email}`, {
          method: "patch",
          headers: {
            "X-API-KEY": omnkey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            tags: ['source: Stamped API'],
            customProperties: {
              stamped_sentimentScore: data.results[0].customer.sentimentScore
            }
          })
        })
          .then(result => result.json())
          .then(data => {
            // console.log(data);      
            console.log("updated sentiment score");
          })
          .catch(error => {
            console.log("error", error);            
          });
      } else {
        console.log("no data in stamped");
      }
    })
    .catch(error => {
      console.log(error);      
    });
}
function checkStampedReview(storehash, omnkey, omnevid, email) {
  fetch(`https://stamped.io/api/v2/${storehash}/dashboard/reviews/?search=${email}`,
  {
    method: "get",
    headers: {
      Authorization: process.env.stamped_auth
    }
  })
  .then(r=>r.json())
  .then(d=>{
    // console.log(d);
    if (d.results) {
      if (d.results.length>0) {
        let rv = d.results[0];
        console.log(rv.review.id);
        if (rv.review.isRecommend) {
          if (rv.review.imagesFileName || rv.review.imagesFileNamePublished || rv.review.videosFileName || rv.review.videosFileNamePublished) {} else {
            console.log("will call event sending email");
            fetch(`https://api.omnisend.com/v3/events/${omnevid}`, {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
                'x-api-key': omnkey,
                accept: 'application/json'
              },
              body: JSON.stringify({
                email: email,
                fields: {
                  recipient_name: `${rv.customer.firstName} ${rv.customer.lastName}`,
                  review_score: rv.review.rating
                }
              })
            })
            .then(r=>{
              console.log(r);
            })  
            .catch(e=>{
              console.log(e);          
            }); 
          }
        }
      }
    }
  })
}
app.post("/omnwebhook", (request, response) => {
  console.log(request.body);
  let {customerEmail, productUrl, reviewRating} = request.body;
  if (customerEmail) {
    response.json({result: "will send sentiment score"});
    let requestEmail = customerEmail;
    // let requestEmail = "nha@superhairpieces.com";
    sendSentimentScore(process.env.stamped_us_storehash, process.env.omnisend_key, requestEmail);
    if (reviewRating>=4) {
      checkStampedReview(process.env.stamped_us_storehash, process.env.omnisend_key, process.env.omnisend_ask_review_event_id, requestEmail);
    }
  } else {
    response.json({ result: "no email" });
  }  
});
app.post("/omnwebhook1", (request, response) => {
  console.log(request.body);
  let {customerEmail, productUrl, reviewRating} = request.body;
  if (customerEmail) {
    response.json({result: "will send sentiment score"});
    let requestEmail = customerEmail;
    // let requestEmail = "nha@superhairpieces.com";
    sendSentimentScore(process.env.stamped_canada_storehash, process.env.omnisend_key1, requestEmail);
    if (reviewRating>=4) {
      checkStampedReview(process.env.stamped_canada_storehash, process.env.omnisend_key1, process.env.omnisend_ask_review_event_id1, requestEmail);
    }
  } else {
    response.json({ result: "no email" });
  }  
});
function IPtoNum(ip) {
  return Number(
    ip
      .split(".")
      .map(d => ("000" + d).substr(-3))
      .join("")
  );
}
app.get("/ip-check", cors(corsOptions), (request, response)=> {
  fetch("http://www.geoplugin.net/json.gp", {
    headers: {
      accept: 'application/json'
    }
  })
  .then(r=>r.json())
  .then(r=>response.json(r))
  .catch(e=>{
    console.log(e);
    response.json({error: e});
  })
});
app.get("/ip-china", (request, response) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  let iprange = [
    {
      begin: "1.0.8.0",
      beginNo: 1000008000,
      end: "1.0.15.255",
      endNo: 1000015255
    },
    {
      begin: "1.0.32.0",
      beginNo: 1000032000,
      end: "1.0.63.255",
      endNo: 1000063255
    },
    {
      begin: "1.1.2.0",
      beginNo: 1001002000,
      end: "1.1.63.255",
      endNo: 1001063255
    },
    {
      begin: "1.2.4.0",
      beginNo: 1002004000,
      end: "1.2.127.255",
      endNo: 1002127255
    },
    {
      begin: "1.3.0.0",
      beginNo: 1003000000,
      end: "1.3.255.255",
      endNo: 1003255255
    },
    {
      begin: "1.4.1.0",
      beginNo: 1004001000,
      end: "1.4.127.255",
      endNo: 1004127255
    },
    {
      begin: "1.8.0.0",
      beginNo: 1008000000,
      end: "1.8.255.255",
      endNo: 1008255255
    },
    {
      begin: "1.10.0.0",
      beginNo: 1010000000,
      end: "1.10.9.255",
      endNo: 1010009255
    },
    {
      begin: "1.10.11.0",
      beginNo: 1010011000,
      end: "1.10.127.255",
      endNo: 1010127255
    },
    {
      begin: "1.12.0.0",
      beginNo: 1012000000,
      end: "1.15.255.255",
      endNo: 1015255255
    },
    {
      begin: "1.24.0.0",
      beginNo: 1024000000,
      end: "1.31.255.255",
      endNo: 1031255255
    },
    {
      begin: "1.45.0.0",
      beginNo: 1045000000,
      end: "1.45.255.255",
      endNo: 1045255255
    },
    {
      begin: "1.48.0.0",
      beginNo: 1048000000,
      end: "1.51.255.255",
      endNo: 1051255255
    },
    {
      begin: "1.56.0.0",
      beginNo: 1056000000,
      end: "1.63.255.255",
      endNo: 1063255255
    },
    {
      begin: "1.68.0.0",
      beginNo: 1068000000,
      end: "1.71.255.255",
      endNo: 1071255255
    },
    {
      begin: "1.80.0.0",
      beginNo: 1080000000,
      end: "1.95.255.255",
      endNo: 1095255255
    },
    {
      begin: "1.116.0.0",
      beginNo: 1116000000,
      end: "1.119.255.255",
      endNo: 1119255255
    },
    {
      begin: "1.180.0.0",
      beginNo: 1180000000,
      end: "1.185.255.255",
      endNo: 1185255255
    },
    {
      begin: "1.188.0.0",
      beginNo: 1188000000,
      end: "1.199.255.255",
      endNo: 1199255255
    },
    {
      begin: "1.202.0.0",
      beginNo: 1202000000,
      end: "1.207.255.255",
      endNo: 1207255255
    },
    {
      begin: "8.128.0.0",
      beginNo: 8128000000,
      end: "8.191.255.255",
      endNo: 8191255255
    },
    {
      begin: "8.210.69.0",
      beginNo: 8210069000,
      end: "8.210.73.255",
      endNo: 8210073255
    },
    {
      begin: "14.0.0.0",
      beginNo: 14000000000,
      end: "14.0.7.255",
      endNo: 14000007255
    },
    {
      begin: "14.16.0.0",
      beginNo: 14016000000,
      end: "14.31.255.255",
      endNo: 14031255255
    },
    {
      begin: "14.103.0.0",
      beginNo: 14103000000,
      end: "14.127.255.255",
      endNo: 14127255255
    },
    {
      begin: "14.130.0.0",
      beginNo: 14130000000,
      end: "14.131.255.255",
      endNo: 14131255255
    },
    {
      begin: "14.134.0.0",
      beginNo: 14134000000,
      end: "14.135.255.255",
      endNo: 14135255255
    },
    {
      begin: "14.144.0.0",
      beginNo: 14144000000,
      end: "14.159.255.255",
      endNo: 14159255255
    },
    {
      begin: "14.196.0.0",
      beginNo: 14196000000,
      end: "14.197.255.255",
      endNo: 14197255255
    },
    {
      begin: "14.204.0.0",
      beginNo: 14204000000,
      end: "14.205.255.255",
      endNo: 14205255255
    },
    {
      begin: "14.208.0.0",
      beginNo: 14208000000,
      end: "14.223.255.255",
      endNo: 14223255255
    },
    {
      begin: "17.81.15.0",
      beginNo: 17081015000,
      end: "17.81.25.255",
      endNo: 17081025255
    },
    {
      begin: "17.81.27.0",
      beginNo: 17081027000,
      end: "17.81.38.255",
      endNo: 17081038255
    },
    {
      begin: "17.81.41.0",
      beginNo: 17081041000,
      end: "17.81.57.255",
      endNo: 17081057255
    },
    {
      begin: "17.81.146.0",
      beginNo: 17081146000,
      end: "17.81.154.255",
      endNo: 17081154255
    },
    {
      begin: "17.85.192.0",
      beginNo: 17085192000,
      end: "17.85.207.255",
      endNo: 17085207255
    },
    {
      begin: "17.87.0.0",
      beginNo: 17087000000,
      end: "17.87.47.255",
      endNo: 17087047255
    },
    {
      begin: "17.87.50.0",
      beginNo: 17087050000,
      end: "17.87.54.255",
      endNo: 17087054255
    },
    {
      begin: "17.87.56.0",
      beginNo: 17087056000,
      end: "17.87.83.255",
      endNo: 17087083255
    },
    {
      begin: "17.87.96.0",
      beginNo: 17087096000,
      end: "17.87.119.255",
      endNo: 17087119255
    },
    {
      begin: "17.87.144.0",
      beginNo: 17087144000,
      end: "17.87.159.255",
      endNo: 17087159255
    },
    {
      begin: "17.88.0.0",
      beginNo: 17088000000,
      end: "17.88.63.255",
      endNo: 17088063255
    },
    {
      begin: "17.88.80.0",
      beginNo: 17088080000,
      end: "17.88.103.255",
      endNo: 17088103255
    },
    {
      begin: "17.88.128.0",
      beginNo: 17088128000,
      end: "17.88.206.255",
      endNo: 17088206255
    },
    {
      begin: "17.93.8.0",
      beginNo: 17093008000,
      end: "17.93.15.255",
      endNo: 17093015255
    },
    {
      begin: "17.93.24.0",
      beginNo: 17093024000,
      end: "17.93.31.255",
      endNo: 17093031255
    },
    {
      begin: "17.93.48.0",
      beginNo: 17093048000,
      end: "17.93.79.255",
      endNo: 17093079255
    },
    {
      begin: "17.93.96.0",
      beginNo: 17093096000,
      end: "17.93.127.255",
      endNo: 17093127255
    },
    {
      begin: "17.93.136.0",
      beginNo: 17093136000,
      end: "17.93.143.255",
      endNo: 17093143255
    },
    {
      begin: "17.93.152.0",
      beginNo: 17093152000,
      end: "17.93.159.255",
      endNo: 17093159255
    },
    {
      begin: "17.93.184.0",
      beginNo: 17093184000,
      end: "17.93.191.255",
      endNo: 17093191255
    },
    {
      begin: "17.93.200.0",
      beginNo: 17093200000,
      end: "17.93.223.255",
      endNo: 17093223255
    },
    {
      begin: "17.93.232.0",
      beginNo: 17093232000,
      end: "17.93.239.255",
      endNo: 17093239255
    },
    {
      begin: "17.94.16.0",
      beginNo: 17094016000,
      end: "17.94.175.255",
      endNo: 17094175255
    },
    {
      begin: "17.94.184.0",
      beginNo: 17094184000,
      end: "17.94.231.255",
      endNo: 17094231255
    },
    {
      begin: "17.94.240.0",
      beginNo: 17094240000,
      end: "17.94.247.255",
      endNo: 17094247255
    },
    {
      begin: "17.235.160.0",
      beginNo: 17235160000,
      end: "17.235.175.255",
      endNo: 17235175255
    },
    {
      begin: "27.0.128.0",
      beginNo: 27000128000,
      end: "27.0.135.255",
      endNo: 27000135255
    },
    {
      begin: "27.0.160.0",
      beginNo: 27000160000,
      end: "27.0.167.255",
      endNo: 27000167255
    },
    {
      begin: "27.0.204.0",
      beginNo: 27000204000,
      end: "27.0.215.255",
      endNo: 27000215255
    },
    {
      begin: "27.8.0.0",
      beginNo: 27008000000,
      end: "27.31.255.255",
      endNo: 27031255255
    },
    {
      begin: "27.34.232.0",
      beginNo: 27034232000,
      end: "27.34.239.255",
      endNo: 27034239255
    },
    {
      begin: "27.36.0.0",
      beginNo: 27036000000,
      end: "27.47.255.255",
      endNo: 27047255255
    },
    {
      begin: "27.50.40.0",
      beginNo: 27050040000,
      end: "27.50.47.255",
      endNo: 27050047255
    },
    {
      begin: "27.50.128.0",
      beginNo: 27050128000,
      end: "27.50.255.255",
      endNo: 27050255255
    },
    {
      begin: "27.54.72.0",
      beginNo: 27054072000,
      end: "27.54.79.255",
      endNo: 27054079255
    },
    {
      begin: "27.54.152.0",
      beginNo: 27054152000,
      end: "27.54.159.255",
      endNo: 27054159255
    },
    {
      begin: "27.54.192.0",
      beginNo: 27054192000,
      end: "27.54.255.255",
      endNo: 27054255255
    },
    {
      begin: "27.98.208.0",
      beginNo: 27098208000,
      end: "27.98.255.255",
      endNo: 27098255255
    },
    {
      begin: "27.99.128.0",
      beginNo: 27099128000,
      end: "27.99.255.255",
      endNo: 27099255255
    },
    {
      begin: "27.103.0.0",
      beginNo: 27103000000,
      end: "27.103.255.255",
      endNo: 27103255255
    },
    {
      begin: "27.106.128.0",
      beginNo: 27106128000,
      end: "27.106.191.255",
      endNo: 27106191255
    },
    {
      begin: "27.109.32.0",
      beginNo: 27109032000,
      end: "27.109.63.255",
      endNo: 27109063255
    },
    {
      begin: "27.112.0.0",
      beginNo: 27112000000,
      end: "27.112.63.255",
      endNo: 27112063255
    },
    {
      begin: "27.112.80.0",
      beginNo: 27112080000,
      end: "27.112.95.255",
      endNo: 27112095255
    },
    {
      begin: "27.112.112.0",
      beginNo: 27112112000,
      end: "27.112.119.255",
      endNo: 27112119255
    },
    {
      begin: "27.113.128.0",
      beginNo: 27113128000,
      end: "27.113.191.255",
      endNo: 27113191255
    },
    {
      begin: "27.115.0.0",
      beginNo: 27115000000,
      end: "27.115.127.255",
      endNo: 27115127255
    },
    {
      begin: "27.121.72.0",
      beginNo: 27121072000,
      end: "27.121.79.255",
      endNo: 27121079255
    },
    {
      begin: "27.121.120.0",
      beginNo: 27121120000,
      end: "27.121.127.255",
      endNo: 27121127255
    },
    {
      begin: "27.128.0.0",
      beginNo: 27128000000,
      end: "27.129.255.255",
      endNo: 27129255255
    },
    {
      begin: "27.144.0.0",
      beginNo: 27144000000,
      end: "27.144.255.255",
      endNo: 27144255255
    },
    {
      begin: "27.148.0.0",
      beginNo: 27148000000,
      end: "27.159.255.255",
      endNo: 27159255255
    },
    {
      begin: "27.184.0.0",
      beginNo: 27184000000,
      end: "27.227.255.255",
      endNo: 27227255255
    },
    {
      begin: "36.0.8.0",
      beginNo: 36000008000,
      end: "36.1.255.255",
      endNo: 36001255255
    },
    {
      begin: "36.4.0.0",
      beginNo: 36004000000,
      end: "36.7.255.255",
      endNo: 36007255255
    },
    {
      begin: "36.16.0.0",
      beginNo: 36016000000,
      end: "36.37.31.255",
      endNo: 36037031255
    },
    {
      begin: "36.37.39.0",
      beginNo: 36037039000,
      end: "36.37.63.255",
      endNo: 36037063255
    },
    {
      begin: "36.40.0.0",
      beginNo: 36040000000,
      end: "36.49.255.255",
      endNo: 36049255255
    },
    {
      begin: "36.51.0.0",
      beginNo: 36051000000,
      end: "36.51.255.255",
      endNo: 36051255255
    },
    {
      begin: "36.56.0.0",
      beginNo: 36056000000,
      end: "36.63.255.255",
      endNo: 36063255255
    },
    {
      begin: "36.96.0.0",
      beginNo: 36096000000,
      end: "36.223.255.255",
      endNo: 36223255255
    },
    {
      begin: "36.248.0.0",
      beginNo: 36248000000,
      end: "36.251.255.255",
      endNo: 36251255255
    },
    {
      begin: "36.254.0.0",
      beginNo: 36254000000,
      end: "36.254.255.255",
      endNo: 36254255255
    },
    {
      begin: "36.255.172.0",
      beginNo: 36255172000,
      end: "36.255.179.255",
      endNo: 36255179255
    },
    {
      begin: "39.0.2.0",
      beginNo: 39000002000,
      end: "39.0.255.255",
      endNo: 39000255255
    },
    {
      begin: "39.64.0.0",
      beginNo: 39064000000,
      end: "39.108.255.255",
      endNo: 39108255255
    },
    {
      begin: "39.128.0.0",
      beginNo: 39128000000,
      end: "39.191.255.255",
      endNo: 39191255255
    },
    {
      begin: "40.72.0.0",
      beginNo: 40072000000,
      end: "40.73.255.255",
      endNo: 40073255255
    },
    {
      begin: "40.125.128.0",
      beginNo: 40125128000,
      end: "40.125.255.255",
      endNo: 40125255255
    },
    {
      begin: "40.126.64.0",
      beginNo: 40126064000,
      end: "40.126.127.255",
      endNo: 40126127255
    },
    {
      begin: "42.0.8.0",
      beginNo: 42000008000,
      end: "42.0.27.255",
      endNo: 42000027255
    },
    {
      begin: "42.0.32.0",
      beginNo: 42000032000,
      end: "42.0.63.255",
      endNo: 42000063255
    },
    {
      begin: "42.0.128.0",
      beginNo: 42000128000,
      end: "42.1.59.255",
      endNo: 42001059255
    },
    {
      begin: "42.1.128.0",
      beginNo: 42001128000,
      end: "42.1.255.255",
      endNo: 42001255255
    },
    {
      begin: "42.4.0.0",
      beginNo: 42004000000,
      end: "42.7.255.255",
      endNo: 42007255255
    },
    {
      begin: "42.48.0.0",
      beginNo: 42048000000,
      end: "42.59.255.255",
      endNo: 42059255255
    },
    {
      begin: "42.62.0.0",
      beginNo: 42062000000,
      end: "42.62.175.255",
      endNo: 42062175255
    },
    {
      begin: "42.62.180.0",
      beginNo: 42062180000,
      end: "42.62.191.255",
      endNo: 42062191255
    },
    {
      begin: "42.63.0.0",
      beginNo: 42063000000,
      end: "42.63.255.255",
      endNo: 42063255255
    },
    {
      begin: "42.80.0.0",
      beginNo: 42080000000,
      end: "42.81.255.255",
      endNo: 42081255255
    },
    {
      begin: "42.83.64.0",
      beginNo: 42083064000,
      end: "42.83.83.255",
      endNo: 42083083255
    },
    {
      begin: "42.83.88.0",
      beginNo: 42083088000,
      end: "42.95.255.255",
      endNo: 42095255255
    },
    {
      begin: "42.96.64.0",
      beginNo: 42096064000,
      end: "42.96.103.255",
      endNo: 42096103255
    },
    {
      begin: "42.96.108.0",
      beginNo: 42096108000,
      end: "42.97.255.255",
      endNo: 42097255255
    },
    {
      begin: "42.99.0.0",
      beginNo: 42099000000,
      end: "42.99.115.255",
      endNo: 42099115255
    },
    {
      begin: "42.99.120.0",
      beginNo: 42099120000,
      end: "42.99.127.255",
      endNo: 42099127255
    },
    {
      begin: "42.100.0.0",
      beginNo: 42100000000,
      end: "42.103.255.255",
      endNo: 42103255255
    },
    {
      begin: "42.120.0.0",
      beginNo: 42120000000,
      end: "42.123.31.255",
      endNo: 42123031255
    },
    {
      begin: "42.123.36.0",
      beginNo: 42123036000,
      end: "42.123.255.255",
      endNo: 42123255255
    },
    {
      begin: "42.128.0.0",
      beginNo: 42128000000,
      end: "42.143.255.255",
      endNo: 42143255255
    },
    {
      begin: "42.156.0.0",
      beginNo: 42156000000,
      end: "42.156.31.255",
      endNo: 42156031255
    },
    {
      begin: "42.156.36.0",
      beginNo: 42156036000,
      end: "42.187.123.255",
      endNo: 42187123255
    },
    {
      begin: "42.187.128.0",
      beginNo: 42187128000,
      end: "42.187.255.255",
      endNo: 42187255255
    },
    {
      begin: "42.192.0.0",
      beginNo: 42192000000,
      end: "42.199.255.255",
      endNo: 42199255255
    },
    {
      begin: "42.201.0.0",
      beginNo: 42201000000,
      end: "42.201.127.255",
      endNo: 42201127255
    },
    {
      begin: "42.202.0.0",
      beginNo: 42202000000,
      end: "42.240.255.255",
      endNo: 42240255255
    },
    {
      begin: "42.242.0.0",
      beginNo: 42242000000,
      end: "42.255.255.255",
      endNo: 42255255255
    },
    {
      begin: "43.0.1.0",
      beginNo: 43000001000,
      end: "43.191.255.255",
      endNo: 43191255255
    },
    {
      begin: "43.224.52.0",
      beginNo: 43224052000,
      end: "43.224.59.255",
      endNo: 43224059255
    },
    {
      begin: "43.224.68.0",
      beginNo: 43224068000,
      end: "43.224.75.255",
      endNo: 43224075255
    },
    {
      begin: "43.224.200.0",
      beginNo: 43224200000,
      end: "43.224.219.255",
      endNo: 43224219255
    },
    {
      begin: "43.225.120.0",
      beginNo: 43225120000,
      end: "43.225.127.255",
      endNo: 43225127255
    },
    {
      begin: "43.225.216.0",
      beginNo: 43225216000,
      end: "43.225.247.255",
      endNo: 43225247255
    },
    {
      begin: "43.226.32.0",
      beginNo: 43226032000,
      end: "43.226.123.255",
      endNo: 43226123255
    },
    {
      begin: "43.226.128.0",
      beginNo: 43226128000,
      end: "43.226.215.255",
      endNo: 43226215255
    },
    {
      begin: "43.226.236.0",
      beginNo: 43226236000,
      end: "43.227.11.255",
      endNo: 43227011255
    },
    {
      begin: "43.227.32.0",
      beginNo: 43227032000,
      end: "43.227.107.255",
      endNo: 43227107255
    },
    {
      begin: "43.227.136.0",
      beginNo: 43227136000,
      end: "43.227.147.255",
      endNo: 43227147255
    },
    {
      begin: "43.227.152.0",
      beginNo: 43227152000,
      end: "43.227.183.255",
      endNo: 43227183255
    },
    {
      begin: "43.227.188.0",
      beginNo: 43227188000,
      end: "43.227.223.255",
      endNo: 43227223255
    },
    {
      begin: "43.227.232.0",
      beginNo: 43227232000,
      end: "43.227.236.255",
      endNo: 43227236255
    },
    {
      begin: "43.227.248.0",
      beginNo: 43227248000,
      end: "43.228.71.255",
      endNo: 43228071255
    },
    {
      begin: "43.228.116.0",
      beginNo: 43228116000,
      end: "43.228.123.255",
      endNo: 43228123255
    },
    {
      begin: "43.228.132.0",
      beginNo: 43228132000,
      end: "43.228.139.255",
      endNo: 43228139255
    },
    {
      begin: "43.228.148.0",
      beginNo: 43228148000,
      end: "43.228.155.255",
      endNo: 43228155255
    },
    {
      begin: "43.229.136.0",
      beginNo: 43229136000,
      end: "43.229.147.255",
      endNo: 43229147255
    },
    {
      begin: "43.229.168.0",
      beginNo: 43229168000,
      end: "43.229.199.255",
      endNo: 43229199255
    },
    {
      begin: "43.229.216.0",
      beginNo: 43229216000,
      end: "43.229.223.255",
      endNo: 43229223255
    },
    {
      begin: "43.229.232.0",
      beginNo: 43229232000,
      end: "43.229.239.255",
      endNo: 43229239255
    },
    {
      begin: "43.230.68.0",
      beginNo: 43230068000,
      end: "43.230.75.255",
      endNo: 43230075255
    },
    {
      begin: "43.230.220.0",
      beginNo: 43230220000,
      end: "43.230.255.255",
      endNo: 43230255255
    },
    {
      begin: "43.231.32.0",
      beginNo: 43231032000,
      end: "43.231.47.255",
      endNo: 43231047255
    },
    {
      begin: "43.231.80.0",
      beginNo: 43231080000,
      end: "43.231.111.255",
      endNo: 43231111255
    },
    {
      begin: "43.231.136.0",
      beginNo: 43231136000,
      end: "43.231.183.255",
      endNo: 43231183255
    },
    {
      begin: "43.236.0.0",
      beginNo: 43236000000,
      end: "43.239.51.255",
      endNo: 43239051255
    },
    {
      begin: "43.239.116.0",
      beginNo: 43239116000,
      end: "43.239.123.255",
      endNo: 43239123255
    },
    {
      begin: "43.239.172.0",
      beginNo: 43239172000,
      end: "43.239.179.255",
      endNo: 43239179255
    },
    {
      begin: "43.240.56.0",
      beginNo: 43240056000,
      end: "43.240.63.255",
      endNo: 43240063255
    },
    {
      begin: "43.240.68.0",
      beginNo: 43240068000,
      end: "43.240.79.255",
      endNo: 43240079255
    },
    {
      begin: "43.240.124.0",
      beginNo: 43240124000,
      end: "43.240.139.255",
      endNo: 43240139255
    },
    {
      begin: "43.240.156.0",
      beginNo: 43240156000,
      end: "43.240.223.255",
      endNo: 43240223255
    },
    {
      begin: "43.240.240.0",
      beginNo: 43240240000,
      end: "43.241.23.255",
      endNo: 43241023255
    },
    {
      begin: "43.241.76.0",
      beginNo: 43241076000,
      end: "43.241.95.255",
      endNo: 43241095255
    },
    {
      begin: "43.241.168.0",
      beginNo: 43241168000,
      end: "43.241.187.255",
      endNo: 43241187255
    },
    {
      begin: "43.241.208.0",
      beginNo: 43241208000,
      end: "43.241.243.255",
      endNo: 43241243255
    },
    {
      begin: "43.241.248.0",
      beginNo: 43241248000,
      end: "43.241.255.255",
      endNo: 43241255255
    },
    {
      begin: "43.242.8.0",
      beginNo: 43242008000,
      end: "43.242.31.255",
      endNo: 43242031255
    },
    {
      begin: "43.242.44.0",
      beginNo: 43242044000,
      end: "43.242.67.255",
      endNo: 43242067255
    },
    {
      begin: "43.242.72.0",
      beginNo: 43242072000,
      end: "43.242.99.255",
      endNo: 43242099255
    },
    {
      begin: "43.242.144.0",
      beginNo: 43242144000,
      end: "43.242.171.255",
      endNo: 43242171255
    },
    {
      begin: "43.242.188.0",
      beginNo: 43242188000,
      end: "43.242.199.255",
      endNo: 43242199255
    },
    {
      begin: "43.242.216.0",
      beginNo: 43242216000,
      end: "43.242.223.255",
      endNo: 43242223255
    },
    {
      begin: "43.243.4.0",
      beginNo: 43243004000,
      end: "43.243.19.255",
      endNo: 43243019255
    },
    {
      begin: "43.243.144.0",
      beginNo: 43243144000,
      end: "43.243.151.255",
      endNo: 43243151255
    },
    {
      begin: "43.243.228.0",
      beginNo: 43243228000,
      end: "43.243.235.255",
      endNo: 43243235255
    },
    {
      begin: "43.246.0.0",
      beginNo: 43246000000,
      end: "43.246.99.255",
      endNo: 43246099255
    },
    {
      begin: "43.247.4.0",
      beginNo: 43247004000,
      end: "43.247.11.255",
      endNo: 43247011255
    },
    {
      begin: "43.247.44.0",
      beginNo: 43247044000,
      end: "43.247.51.255",
      endNo: 43247051255
    },
    {
      begin: "43.247.84.0",
      beginNo: 43247084000,
      end: "43.247.103.255",
      endNo: 43247103255
    },
    {
      begin: "43.247.108.0",
      beginNo: 43247108000,
      end: "43.247.115.255",
      endNo: 43247115255
    },
    {
      begin: "43.247.148.0",
      beginNo: 43247148000,
      end: "43.247.155.255",
      endNo: 43247155255
    },
    {
      begin: "43.247.176.0",
      beginNo: 43247176000,
      end: "43.247.191.255",
      endNo: 43247191255
    },
    {
      begin: "43.247.196.0",
      beginNo: 43247196000,
      end: "43.248.7.255",
      endNo: 43248007255
    },
    {
      begin: "43.248.76.0",
      beginNo: 43248076000,
      end: "43.248.151.255",
      endNo: 43248151255
    },
    {
      begin: "43.248.176.0",
      beginNo: 43248176000,
      end: "43.248.211.255",
      endNo: 43248211255
    },
    {
      begin: "43.248.228.0",
      beginNo: 43248228000,
      end: "43.248.235.255",
      endNo: 43248235255
    },
    {
      begin: "43.249.132.0",
      beginNo: 43249132000,
      end: "43.249.139.255",
      endNo: 43249139255
    },
    {
      begin: "43.249.144.0",
      beginNo: 43249144000,
      end: "43.249.171.255",
      endNo: 43249171255
    },
    {
      begin: "43.250.12.0",
      beginNo: 43250012000,
      end: "43.250.23.255",
      endNo: 43250023255
    },
    {
      begin: "43.250.28.0",
      beginNo: 43250028000,
      end: "43.250.39.255",
      endNo: 43250039255
    },
    {
      begin: "43.250.96.0",
      beginNo: 43250096000,
      end: "43.250.103.255",
      endNo: 43250103255
    },
    {
      begin: "43.250.108.0",
      beginNo: 43250108000,
      end: "43.250.119.255",
      endNo: 43250119255
    },
    {
      begin: "43.250.144.0",
      beginNo: 43250144000,
      end: "43.250.151.255",
      endNo: 43250151255
    },
    {
      begin: "43.250.212.0",
      beginNo: 43250212000,
      end: "43.250.223.255",
      endNo: 43250223255
    },
    {
      begin: "43.251.4.0",
      beginNo: 43251004000,
      end: "43.251.11.255",
      endNo: 43251011255
    },
    {
      begin: "43.251.232.0",
      beginNo: 43251232000,
      end: "43.251.239.255",
      endNo: 43251239255
    },
    {
      begin: "43.254.0.0",
      beginNo: 43254000000,
      end: "43.254.11.255",
      endNo: 43254011255
    },
    {
      begin: "43.254.84.0",
      beginNo: 43254084000,
      end: "43.254.95.255",
      endNo: 43254095255
    },
    {
      begin: "43.254.100.0",
      beginNo: 43254100000,
      end: "43.254.107.255",
      endNo: 43254107255
    },
    {
      begin: "43.254.112.0",
      beginNo: 43254112000,
      end: "43.254.119.255",
      endNo: 43254119255
    },
    {
      begin: "43.254.136.0",
      beginNo: 43254136000,
      end: "43.254.159.255",
      endNo: 43254159255
    },
    {
      begin: "43.254.168.0",
      beginNo: 43254168000,
      end: "43.254.175.255",
      endNo: 43254175255
    },
    {
      begin: "43.254.180.0",
      beginNo: 43254180000,
      end: "43.254.196.255",
      endNo: 43254196255
    },
    {
      begin: "43.254.199.0",
      beginNo: 43254199000,
      end: "43.254.203.255",
      endNo: 43254203255
    },
    {
      begin: "43.254.220.0",
      beginNo: 43254220000,
      end: "43.254.243.255",
      endNo: 43254243255
    },
    {
      begin: "43.254.248.0",
      beginNo: 43254248000,
      end: "43.255.11.255",
      endNo: 43255011255
    },
    {
      begin: "43.255.64.0",
      beginNo: 43255064000,
      end: "43.255.79.255",
      endNo: 43255079255
    },
    {
      begin: "43.255.200.0",
      beginNo: 43255200000,
      end: "43.255.215.255",
      endNo: 43255215255
    },
    {
      begin: "43.255.224.0",
      beginNo: 43255224000,
      end: "43.255.235.255",
      endNo: 43255235255
    },
    {
      begin: "45.40.192.0",
      beginNo: 45040192000,
      end: "45.40.215.255",
      endNo: 45040215255
    },
    {
      begin: "45.40.224.0",
      beginNo: 45040224000,
      end: "45.40.255.255",
      endNo: 45040255255
    },
    {
      begin: "45.65.16.0",
      beginNo: 45065016000,
      end: "45.65.31.255",
      endNo: 45065031255
    },
    {
      begin: "45.112.208.0",
      beginNo: 45112208000,
      end: "45.112.223.255",
      endNo: 45112223255
    },
    {
      begin: "45.112.228.0",
      beginNo: 45112228000,
      end: "45.112.239.255",
      endNo: 45112239255
    },
    {
      begin: "45.113.12.0",
      beginNo: 45113012000,
      end: "45.113.31.255",
      endNo: 45113031255
    },
    {
      begin: "45.113.52.0",
      beginNo: 45113052000,
      end: "45.113.59.255",
      endNo: 45113059255
    },
    {
      begin: "45.113.144.0",
      beginNo: 45113144000,
      end: "45.113.151.255",
      endNo: 45113151255
    },
    {
      begin: "45.113.200.0",
      beginNo: 45113200000,
      end: "45.113.223.255",
      endNo: 45113223255
    },
    {
      begin: "45.113.252.0",
      beginNo: 45113252000,
      end: "45.114.3.255",
      endNo: 45114003255
    },
    {
      begin: "45.114.196.0",
      beginNo: 45114196000,
      end: "45.114.203.255",
      endNo: 45114203255
    },
    {
      begin: "45.115.244.0",
      beginNo: 45115244000,
      end: "45.115.251.255",
      endNo: 45115251255
    },
    {
      begin: "45.116.32.0",
      beginNo: 45116032000,
      end: "45.116.39.255",
      endNo: 45116039255
    },
    {
      begin: "45.116.96.0",
      beginNo: 45116096000,
      end: "45.116.103.255",
      endNo: 45116103255
    },
    {
      begin: "45.119.60.0",
      beginNo: 45119060000,
      end: "45.119.75.255",
      endNo: 45119075255
    },
    {
      begin: "45.121.64.0",
      beginNo: 45121064000,
      end: "45.121.75.255",
      endNo: 45121075255
    },
    {
      begin: "45.121.92.0",
      beginNo: 45121092000,
      end: "45.121.99.255",
      endNo: 45121099255
    },
    {
      begin: "45.121.172.0",
      beginNo: 45121172000,
      end: "45.121.179.255",
      endNo: 45121179255
    },
    {
      begin: "45.121.240.0",
      beginNo: 45121240000,
      end: "45.122.43.255",
      endNo: 45122043255
    },
    {
      begin: "45.122.60.0",
      beginNo: 45122060000,
      end: "45.122.119.255",
      endNo: 45122119255
    },
    {
      begin: "45.122.160.0",
      beginNo: 45122160000,
      end: "45.122.219.255",
      endNo: 45122219255
    },
    {
      begin: "45.123.28.0",
      beginNo: 45123028000,
      end: "45.123.39.255",
      endNo: 45123039255
    },
    {
      begin: "45.123.44.0",
      beginNo: 45123044000,
      end: "45.123.91.255",
      endNo: 45123091255
    },
    {
      begin: "45.123.128.0",
      beginNo: 45123128000,
      end: "45.123.139.255",
      endNo: 45123139255
    },
    {
      begin: "45.123.148.0",
      beginNo: 45123148000,
      end: "45.123.159.255",
      endNo: 45123159255
    },
    {
      begin: "45.123.164.0",
      beginNo: 45123164000,
      end: "45.123.187.255",
      endNo: 45123187255
    },
    {
      begin: "45.123.224.0",
      beginNo: 45123224000,
      end: "45.124.3.255",
      endNo: 45124003255
    },
    {
      begin: "45.124.28.0",
      beginNo: 45124028000,
      end: "45.124.39.255",
      endNo: 45124039255
    },
    {
      begin: "45.124.76.0",
      beginNo: 45124076000,
      end: "45.124.83.255",
      endNo: 45124083255
    },
    {
      begin: "45.124.172.0",
      beginNo: 45124172000,
      end: "45.124.179.255",
      endNo: 45124179255
    },
    {
      begin: "45.125.12.0",
      beginNo: 45125012000,
      end: "45.125.19.255",
      endNo: 45125019255
    },
    {
      begin: "45.125.24.0",
      beginNo: 45125024000,
      end: "45.125.31.255",
      endNo: 45125031255
    },
    {
      begin: "45.125.52.0",
      beginNo: 45125052000,
      end: "45.125.59.255",
      endNo: 45125059255
    },
    {
      begin: "45.125.76.0",
      beginNo: 45125076000,
      end: "45.125.107.255",
      endNo: 45125107255
    },
    {
      begin: "45.126.48.0",
      beginNo: 45126048000,
      end: "45.126.55.255",
      endNo: 45126055255
    },
    {
      begin: "45.126.108.0",
      beginNo: 45126108000,
      end: "45.126.123.255",
      endNo: 45126123255
    },
    {
      begin: "45.127.8.0",
      beginNo: 45127008000,
      end: "45.127.15.255",
      endNo: 45127015255
    },
    {
      begin: "45.127.144.0",
      beginNo: 45127144000,
      end: "45.127.151.255",
      endNo: 45127151255
    },
    {
      begin: "45.248.80.0",
      beginNo: 45248080000,
      end: "45.248.91.255",
      endNo: 45248091255
    },
    {
      begin: "45.248.96.0",
      beginNo: 45248096000,
      end: "45.248.111.255",
      endNo: 45248111255
    },
    {
      begin: "45.248.128.0",
      beginNo: 45248128000,
      end: "45.248.135.255",
      endNo: 45248135255
    },
    {
      begin: "45.248.204.0",
      beginNo: 45248204000,
      end: "45.249.7.255",
      endNo: 45249007255
    },
    {
      begin: "45.249.12.0",
      beginNo: 45249012000,
      end: "45.249.39.255",
      endNo: 45249039255
    },
    {
      begin: "45.249.188.0",
      beginNo: 45249188000,
      end: "45.249.215.255",
      endNo: 45249215255
    },
    {
      begin: "45.250.12.0",
      beginNo: 45250012000,
      end: "45.250.19.255",
      endNo: 45250019255
    },
    {
      begin: "45.250.28.0",
      beginNo: 45250028000,
      end: "45.250.43.255",
      endNo: 45250043255
    },
    {
      begin: "45.250.76.0",
      beginNo: 45250076000,
      end: "45.250.99.255",
      endNo: 45250099255
    },
    {
      begin: "45.250.104.0",
      beginNo: 45250104000,
      end: "45.250.155.255",
      endNo: 45250155255
    },
    {
      begin: "45.250.180.0",
      beginNo: 45250180000,
      end: "45.250.195.255",
      endNo: 45250195255
    },
    {
      begin: "45.251.16.0",
      beginNo: 45251016000,
      end: "45.251.23.255",
      endNo: 45251023255
    },
    {
      begin: "45.251.84.0",
      beginNo: 45251084000,
      end: "45.251.103.255",
      endNo: 45251103255
    },
    {
      begin: "45.251.120.0",
      beginNo: 45251120000,
      end: "45.251.127.255",
      endNo: 45251127255
    },
    {
      begin: "45.251.136.0",
      beginNo: 45251136000,
      end: "45.251.227.255",
      endNo: 45251227255
    },
    {
      begin: "45.252.0.0",
      beginNo: 45252000000,
      end: "45.252.51.255",
      endNo: 45252051255
    },
    {
      begin: "45.252.84.0",
      beginNo: 45252084000,
      end: "45.252.179.255",
      endNo: 45252179255
    },
    {
      begin: "45.252.192.0",
      beginNo: 45252192000,
      end: "45.252.235.255",
      endNo: 45252235255
    },
    {
      begin: "45.253.0.0",
      beginNo: 45253000000,
      end: "45.253.87.255",
      endNo: 45253087255
    },
    {
      begin: "45.253.92.0",
      beginNo: 45253092000,
      end: "45.253.123.255",
      endNo: 45253123255
    },
    {
      begin: "45.253.132.0",
      beginNo: 45253132000,
      end: "45.253.243.255",
      endNo: 45253243255
    },
    {
      begin: "45.254.0.0",
      beginNo: 45254000000,
      end: "45.254.23.255",
      endNo: 45254023255
    },
    {
      begin: "45.254.48.0",
      beginNo: 45254048000,
      end: "45.254.231.255",
      endNo: 45254231255
    },
    {
      begin: "45.254.236.0",
      beginNo: 45254236000,
      end: "45.254.243.255",
      endNo: 45254243255
    },
    {
      begin: "45.255.0.0",
      beginNo: 45255000000,
      end: "45.255.123.255",
      endNo: 45255123255
    },
    {
      begin: "45.255.136.0",
      beginNo: 45255136000,
      end: "45.255.251.255",
      endNo: 45255251255
    },
    {
      begin: "47.92.0.0",
      beginNo: 47092000000,
      end: "47.127.255.255",
      endNo: 47127255255
    },
    {
      begin: "49.4.0.0",
      beginNo: 49004000000,
      end: "49.7.255.255",
      endNo: 49007255255
    },
    {
      begin: "49.52.0.0",
      beginNo: 49052000000,
      end: "49.55.255.255",
      endNo: 49055255255
    },
    {
      begin: "49.64.0.0",
      beginNo: 49064000000,
      end: "49.95.255.255",
      endNo: 49095255255
    },
    {
      begin: "49.112.0.0",
      beginNo: 49112000000,
      end: "49.123.255.255",
      endNo: 49123255255
    },
    {
      begin: "49.128.2.0",
      beginNo: 49128002000,
      end: "49.128.7.255",
      endNo: 49128007255
    },
    {
      begin: "49.140.0.0",
      beginNo: 49140000000,
      end: "49.141.255.255",
      endNo: 49141255255
    },
    {
      begin: "49.152.0.0",
      beginNo: 49152000000,
      end: "49.155.255.255",
      endNo: 49155255255
    },
    {
      begin: "49.208.0.0",
      beginNo: 49208000000,
      end: "49.211.255.255",
      endNo: 49211255255
    },
    {
      begin: "49.220.0.0",
      beginNo: 49220000000,
      end: "49.223.255.255",
      endNo: 49223255255
    },
    {
      begin: "49.232.0.0",
      beginNo: 49232000000,
      end: "49.235.255.255",
      endNo: 49235255255
    },
    {
      begin: "49.239.0.0",
      beginNo: 49239000000,
      end: "49.239.63.255",
      endNo: 49239063255
    },
    {
      begin: "49.239.192.0",
      beginNo: 49239192000,
      end: "49.239.255.255",
      endNo: 49239255255
    },
    {
      begin: "49.246.224.0",
      beginNo: 49246224000,
      end: "49.246.255.255",
      endNo: 49246255255
    },
    {
      begin: "52.80.0.0",
      beginNo: 52080000000,
      end: "52.83.255.255",
      endNo: 52083255255
    },
    {
      begin: "52.130.0.0",
      beginNo: 52130000000,
      end: "52.131.255.255",
      endNo: 52131255255
    },
    {
      begin: "54.222.0.0",
      beginNo: 54222000000,
      end: "54.223.255.255",
      endNo: 54223255255
    },
    {
      begin: "57.92.96.0",
      beginNo: 57092096000,
      end: "57.92.111.255",
      endNo: 57092111255
    },
    {
      begin: "58.14.0.0",
      beginNo: 58014000000,
      end: "58.25.255.255",
      endNo: 58025255255
    },
    {
      begin: "58.30.0.0",
      beginNo: 58030000000,
      end: "58.63.255.255",
      endNo: 58063255255
    },
    {
      begin: "58.65.232.0",
      beginNo: 58065232000,
      end: "58.65.239.255",
      endNo: 58065239255
    },
    {
      begin: "58.66.0.0",
      beginNo: 58066000000,
      end: "58.67.255.255",
      endNo: 58067255255
    },
    {
      begin: "58.68.128.0",
      beginNo: 58068128000,
      end: "58.68.255.255",
      endNo: 58068255255
    },
    {
      begin: "58.82.0.0",
      beginNo: 58082000000,
      end: "58.82.127.255",
      endNo: 58082127255
    },
    {
      begin: "58.83.0.0",
      beginNo: 58083000000,
      end: "58.83.255.255",
      endNo: 58083255255
    },
    {
      begin: "58.87.64.0",
      beginNo: 58087064000,
      end: "58.87.127.255",
      endNo: 58087127255
    },
    {
      begin: "58.99.128.0",
      beginNo: 58099128000,
      end: "58.101.255.255",
      endNo: 58101255255
    },
    {
      begin: "58.116.0.0",
      beginNo: 58116000000,
      end: "58.119.255.255",
      endNo: 58119255255
    },
    {
      begin: "58.128.0.0",
      beginNo: 58128000000,
      end: "58.135.255.255",
      endNo: 58135255255
    },
    {
      begin: "58.144.0.0",
      beginNo: 58144000000,
      end: "58.144.255.255",
      endNo: 58144255255
    },
    {
      begin: "58.154.0.0",
      beginNo: 58154000000,
      end: "58.155.255.255",
      endNo: 58155255255
    },
    {
      begin: "58.192.0.0",
      beginNo: 58192000000,
      end: "58.210.77.207",
      endNo: 58210077207
    },
    {
      begin: "58.210.77.212",
      beginNo: 58210077212,
      end: "58.223.255.255",
      endNo: 58223255255
    },
    {
      begin: "58.240.0.0",
      beginNo: 58240000000,
      end: "58.255.255.255",
      endNo: 58255255255
    },
    {
      begin: "59.32.0.0",
      beginNo: 59032000000,
      end: "59.83.255.255",
      endNo: 59083255255
    },
    {
      begin: "59.107.0.0",
      beginNo: 59107000000,
      end: "59.111.255.255",
      endNo: 59111255255
    },
    {
      begin: "59.151.0.0",
      beginNo: 59151000000,
      end: "59.151.127.255",
      endNo: 59151127255
    },
    {
      begin: "59.152.16.0",
      beginNo: 59152016000,
      end: "59.152.34.255",
      endNo: 59152034255
    },
    {
      begin: "59.152.64.0",
      beginNo: 59152064000,
      end: "59.152.79.255",
      endNo: 59152079255
    },
    {
      begin: "59.152.112.0",
      beginNo: 59152112000,
      end: "59.152.119.255",
      endNo: 59152119255
    },
    {
      begin: "59.153.60.0",
      beginNo: 59153060000,
      end: "59.153.75.255",
      endNo: 59153075255
    },
    {
      begin: "59.153.152.0",
      beginNo: 59153152000,
      end: "59.153.159.255",
      endNo: 59153159255
    },
    {
      begin: "59.153.164.0",
      beginNo: 59153164000,
      end: "59.153.195.255",
      endNo: 59153195255
    },
    {
      begin: "59.155.0.0",
      beginNo: 59155000000,
      end: "59.155.255.255",
      endNo: 59155255255
    },
    {
      begin: "59.172.0.0",
      beginNo: 59172000000,
      end: "59.175.255.255",
      endNo: 59175255255
    },
    {
      begin: "59.191.0.0",
      beginNo: 59191000000,
      end: "59.191.127.255",
      endNo: 59191127255
    },
    {
      begin: "59.192.0.0",
      beginNo: 59192000000,
      end: "60.31.255.255",
      endNo: 60031255255
    },
    {
      begin: "60.55.0.0",
      beginNo: 60055000000,
      end: "60.55.255.255",
      endNo: 60055255255
    },
    {
      begin: "60.63.0.0",
      beginNo: 60063000000,
      end: "60.63.255.255",
      endNo: 60063255255
    },
    {
      begin: "60.160.0.0",
      beginNo: 60160000000,
      end: "60.191.255.255",
      endNo: 60191255255
    },
    {
      begin: "60.194.0.0",
      beginNo: 60194000000,
      end: "60.195.255.255",
      endNo: 60195255255
    },
    {
      begin: "60.200.0.0",
      beginNo: 60200000000,
      end: "60.223.255.255",
      endNo: 60223255255
    },
    {
      begin: "60.232.0.0",
      beginNo: 60232000000,
      end: "60.233.255.255",
      endNo: 60233255255
    },
    {
      begin: "60.235.0.0",
      beginNo: 60235000000,
      end: "60.235.255.255",
      endNo: 60235255255
    },
    {
      begin: "60.245.128.0",
      beginNo: 60245128000,
      end: "60.245.255.255",
      endNo: 60245255255
    },
    {
      begin: "60.247.0.0",
      beginNo: 60247000000,
      end: "60.247.255.255",
      endNo: 60247255255
    },
    {
      begin: "60.252.0.0",
      beginNo: 60252000000,
      end: "60.252.255.255",
      endNo: 60252255255
    },
    {
      begin: "60.253.128.0",
      beginNo: 60253128000,
      end: "60.253.255.255",
      endNo: 60253255255
    },
    {
      begin: "60.255.0.0",
      beginNo: 60255000000,
      end: "60.255.255.255",
      endNo: 60255255255
    },
    {
      begin: "61.4.80.0",
      beginNo: 61004080000,
      end: "61.4.95.255",
      endNo: 61004095255
    },
    {
      begin: "61.4.176.0",
      beginNo: 61004176000,
      end: "61.4.191.255",
      endNo: 61004191255
    },
    {
      begin: "61.8.160.0",
      beginNo: 61008160000,
      end: "61.8.175.255",
      endNo: 61008175255
    },
    {
      begin: "61.14.212.0",
      beginNo: 61014212000,
      end: "61.14.223.255",
      endNo: 61014223255
    },
    {
      begin: "61.14.240.0",
      beginNo: 61014240000,
      end: "61.14.247.255",
      endNo: 61014247255
    },
    {
      begin: "61.28.0.0",
      beginNo: 61028000000,
      end: "61.28.127.255",
      endNo: 61028127255
    },
    {
      begin: "61.29.128.0",
      beginNo: 61029128000,
      end: "61.29.239.255",
      endNo: 61029239255
    },
    {
      begin: "61.45.128.0",
      beginNo: 61045128000,
      end: "61.45.191.255",
      endNo: 61045191255
    },
    {
      begin: "61.45.224.0",
      beginNo: 61045224000,
      end: "61.45.239.255",
      endNo: 61045239255
    },
    {
      begin: "61.47.128.0",
      beginNo: 61047128000,
      end: "61.47.191.255",
      endNo: 61047191255
    },
    {
      begin: "61.48.0.0",
      beginNo: 61048000000,
      end: "61.55.255.255",
      endNo: 61055255255
    },
    {
      begin: "61.87.192.0",
      beginNo: 61087192000,
      end: "61.87.255.255",
      endNo: 61087255255
    },
    {
      begin: "61.128.0.0",
      beginNo: 61128000000,
      end: "61.191.255.255",
      endNo: 61191255255
    },
    {
      begin: "61.232.0.0",
      beginNo: 61232000000,
      end: "61.237.255.255",
      endNo: 61237255255
    },
    {
      begin: "61.240.0.0",
      beginNo: 61240000000,
      end: "61.243.255.255",
      endNo: 61243255255
    },
    {
      begin: "62.234.0.0",
      beginNo: 62234000000,
      end: "62.234.255.255",
      endNo: 62234255255
    },
    {
      begin: "64.101.224.0",
      beginNo: 64101224000,
      end: "64.101.255.255",
      endNo: 64101255255
    },
    {
      begin: "66.78.32.0",
      beginNo: 66078032000,
      end: "66.78.39.255",
      endNo: 66078039255
    },
    {
      begin: "66.78.48.0",
      beginNo: 66078048000,
      end: "66.78.55.255",
      endNo: 66078055255
    },
    {
      begin: "68.79.0.0",
      beginNo: 68079000000,
      end: "68.79.63.255",
      endNo: 68079063255
    },
    {
      begin: "69.230.192.0",
      beginNo: 69230192000,
      end: "69.230.255.255",
      endNo: 69230255255
    },
    {
      begin: "69.231.128.0",
      beginNo: 69231128000,
      end: "69.231.191.255",
      endNo: 69231191255
    },
    {
      begin: "69.234.192.0",
      beginNo: 69234192000,
      end: "69.234.255.255",
      endNo: 69234255255
    },
    {
      begin: "69.235.128.0",
      beginNo: 69235128000,
      end: "69.235.191.255",
      endNo: 69235191255
    },
    {
      begin: "71.131.192.0",
      beginNo: 71131192000,
      end: "71.132.63.255",
      endNo: 71132063255
    },
    {
      begin: "71.136.64.0",
      beginNo: 71136064000,
      end: "71.136.127.255",
      endNo: 71136127255
    },
    {
      begin: "71.137.0.0",
      beginNo: 71137000000,
      end: "71.137.63.255",
      endNo: 71137063255
    },
    {
      begin: "81.68.0.0",
      beginNo: 81068000000,
      end: "81.71.255.255",
      endNo: 81071255255
    },
    {
      begin: "82.156.0.0",
      beginNo: 82156000000,
      end: "82.157.255.255",
      endNo: 82157255255
    },
    {
      begin: "94.191.0.0",
      beginNo: 94191000000,
      end: "94.191.127.255",
      endNo: 94191127255
    },
    {
      begin: "101.4.0.0",
      beginNo: 101004000000,
      end: "101.7.255.255",
      endNo: 101007255255
    },
    {
      begin: "101.16.0.0",
      beginNo: 101016000000,
      end: "101.31.255.255",
      endNo: 101031255255
    },
    {
      begin: "101.33.128.0",
      beginNo: 101033128000,
      end: "101.36.95.255",
      endNo: 101036095255
    },
    {
      begin: "101.36.128.0",
      beginNo: 101036128000,
      end: "101.49.255.255",
      endNo: 101049255255
    },
    {
      begin: "101.50.8.0",
      beginNo: 101050008000,
      end: "101.50.15.255",
      endNo: 101050015255
    },
    {
      begin: "101.52.0.0",
      beginNo: 101052000000,
      end: "101.52.255.255",
      endNo: 101052255255
    },
    {
      begin: "101.54.0.0",
      beginNo: 101054000000,
      end: "101.54.255.255",
      endNo: 101054255255
    },
    {
      begin: "101.55.224.0",
      beginNo: 101055224000,
      end: "101.55.231.255",
      endNo: 101055231255
    },
    {
      begin: "101.64.0.0",
      beginNo: 101064000000,
      end: "101.78.3.255",
      endNo: 101078003255
    },
    {
      begin: "101.78.32.0",
      beginNo: 101078032000,
      end: "101.78.63.255",
      endNo: 101078063255
    },
    {
      begin: "101.80.0.0",
      beginNo: 101080000000,
      end: "101.96.11.255",
      endNo: 101096011255
    },
    {
      begin: "101.96.16.0",
      beginNo: 101096016000,
      end: "101.96.31.255",
      endNo: 101096031255
    },
    {
      begin: "101.96.128.0",
      beginNo: 101096128000,
      end: "101.96.255.255",
      endNo: 101096255255
    },
    {
      begin: "101.99.96.0",
      beginNo: 101099096000,
      end: "101.99.127.255",
      endNo: 101099127255
    },
    {
      begin: "101.101.64.0",
      beginNo: 101101064000,
      end: "101.101.95.255",
      endNo: 101101095255
    },
    {
      begin: "101.101.102.0",
      beginNo: 101101102000,
      end: "101.101.127.255",
      endNo: 101101127255
    },
    {
      begin: "101.102.64.0",
      beginNo: 101102064000,
      end: "101.102.95.255",
      endNo: 101102095255
    },
    {
      begin: "101.102.104.0",
      beginNo: 101102104000,
      end: "101.102.127.255",
      endNo: 101102127255
    },
    {
      begin: "101.104.0.0",
      beginNo: 101104000000,
      end: "101.107.255.255",
      endNo: 101107255255
    },
    {
      begin: "101.110.64.0",
      beginNo: 101110064000,
      end: "101.110.111.255",
      endNo: 101110111255
    },
    {
      begin: "101.110.116.0",
      beginNo: 101110116000,
      end: "101.110.127.255",
      endNo: 101110127255
    },
    {
      begin: "101.120.0.0",
      beginNo: 101120000000,
      end: "101.126.255.255",
      endNo: 101126255255
    },
    {
      begin: "101.128.8.0",
      beginNo: 101128008000,
      end: "101.128.63.255",
      endNo: 101128063255
    },
    {
      begin: "101.129.0.0",
      beginNo: 101129000000,
      end: "101.135.255.255",
      endNo: 101135255255
    },
    {
      begin: "101.144.0.0",
      beginNo: 101144000000,
      end: "101.159.255.255",
      endNo: 101159255255
    },
    {
      begin: "101.192.0.0",
      beginNo: 101192000000,
      end: "101.198.197.255",
      endNo: 101198197255
    },
    {
      begin: "101.198.200.0",
      beginNo: 101198200000,
      end: "101.201.255.255",
      endNo: 101201255255
    },
    {
      begin: "101.203.128.0",
      beginNo: 101203128000,
      end: "101.203.167.255",
      endNo: 101203167255
    },
    {
      begin: "101.203.172.0",
      beginNo: 101203172000,
      end: "101.203.191.255",
      endNo: 101203191255
    },
    {
      begin: "101.204.0.0",
      beginNo: 101204000000,
      end: "101.207.255.255",
      endNo: 101207255255
    },
    {
      begin: "101.224.0.0",
      beginNo: 101224000000,
      end: "101.233.255.255",
      endNo: 101233255255
    },
    {
      begin: "101.234.64.0",
      beginNo: 101234064000,
      end: "101.234.71.255",
      endNo: 101234071255
    },
    {
      begin: "101.234.76.0",
      beginNo: 101234076000,
      end: "101.234.127.255",
      endNo: 101234127255
    },
    {
      begin: "101.236.0.0",
      beginNo: 101236000000,
      end: "101.249.255.255",
      endNo: 101249255255
    },
    {
      begin: "101.251.8.0",
      beginNo: 101251008000,
      end: "101.254.255.255",
      endNo: 101254255255
    },
    {
      begin: "103.1.20.0",
      beginNo: 103001020000,
      end: "103.1.27.255",
      endNo: 103001027255
    },
    {
      begin: "103.2.200.0",
      beginNo: 103002200000,
      end: "103.2.215.255",
      endNo: 103002215255
    },
    {
      begin: "103.3.84.0",
      beginNo: 103003084000,
      end: "103.3.143.255",
      endNo: 103003143255
    },
    {
      begin: "103.3.148.0",
      beginNo: 103003148000,
      end: "103.3.159.255",
      endNo: 103003159255
    },
    {
      begin: "103.7.212.0",
      beginNo: 103007212000,
      end: "103.7.223.255",
      endNo: 103007223255
    },
    {
      begin: "103.8.0.0",
      beginNo: 103008000000,
      end: "103.8.11.255",
      endNo: 103008011255
    },
    {
      begin: "103.8.200.0",
      beginNo: 103008200000,
      end: "103.8.207.255",
      endNo: 103008207255
    },
    {
      begin: "103.9.248.0",
      beginNo: 103009248000,
      end: "103.10.3.255",
      endNo: 103010003255
    },
    {
      begin: "103.14.132.0",
      beginNo: 103014132000,
      end: "103.14.139.255",
      endNo: 103014139255
    },
    {
      begin: "103.15.4.0",
      beginNo: 103015004000,
      end: "103.15.11.255",
      endNo: 103015011255
    },
    {
      begin: "103.16.80.0",
      beginNo: 103016080000,
      end: "103.16.91.255",
      endNo: 103016091255
    },
    {
      begin: "103.18.208.0",
      beginNo: 103018208000,
      end: "103.18.215.255",
      endNo: 103018215255
    },
    {
      begin: "103.19.40.0",
      beginNo: 103019040000,
      end: "103.19.47.255",
      endNo: 103019047255
    },
    {
      begin: "103.19.64.0",
      beginNo: 103019064000,
      end: "103.19.75.255",
      endNo: 103019075255
    },
    {
      begin: "103.21.112.0",
      beginNo: 103021112000,
      end: "103.21.119.255",
      endNo: 103021119255
    },
    {
      begin: "103.21.136.0",
      beginNo: 103021136000,
      end: "103.21.143.255",
      endNo: 103021143255
    },
    {
      begin: "103.22.0.0",
      beginNo: 103022000000,
      end: "103.22.95.255",
      endNo: 103022095255
    },
    {
      begin: "103.22.100.0",
      beginNo: 103022100000,
      end: "103.22.127.255",
      endNo: 103022127255
    },
    {
      begin: "103.23.160.0",
      beginNo: 103023160000,
      end: "103.23.167.255",
      endNo: 103023167255
    },
    {
      begin: "103.25.20.0",
      beginNo: 103025020000,
      end: "103.25.43.255",
      endNo: 103025043255
    },
    {
      begin: "103.25.64.0",
      beginNo: 103025064000,
      end: "103.25.71.255",
      endNo: 103025071255
    },
    {
      begin: "103.26.156.0",
      beginNo: 103026156000,
      end: "103.26.163.255",
      endNo: 103026163255
    },
    {
      begin: "103.28.4.0",
      beginNo: 103028004000,
      end: "103.28.11.255",
      endNo: 103028011255
    },
    {
      begin: "103.29.128.0",
      beginNo: 103029128000,
      end: "103.29.139.255",
      endNo: 103029139255
    },
    {
      begin: "103.31.48.0",
      beginNo: 103031048000,
      end: "103.31.71.255",
      endNo: 103031071255
    },
    {
      begin: "103.32.0.0",
      beginNo: 103032000000,
      end: "103.35.51.255",
      endNo: 103035051255
    },
    {
      begin: "103.36.56.0",
      beginNo: 103036056000,
      end: "103.36.67.255",
      endNo: 103036067255
    },
    {
      begin: "103.36.132.0",
      beginNo: 103036132000,
      end: "103.36.139.255",
      endNo: 103036139255
    },
    {
      begin: "103.36.160.0",
      beginNo: 103036160000,
      end: "103.36.247.255",
      endNo: 103036247255
    },
    {
      begin: "103.37.12.0",
      beginNo: 103037012000,
      end: "103.37.19.255",
      endNo: 103037019255
    },
    {
      begin: "103.37.52.0",
      beginNo: 103037052000,
      end: "103.37.59.255",
      endNo: 103037059255
    },
    {
      begin: "103.37.100.0",
      beginNo: 103037100000,
      end: "103.37.107.255",
      endNo: 103037107255
    },
    {
      begin: "103.37.136.0",
      beginNo: 103037136000,
      end: "103.37.167.255",
      endNo: 103037167255
    },
    {
      begin: "103.37.172.0",
      beginNo: 103037172000,
      end: "103.37.179.255",
      endNo: 103037179255
    },
    {
      begin: "103.37.208.0",
      beginNo: 103037208000,
      end: "103.37.223.255",
      endNo: 103037223255
    },
    {
      begin: "103.37.248.0",
      beginNo: 103037248000,
      end: "103.38.3.255",
      endNo: 103038003255
    },
    {
      begin: "103.38.40.0",
      beginNo: 103038040000,
      end: "103.38.47.255",
      endNo: 103038047255
    },
    {
      begin: "103.38.92.0",
      beginNo: 103038092000,
      end: "103.38.99.255",
      endNo: 103038099255
    },
    {
      begin: "103.38.224.0",
      beginNo: 103038224000,
      end: "103.38.235.255",
      endNo: 103038235255
    },
    {
      begin: "103.39.100.0",
      beginNo: 103039100000,
      end: "103.39.111.255",
      endNo: 103039111255
    },
    {
      begin: "103.39.160.0",
      beginNo: 103039160000,
      end: "103.39.191.255",
      endNo: 103039191255
    },
    {
      begin: "103.39.200.0",
      beginNo: 103039200000,
      end: "103.39.235.255",
      endNo: 103039235255
    },
    {
      begin: "103.40.12.0",
      beginNo: 103040012000,
      end: "103.40.47.255",
      endNo: 103040047255
    },
    {
      begin: "103.40.228.0",
      beginNo: 103040228000,
      end: "103.41.3.255",
      endNo: 103041003255
    },
    {
      begin: "103.41.148.0",
      beginNo: 103041148000,
      end: "103.41.155.255",
      endNo: 103041155255
    },
    {
      begin: "103.41.160.0",
      beginNo: 103041160000,
      end: "103.41.167.255",
      endNo: 103041167255
    },
    {
      begin: "103.41.220.0",
      beginNo: 103041220000,
      end: "103.41.235.255",
      endNo: 103041235255
    },
    {
      begin: "103.42.64.0",
      beginNo: 103042064000,
      end: "103.42.71.255",
      endNo: 103042071255
    },
    {
      begin: "103.43.96.0",
      beginNo: 103043096000,
      end: "103.43.107.255",
      endNo: 103043107255
    },
    {
      begin: "103.43.192.0",
      beginNo: 103043192000,
      end: "103.43.199.255",
      endNo: 103043199255
    },
    {
      begin: "103.43.220.0",
      beginNo: 103043220000,
      end: "103.43.227.255",
      endNo: 103043227255
    },
    {
      begin: "103.44.120.0",
      beginNo: 103044120000,
      end: "103.44.127.255",
      endNo: 103044127255
    },
    {
      begin: "103.44.176.0",
      beginNo: 103044176000,
      end: "103.44.207.255",
      endNo: 103044207255
    },
    {
      begin: "103.44.236.0",
      beginNo: 103044236000,
      end: "103.45.63.255",
      endNo: 103045063255
    },
    {
      begin: "103.45.72.0",
      beginNo: 103045072000,
      end: "103.45.227.255",
      endNo: 103045227255
    },
    {
      begin: "103.46.12.0",
      beginNo: 103046012000,
      end: "103.46.139.255",
      endNo: 103046139255
    },
    {
      begin: "103.46.152.0",
      beginNo: 103046152000,
      end: "103.46.183.255",
      endNo: 103046183255
    },
    {
      begin: "103.46.244.0",
      beginNo: 103046244000,
      end: "103.46.251.255",
      endNo: 103046251255
    },
    {
      begin: "103.47.20.0",
      beginNo: 103047020000,
      end: "103.47.24.255",
      endNo: 103047024255
    },
    {
      begin: "103.47.36.0",
      beginNo: 103047036000,
      end: "103.47.43.255",
      endNo: 103047043255
    },
    {
      begin: "103.47.116.0",
      beginNo: 103047116000,
      end: "103.47.123.255",
      endNo: 103047123255
    },
    {
      begin: "103.47.136.0",
      beginNo: 103047136000,
      end: "103.47.143.255",
      endNo: 103047143255
    },
    {
      begin: "103.48.144.0",
      beginNo: 103048144000,
      end: "103.48.159.255",
      endNo: 103048159255
    },
    {
      begin: "103.48.216.0",
      beginNo: 103048216000,
      end: "103.48.247.255",
      endNo: 103048247255
    },
    {
      begin: "103.49.72.0",
      beginNo: 103049072000,
      end: "103.49.79.255",
      endNo: 103049079255
    },
    {
      begin: "103.49.92.0",
      beginNo: 103049092000,
      end: "103.49.99.255",
      endNo: 103049099255
    },
    {
      begin: "103.49.176.0",
      beginNo: 103049176000,
      end: "103.49.183.255",
      endNo: 103049183255
    },
    {
      begin: "103.50.44.0",
      beginNo: 103050044000,
      end: "103.50.75.255",
      endNo: 103050075255
    },
    {
      begin: "103.50.108.0",
      beginNo: 103050108000,
      end: "103.50.127.255",
      endNo: 103050127255
    },
    {
      begin: "103.50.132.0",
      beginNo: 103050132000,
      end: "103.50.143.255",
      endNo: 103050143255
    },
    {
      begin: "103.50.172.0",
      beginNo: 103050172000,
      end: "103.50.203.255",
      endNo: 103050203255
    },
    {
      begin: "103.50.220.0",
      beginNo: 103050220000,
      end: "103.50.251.255",
      endNo: 103050251255
    },
    {
      begin: "103.52.72.0",
      beginNo: 103052072000,
      end: "103.52.87.255",
      endNo: 103052087255
    },
    {
      begin: "103.52.96.0",
      beginNo: 103052096000,
      end: "103.52.107.255",
      endNo: 103052107255
    },
    {
      begin: "103.52.160.0",
      beginNo: 103052160000,
      end: "103.52.167.255",
      endNo: 103052167255
    },
    {
      begin: "103.52.172.0",
      beginNo: 103052172000,
      end: "103.52.179.255",
      endNo: 103052179255
    },
    {
      begin: "103.53.64.0",
      beginNo: 103053064000,
      end: "103.53.71.255",
      endNo: 103053071255
    },
    {
      begin: "103.53.124.0",
      beginNo: 103053124000,
      end: "103.53.147.255",
      endNo: 103053147255
    },
    {
      begin: "103.53.204.0",
      beginNo: 103053204000,
      end: "103.53.215.255",
      endNo: 103053215255
    },
    {
      begin: "103.54.160.0",
      beginNo: 103054160000,
      end: "103.54.167.255",
      endNo: 103054167255
    },
    {
      begin: "103.55.204.0",
      beginNo: 103055204000,
      end: "103.55.211.255",
      endNo: 103055211255
    },
    {
      begin: "103.56.16.0",
      beginNo: 103056016000,
      end: "103.56.23.255",
      endNo: 103056023255
    },
    {
      begin: "103.56.56.0",
      beginNo: 103056056000,
      end: "103.56.63.255",
      endNo: 103056063255
    },
    {
      begin: "103.56.72.0",
      beginNo: 103056072000,
      end: "103.56.79.255",
      endNo: 103056079255
    },
    {
      begin: "103.57.52.0",
      beginNo: 103057052000,
      end: "103.57.59.255",
      endNo: 103057059255
    },
    {
      begin: "103.59.112.0",
      beginNo: 103059112000,
      end: "103.59.120.255",
      endNo: 103059120255
    },
    {
      begin: "103.59.123.0",
      beginNo: 103059123000,
      end: "103.59.131.255",
      endNo: 103059131255
    },
    {
      begin: "103.61.152.0",
      beginNo: 103061152000,
      end: "103.61.163.255",
      endNo: 103061163255
    },
    {
      begin: "103.61.172.0",
      beginNo: 103061172000,
      end: "103.61.179.255",
      endNo: 103061179255
    },
    {
      begin: "103.62.72.0",
      beginNo: 103062072000,
      end: "103.62.91.255",
      endNo: 103062091255
    },
    {
      begin: "103.62.96.0",
      beginNo: 103062096000,
      end: "103.62.135.255",
      endNo: 103062135255
    },
    {
      begin: "103.62.156.0",
      beginNo: 103062156000,
      end: "103.62.195.255",
      endNo: 103062195255
    },
    {
      begin: "103.62.204.0",
      beginNo: 103062204000,
      end: "103.62.227.255",
      endNo: 103062227255
    },
    {
      begin: "103.63.32.0",
      beginNo: 103063032000,
      end: "103.63.91.255",
      endNo: 103063091255
    },
    {
      begin: "103.63.140.0",
      beginNo: 103063140000,
      end: "103.63.147.255",
      endNo: 103063147255
    },
    {
      begin: "103.63.160.0",
      beginNo: 103063160000,
      end: "103.63.187.255",
      endNo: 103063187255
    },
    {
      begin: "103.63.192.0",
      beginNo: 103063192000,
      end: "103.63.211.255",
      endNo: 103063211255
    },
    {
      begin: "103.63.240.0",
      beginNo: 103063240000,
      end: "103.64.7.255",
      endNo: 103064007255
    },
    {
      begin: "103.64.24.0",
      beginNo: 103064024000,
      end: "103.64.127.255",
      endNo: 103064127255
    },
    {
      begin: "103.64.140.0",
      beginNo: 103064140000,
      end: "103.64.147.255",
      endNo: 103064147255
    },
    {
      begin: "103.64.152.0",
      beginNo: 103064152000,
      end: "103.65.19.255",
      endNo: 103065019255
    },
    {
      begin: "103.65.48.0",
      beginNo: 103065048000,
      end: "103.65.95.255",
      endNo: 103065095255
    },
    {
      begin: "103.65.100.0",
      beginNo: 103065100000,
      end: "103.65.115.255",
      endNo: 103065115255
    },
    {
      begin: "103.65.144.0",
      beginNo: 103065144000,
      end: "103.65.175.255",
      endNo: 103065175255
    },
    {
      begin: "103.66.240.0",
      beginNo: 103066240000,
      end: "103.67.11.255",
      endNo: 103067011255
    },
    {
      begin: "103.67.100.0",
      beginNo: 103067100000,
      end: "103.67.151.255",
      endNo: 103067151255
    },
    {
      begin: "103.70.220.0",
      beginNo: 103070220000,
      end: "103.70.227.255",
      endNo: 103070227255
    },
    {
      begin: "103.70.252.0",
      beginNo: 103070252000,
      end: "103.71.3.255",
      endNo: 103071003255
    },
    {
      begin: "103.71.68.0",
      beginNo: 103071068000,
      end: "103.71.75.255",
      endNo: 103071075255
    },
    {
      begin: "103.71.80.0",
      beginNo: 103071080000,
      end: "103.71.91.255",
      endNo: 103071091255
    },
    {
      begin: "103.71.120.0",
      beginNo: 103071120000,
      end: "103.71.131.255",
      endNo: 103071131255
    },
    {
      begin: "103.71.196.0",
      beginNo: 103071196000,
      end: "103.71.203.255",
      endNo: 103071203255
    },
    {
      begin: "103.72.12.0",
      beginNo: 103072012000,
      end: "103.72.55.255",
      endNo: 103072055255
    },
    {
      begin: "103.72.112.0",
      beginNo: 103072112000,
      end: "103.72.135.255",
      endNo: 103072135255
    },
    {
      begin: "103.72.224.0",
      beginNo: 103072224000,
      end: "103.73.31.255",
      endNo: 103073031255
    },
    {
      begin: "103.73.116.0",
      beginNo: 103073116000,
      end: "103.73.123.255",
      endNo: 103073123255
    },
    {
      begin: "103.73.128.0",
      beginNo: 103073128000,
      end: "103.73.147.255",
      endNo: 103073147255
    },
    {
      begin: "103.73.204.0",
      beginNo: 103073204000,
      end: "103.73.211.255",
      endNo: 103073211255
    },
    {
      begin: "103.73.240.0",
      beginNo: 103073240000,
      end: "103.73.251.255",
      endNo: 103073251255
    },
    {
      begin: "103.74.24.0",
      beginNo: 103074024000,
      end: "103.74.51.255",
      endNo: 103074051255
    },
    {
      begin: "103.74.56.0",
      beginNo: 103074056000,
      end: "103.74.63.255",
      endNo: 103074063255
    },
    {
      begin: "103.74.148.0",
      beginNo: 103074148000,
      end: "103.74.159.255",
      endNo: 103074159255
    },
    {
      begin: "103.75.88.0",
      beginNo: 103075088000,
      end: "103.75.95.255",
      endNo: 103075095255
    },
    {
      begin: "103.75.104.0",
      beginNo: 103075104000,
      end: "103.75.115.255",
      endNo: 103075115255
    },
    {
      begin: "103.76.60.0",
      beginNo: 103076060000,
      end: "103.76.75.255",
      endNo: 103076075255
    },
    {
      begin: "103.76.216.0",
      beginNo: 103076216000,
      end: "103.76.227.255",
      endNo: 103076227255
    },
    {
      begin: "103.77.52.0",
      beginNo: 103077052000,
      end: "103.77.59.255",
      endNo: 103077059255
    },
    {
      begin: "103.77.88.0",
      beginNo: 103077088000,
      end: "103.77.95.255",
      endNo: 103077095255
    },
    {
      begin: "103.78.56.0",
      beginNo: 103078056000,
      end: "103.78.71.255",
      endNo: 103078071255
    },
    {
      begin: "103.78.172.0",
      beginNo: 103078172000,
      end: "103.78.179.255",
      endNo: 103078179255
    },
    {
      begin: "103.79.24.0",
      beginNo: 103079024000,
      end: "103.79.31.255",
      endNo: 103079031255
    },
    {
      begin: "103.79.36.0",
      beginNo: 103079036000,
      end: "103.79.47.255",
      endNo: 103079047255
    },
    {
      begin: "103.79.52.0",
      beginNo: 103079052000,
      end: "103.79.71.255",
      endNo: 103079071255
    },
    {
      begin: "103.79.80.0",
      beginNo: 103079080000,
      end: "103.79.87.255",
      endNo: 103079087255
    },
    {
      begin: "103.79.188.0",
      beginNo: 103079188000,
      end: "103.79.215.255",
      endNo: 103079215255
    },
    {
      begin: "103.80.24.0",
      beginNo: 103080024000,
      end: "103.80.31.255",
      endNo: 103080031255
    },
    {
      begin: "103.80.176.0",
      beginNo: 103080176000,
      end: "103.80.187.255",
      endNo: 103080187255
    },
    {
      begin: "103.81.4.0",
      beginNo: 103081004000,
      end: "103.81.11.255",
      endNo: 103081011255
    },
    {
      begin: "103.81.16.0",
      beginNo: 103081016000,
      end: "103.81.23.255",
      endNo: 103081023255
    },
    {
      begin: "103.81.44.0",
      beginNo: 103081044000,
      end: "103.81.51.255",
      endNo: 103081051255
    },
    {
      begin: "103.83.60.0",
      beginNo: 103083060000,
      end: "103.83.67.255",
      endNo: 103083067255
    },
    {
      begin: "103.84.12.0",
      beginNo: 103084012000,
      end: "103.84.31.255",
      endNo: 103084031255
    },
    {
      begin: "103.85.44.0",
      beginNo: 103085044000,
      end: "103.85.51.255",
      endNo: 103085051255
    },
    {
      begin: "103.85.164.0",
      beginNo: 103085164000,
      end: "103.85.179.255",
      endNo: 103085179255
    },
    {
      begin: "103.86.28.0",
      beginNo: 103086028000,
      end: "103.86.35.255",
      endNo: 103086035255
    },
    {
      begin: "103.86.80.0",
      beginNo: 103086080000,
      end: "103.86.84.255",
      endNo: 103086084255
    },
    {
      begin: "103.86.86.0",
      beginNo: 103086086000,
      end: "103.86.91.255",
      endNo: 103086091255
    },
    {
      begin: "103.86.204.0",
      beginNo: 103086204000,
      end: "103.87.7.255",
      endNo: 103087007255
    },
    {
      begin: "103.88.4.0",
      beginNo: 103088004000,
      end: "103.88.23.255",
      endNo: 103088023255
    },
    {
      begin: "103.88.32.0",
      beginNo: 103088032000,
      end: "103.88.39.255",
      endNo: 103088039255
    },
    {
      begin: "103.88.60.0",
      beginNo: 103088060000,
      end: "103.88.67.255",
      endNo: 103088067255
    },
    {
      begin: "103.88.96.0",
      beginNo: 103088096000,
      end: "103.88.103.255",
      endNo: 103088103255
    },
    {
      begin: "103.89.96.0",
      beginNo: 103089096000,
      end: "103.89.119.255",
      endNo: 103089119255
    },
    {
      begin: "103.89.184.0",
      beginNo: 103089184000,
      end: "103.89.231.255",
      endNo: 103089231255
    },
    {
      begin: "103.90.100.0",
      beginNo: 103090100000,
      end: "103.90.135.255",
      endNo: 103090135255
    },
    {
      begin: "103.90.188.0",
      beginNo: 103090188000,
      end: "103.90.195.255",
      endNo: 103090195255
    },
    {
      begin: "103.91.36.0",
      beginNo: 103091036000,
      end: "103.91.43.255",
      endNo: 103091043255
    },
    {
      begin: "103.91.208.0",
      beginNo: 103091208000,
      end: "103.91.215.255",
      endNo: 103091215255
    },
    {
      begin: "103.91.252.0",
      beginNo: 103091252000,
      end: "103.92.15.255",
      endNo: 103092015255
    },
    {
      begin: "103.92.48.0",
      beginNo: 103092048000,
      end: "103.92.83.255",
      endNo: 103092083255
    },
    {
      begin: "103.92.124.0",
      beginNo: 103092124000,
      end: "103.92.128.255",
      endNo: 103092128255
    },
    {
      begin: "103.92.164.0",
      beginNo: 103092164000,
      end: "103.92.195.255",
      endNo: 103092195255
    },
    {
      begin: "103.92.236.0",
      beginNo: 103092236000,
      end: "103.93.7.255",
      endNo: 103093007255
    },
    {
      begin: "103.94.28.0",
      beginNo: 103094028000,
      end: "103.94.47.255",
      endNo: 103094047255
    },
    {
      begin: "103.95.64.0",
      beginNo: 103095064000,
      end: "103.95.71.255",
      endNo: 103095071255
    },
    {
      begin: "103.95.88.0",
      beginNo: 103095088000,
      end: "103.95.95.255",
      endNo: 103095095255
    },
    {
      begin: "103.95.136.0",
      beginNo: 103095136000,
      end: "103.95.147.255",
      endNo: 103095147255
    },
    {
      begin: "103.95.216.0",
      beginNo: 103095216000,
      end: "103.95.227.255",
      endNo: 103095227255
    },
    {
      begin: "103.95.236.0",
      beginNo: 103095236000,
      end: "103.95.255.255",
      endNo: 103095255255
    },
    {
      begin: "103.96.136.0",
      beginNo: 103096136000,
      end: "103.96.140.255",
      endNo: 103096140255
    },
    {
      begin: "103.96.152.0",
      beginNo: 103096152000,
      end: "103.96.219.255",
      endNo: 103096219255
    },
    {
      begin: "103.97.8.0",
      beginNo: 103097008000,
      end: "103.97.43.255",
      endNo: 103097043255
    },
    {
      begin: "103.97.56.0",
      beginNo: 103097056000,
      end: "103.97.75.255",
      endNo: 103097075255
    },
    {
      begin: "103.97.112.0",
      beginNo: 103097112000,
      end: "103.97.119.255",
      endNo: 103097119255
    },
    {
      begin: "103.97.144.0",
      beginNo: 103097144000,
      end: "103.97.151.255",
      endNo: 103097151255
    },
    {
      begin: "103.97.188.0",
      beginNo: 103097188000,
      end: "103.97.195.255",
      endNo: 103097195255
    },
    {
      begin: "103.97.224.0",
      beginNo: 103097224000,
      end: "103.97.229.255",
      endNo: 103097229255
    },
    {
      begin: "103.98.40.0",
      beginNo: 103098040000,
      end: "103.98.51.255",
      endNo: 103098051255
    },
    {
      begin: "103.98.88.0",
      beginNo: 103098088000,
      end: "103.98.103.255",
      endNo: 103098103255
    },
    {
      begin: "103.98.136.0",
      beginNo: 103098136000,
      end: "103.98.147.255",
      endNo: 103098147255
    },
    {
      begin: "103.98.164.0",
      beginNo: 103098164000,
      end: "103.98.171.255",
      endNo: 103098171255
    },
    {
      begin: "103.98.216.0",
      beginNo: 103098216000,
      end: "103.98.235.255",
      endNo: 103098235255
    },
    {
      begin: "103.98.240.0",
      beginNo: 103098240000,
      end: "103.98.255.255",
      endNo: 103098255255
    },
    {
      begin: "103.99.53.0",
      beginNo: 103099053000,
      end: "103.99.63.255",
      endNo: 103099063255
    },
    {
      begin: "103.99.116.0",
      beginNo: 103099116000,
      end: "103.99.123.255",
      endNo: 103099123255
    },
    {
      begin: "103.99.232.0",
      beginNo: 103099232000,
      end: "103.99.239.255",
      endNo: 103099239255
    },
    {
      begin: "103.100.48.0",
      beginNo: 103100048000,
      end: "103.100.59.255",
      endNo: 103100059255
    },
    {
      begin: "103.100.64.0",
      beginNo: 103100064000,
      end: "103.100.71.255",
      endNo: 103100071255
    },
    {
      begin: "103.100.236.0",
      beginNo: 103100236000,
      end: "103.100.243.255",
      endNo: 103100243255
    },
    {
      begin: "103.100.248.0",
      beginNo: 103100248000,
      end: "103.100.255.255",
      endNo: 103100255255
    },
    {
      begin: "103.101.6.0",
      beginNo: 103101006000,
      end: "103.101.15.255",
      endNo: 103101015255
    },
    {
      begin: "103.101.120.0",
      beginNo: 103101120000,
      end: "103.101.127.255",
      endNo: 103101127255
    },
    {
      begin: "103.101.144.0",
      beginNo: 103101144000,
      end: "103.101.151.255",
      endNo: 103101151255
    },
    {
      begin: "103.101.180.0",
      beginNo: 103101180000,
      end: "103.101.187.255",
      endNo: 103101187255
    },
    {
      begin: "103.102.76.0",
      beginNo: 103102076000,
      end: "103.102.83.255",
      endNo: 103102083255
    },
    {
      begin: "103.102.168.0",
      beginNo: 103102168000,
      end: "103.102.175.255",
      endNo: 103102175255
    },
    {
      begin: "103.102.180.0",
      beginNo: 103102180000,
      end: "103.102.203.255",
      endNo: 103102203255
    },
    {
      begin: "103.102.208.0",
      beginNo: 103102208000,
      end: "103.102.215.255",
      endNo: 103102215255
    },
    {
      begin: "103.103.12.0",
      beginNo: 103103012000,
      end: "103.103.19.255",
      endNo: 103103019255
    },
    {
      begin: "103.103.68.0",
      beginNo: 103103068000,
      end: "103.103.75.255",
      endNo: 103103075255
    },
    {
      begin: "103.103.200.0",
      beginNo: 103103200000,
      end: "103.103.207.255",
      endNo: 103103207255
    },
    {
      begin: "103.103.220.0",
      beginNo: 103103220000,
      end: "103.103.235.255",
      endNo: 103103235255
    },
    {
      begin: "103.103.248.0",
      beginNo: 103103248000,
      end: "103.104.7.255",
      endNo: 103104007255
    },
    {
      begin: "103.104.36.0",
      beginNo: 103104036000,
      end: "103.104.43.255",
      endNo: 103104043255
    },
    {
      begin: "103.104.252.0",
      beginNo: 103104252000,
      end: "103.105.7.255",
      endNo: 103105007255
    },
    {
      begin: "103.105.12.0",
      beginNo: 103105012000,
      end: "103.105.19.255",
      endNo: 103105019255
    },
    {
      begin: "103.105.180.0",
      beginNo: 103105180000,
      end: "103.105.187.255",
      endNo: 103105187255
    },
    {
      begin: "103.105.200.0",
      beginNo: 103105200000,
      end: "103.105.207.255",
      endNo: 103105207255
    },
    {
      begin: "103.106.36.0",
      beginNo: 103106036000,
      end: "103.106.47.255",
      endNo: 103106047255
    },
    {
      begin: "103.106.128.0",
      beginNo: 103106128000,
      end: "103.106.135.255",
      endNo: 103106135255
    },
    {
      begin: "103.106.252.0",
      beginNo: 103106252000,
      end: "103.107.3.255",
      endNo: 103107003255
    },
    {
      begin: "103.107.28.0",
      beginNo: 103107028000,
      end: "103.107.35.255",
      endNo: 103107035255
    },
    {
      begin: "103.107.164.0",
      beginNo: 103107164000,
      end: "103.107.171.255",
      endNo: 103107171255
    },
    {
      begin: "103.107.188.0",
      beginNo: 103107188000,
      end: "103.107.195.255",
      endNo: 103107195255
    },
    {
      begin: "103.107.208.0",
      beginNo: 103107208000,
      end: "103.107.223.255",
      endNo: 103107223255
    },
    {
      begin: "103.108.160.0",
      beginNo: 103108160000,
      end: "103.108.167.255",
      endNo: 103108167255
    },
    {
      begin: "103.108.192.0",
      beginNo: 103108192000,
      end: "103.108.199.255",
      endNo: 103108199255
    },
    {
      begin: "103.108.208.0",
      beginNo: 103108208000,
      end: "103.108.216.254",
      endNo: 103108216254
    },
    {
      begin: "103.110.131.0",
      beginNo: 103110131000,
      end: "103.110.139.255",
      endNo: 103110139255
    },
    {
      begin: "103.110.152.0",
      beginNo: 103110152000,
      end: "103.110.159.255",
      endNo: 103110159255
    },
    {
      begin: "103.112.68.0",
      beginNo: 103112068000,
      end: "103.112.75.255",
      endNo: 103112075255
    },
    {
      begin: "103.112.88.0",
      beginNo: 103112088000,
      end: "103.112.95.255",
      endNo: 103112095255
    },
    {
      begin: "103.112.108.0",
      beginNo: 103112108000,
      end: "103.112.115.255",
      endNo: 103112115255
    },
    {
      begin: "103.113.232.0",
      beginNo: 103113232000,
      end: "103.113.239.255",
      endNo: 103113239255
    },
    {
      begin: "103.114.68.0",
      beginNo: 103114068000,
      end: "103.114.75.255",
      endNo: 103114075255
    },
    {
      begin: "103.114.236.0",
      beginNo: 103114236000,
      end: "103.114.243.255",
      endNo: 103114243255
    },
    {
      begin: "103.115.40.0",
      beginNo: 103115040000,
      end: "103.115.71.255",
      endNo: 103115071255
    },
    {
      begin: "103.116.220.0",
      beginNo: 103116220000,
      end: "103.116.231.255",
      endNo: 103116231255
    },
    {
      begin: "103.118.52.0",
      beginNo: 103118052000,
      end: "103.118.75.255",
      endNo: 103118075255
    },
    {
      begin: "103.118.192.0",
      beginNo: 103118192000,
      end: "103.118.223.255",
      endNo: 103118223255
    },
    {
      begin: "103.118.240.0",
      beginNo: 103118240000,
      end: "103.119.3.255",
      endNo: 103119003255
    },
    {
      begin: "103.119.12.0",
      beginNo: 103119012000,
      end: "103.119.19.255",
      endNo: 103119019255
    },
    {
      begin: "103.120.96.0",
      beginNo: 103120096000,
      end: "103.120.103.255",
      endNo: 103120103255
    },
    {
      begin: "103.121.160.0",
      beginNo: 103121160000,
      end: "103.121.167.255",
      endNo: 103121167255
    },
    {
      begin: "103.123.88.0",
      beginNo: 103123088000,
      end: "103.123.95.255",
      endNo: 103123095255
    },
    {
      begin: "103.123.200.0",
      beginNo: 103123200000,
      end: "103.123.215.255",
      endNo: 103123215255
    },
    {
      begin: "103.124.212.0",
      beginNo: 103124212000,
      end: "103.124.219.255",
      endNo: 103124219255
    },
    {
      begin: "103.126.124.0",
      beginNo: 103126124000,
      end: "103.126.135.255",
      endNo: 103126135255
    },
    {
      begin: "103.131.224.0",
      beginNo: 103131224000,
      end: "103.131.231.255",
      endNo: 103131231255
    },
    {
      begin: "103.132.60.0",
      beginNo: 103132060000,
      end: "103.132.83.255",
      endNo: 103132083255
    },
    {
      begin: "103.132.104.0",
      beginNo: 103132104000,
      end: "103.132.123.255",
      endNo: 103132123255
    },
    {
      begin: "103.132.160.0",
      beginNo: 103132160000,
      end: "103.132.167.255",
      endNo: 103132167255
    },
    {
      begin: "103.132.208.0",
      beginNo: 103132208000,
      end: "103.132.215.255",
      endNo: 103132215255
    },
    {
      begin: "103.135.156.0",
      beginNo: 103135156000,
      end: "103.135.167.255",
      endNo: 103135167255
    },
    {
      begin: "103.135.192.0",
      beginNo: 103135192000,
      end: "103.135.199.255",
      endNo: 103135199255
    },
    {
      begin: "103.145.38.0",
      beginNo: 103145038000,
      end: "103.145.43.255",
      endNo: 103145043255
    },
    {
      begin: "103.149.242.0",
      beginNo: 103149242000,
      end: "103.149.247.255",
      endNo: 103149247255
    },
    {
      begin: "103.150.126.0",
      beginNo: 103150126000,
      end: "103.150.131.255",
      endNo: 103150131255
    },
    {
      begin: "103.192.0.0",
      beginNo: 103192000000,
      end: "103.192.31.255",
      endNo: 103192031255
    },
    {
      begin: "103.192.48.0",
      beginNo: 103192048000,
      end: "103.192.59.255",
      endNo: 103192059255
    },
    {
      begin: "103.192.84.0",
      beginNo: 103192084000,
      end: "103.192.115.255",
      endNo: 103192115255
    },
    {
      begin: "103.192.128.0",
      beginNo: 103192128000,
      end: "103.192.147.255",
      endNo: 103192147255
    },
    {
      begin: "103.192.208.0",
      beginNo: 103192208000,
      end: "103.192.219.255",
      endNo: 103192219255
    },
    {
      begin: "103.193.40.0",
      beginNo: 103193040000,
      end: "103.193.47.255",
      endNo: 103193047255
    },
    {
      begin: "103.193.140.0",
      beginNo: 103193140000,
      end: "103.193.147.255",
      endNo: 103193147255
    },
    {
      begin: "103.193.188.0",
      beginNo: 103193188000,
      end: "103.193.195.255",
      endNo: 103193195255
    },
    {
      begin: "103.193.212.0",
      beginNo: 103193212000,
      end: "103.193.243.255",
      endNo: 103193243255
    },
    {
      begin: "103.195.148.0",
      beginNo: 103195148000,
      end: "103.195.155.255",
      endNo: 103195155255
    },
    {
      begin: "103.196.88.0",
      beginNo: 103196088000,
      end: "103.196.99.255",
      endNo: 103196099255
    },
    {
      begin: "103.198.60.0",
      beginNo: 103198060000,
      end: "103.198.67.255",
      endNo: 103198067255
    },
    {
      begin: "103.198.196.0",
      beginNo: 103198196000,
      end: "103.198.203.255",
      endNo: 103198203255
    },
    {
      begin: "103.198.216.0",
      beginNo: 103198216000,
      end: "103.198.245.255",
      endNo: 103198245255
    },
    {
      begin: "103.199.248.0",
      beginNo: 103199248000,
      end: "103.199.255.255",
      endNo: 103199255255
    },
    {
      begin: "103.200.64.0",
      beginNo: 103200064000,
      end: "103.200.71.255",
      endNo: 103200071255
    },
    {
      begin: "103.200.136.0",
      beginNo: 103200136000,
      end: "103.200.195.255",
      endNo: 103200195255
    },
    {
      begin: "103.200.220.0",
      beginNo: 103200220000,
      end: "103.201.23.255",
      endNo: 103201023255
    },
    {
      begin: "103.201.28.0",
      beginNo: 103201028000,
      end: "103.201.67.255",
      endNo: 103201067255
    },
    {
      begin: "103.201.76.0",
      beginNo: 103201076000,
      end: "103.201.123.255",
      endNo: 103201123255
    },
    {
      begin: "103.201.152.0",
      beginNo: 103201152000,
      end: "103.202.47.255",
      endNo: 103202047255
    },
    {
      begin: "103.202.56.0",
      beginNo: 103202056000,
      end: "103.202.147.255",
      endNo: 103202147255
    },
    {
      begin: "103.202.152.0",
      beginNo: 103202152000,
      end: "103.202.207.255",
      endNo: 103202207255
    },
    {
      begin: "103.202.236.0",
      beginNo: 103202236000,
      end: "103.203.35.255",
      endNo: 103203035255
    },
    {
      begin: "103.203.52.0",
      beginNo: 103203052000,
      end: "103.203.59.255",
      endNo: 103203059255
    },
    {
      begin: "103.203.96.0",
      beginNo: 103203096000,
      end: "103.203.131.255",
      endNo: 103203131255
    },
    {
      begin: "103.203.164.0",
      beginNo: 103203164000,
      end: "103.203.171.255",
      endNo: 103203171255
    },
    {
      begin: "103.203.212.0",
      beginNo: 103203212000,
      end: "103.203.219.255",
      endNo: 103203219255
    },
    {
      begin: "103.204.136.0",
      beginNo: 103204136000,
      end: "103.204.155.255",
      endNo: 103204155255
    },
    {
      begin: "103.204.232.0",
      beginNo: 103204232000,
      end: "103.204.239.255",
      endNo: 103204239255
    },
    {
      begin: "103.205.4.0",
      beginNo: 103205004000,
      end: "103.205.9.255",
      endNo: 103205009255
    },
    {
      begin: "103.205.40.0",
      beginNo: 103205040000,
      end: "103.205.47.255",
      endNo: 103205047255
    },
    {
      begin: "103.205.188.0",
      beginNo: 103205188000,
      end: "103.205.203.255",
      endNo: 103205203255
    },
    {
      begin: "103.205.248.0",
      beginNo: 103205248000,
      end: "103.206.3.255",
      endNo: 103206003255
    },
    {
      begin: "103.207.184.0",
      beginNo: 103207184000,
      end: "103.207.215.255",
      endNo: 103207215255
    },
    {
      begin: "103.207.228.0",
      beginNo: 103207228000,
      end: "103.207.235.255",
      endNo: 103207235255
    },
    {
      begin: "103.208.12.0",
      beginNo: 103208012000,
      end: "103.208.19.255",
      endNo: 103208019255
    },
    {
      begin: "103.208.40.0",
      beginNo: 103208040000,
      end: "103.208.51.255",
      endNo: 103208051255
    },
    {
      begin: "103.210.156.0",
      beginNo: 103210156000,
      end: "103.210.191.255",
      endNo: 103210191255
    },
    {
      begin: "103.211.220.0",
      beginNo: 103211220000,
      end: "103.211.227.255",
      endNo: 103211227255
    },
    {
      begin: "103.212.0.0",
      beginNo: 103212000000,
      end: "103.212.15.255",
      endNo: 103212015255
    },
    {
      begin: "103.212.44.0",
      beginNo: 103212044000,
      end: "103.212.51.255",
      endNo: 103212051255
    },
    {
      begin: "103.212.100.0",
      beginNo: 103212100000,
      end: "103.212.111.255",
      endNo: 103212111255
    },
    {
      begin: "103.212.196.0",
      beginNo: 103212196000,
      end: "103.212.203.255",
      endNo: 103212203255
    },
    {
      begin: "103.213.40.0",
      beginNo: 103213040000,
      end: "103.213.99.255",
      endNo: 103213099255
    },
    {
      begin: "103.213.132.0",
      beginNo: 103213132000,
      end: "103.213.191.255",
      endNo: 103213191255
    },
    {
      begin: "103.214.240.0",
      beginNo: 103214240000,
      end: "103.214.247.255",
      endNo: 103214247255
    },
    {
      begin: "103.215.28.0",
      beginNo: 103215028000,
      end: "103.215.39.255",
      endNo: 103215039255
    },
    {
      begin: "103.215.44.0",
      beginNo: 103215044000,
      end: "103.215.51.255",
      endNo: 103215051255
    },
    {
      begin: "103.215.100.0",
      beginNo: 103215100000,
      end: "103.215.111.255",
      endNo: 103215111255
    },
    {
      begin: "103.215.116.0",
      beginNo: 103215116000,
      end: "103.215.123.255",
      endNo: 103215123255
    },
    {
      begin: "103.216.4.0",
      beginNo: 103216004000,
      end: "103.216.47.255",
      endNo: 103216047255
    },
    {
      begin: "103.216.224.0",
      beginNo: 103216224000,
      end: "103.216.231.255",
      endNo: 103216231255
    },
    {
      begin: "103.216.240.0",
      beginNo: 103216240000,
      end: "103.217.63.255",
      endNo: 103217063255
    },
    {
      begin: "103.217.180.0",
      beginNo: 103217180000,
      end: "103.217.207.255",
      endNo: 103217207255
    },
    {
      begin: "103.217.255.0",
      beginNo: 103217255000,
      end: "103.218.3.255",
      endNo: 103218003255
    },
    {
      begin: "103.218.8.0",
      beginNo: 103218008000,
      end: "103.218.23.255",
      endNo: 103218023255
    },
    {
      begin: "103.218.28.0",
      beginNo: 103218028000,
      end: "103.218.95.255",
      endNo: 103218095255
    },
    {
      begin: "103.218.192.0",
      beginNo: 103218192000,
      end: "103.218.219.255",
      endNo: 103218219255
    },
    {
      begin: "103.219.24.0",
      beginNo: 103219024000,
      end: "103.219.39.255",
      endNo: 103219039255
    },
    {
      begin: "103.219.84.0",
      beginNo: 103219084000,
      end: "103.219.103.255",
      endNo: 103219103255
    },
    {
      begin: "103.220.48.0",
      beginNo: 103220048000,
      end: "103.220.67.255",
      endNo: 103220067255
    },
    {
      begin: "103.220.92.0",
      beginNo: 103220092000,
      end: "103.220.111.255",
      endNo: 103220111255
    },
    {
      begin: "103.220.116.0",
      beginNo: 103220116000,
      end: "103.220.155.255",
      endNo: 103220155255
    },
    {
      begin: "103.220.160.0",
      beginNo: 103220160000,
      end: "103.220.203.255",
      endNo: 103220203255
    },
    {
      begin: "103.220.240.0",
      beginNo: 103220240000,
      end: "103.221.51.255",
      endNo: 103221051255
    },
    {
      begin: "103.221.88.0",
      beginNo: 103221088000,
      end: "103.221.207.255",
      endNo: 103221207255
    },
    {
      begin: "103.222.0.0",
      beginNo: 103222000000,
      end: "103.222.19.255",
      endNo: 103222019255
    },
    {
      begin: "103.222.24.0",
      beginNo: 103222024000,
      end: "103.222.235.255",
      endNo: 103222235255
    },
    {
      begin: "103.222.240.0",
      beginNo: 103222240000,
      end: "103.222.247.255",
      endNo: 103222247255
    },
    {
      begin: "103.223.16.0",
      beginNo: 103223016000,
      end: "103.223.119.255",
      endNo: 103223119255
    },
    {
      begin: "103.223.124.0",
      beginNo: 103223124000,
      end: "103.223.135.255",
      endNo: 103223135255
    },
    {
      begin: "103.223.140.0",
      beginNo: 103223140000,
      end: "103.223.183.255",
      endNo: 103223183255
    },
    {
      begin: "103.223.188.0",
      beginNo: 103223188000,
      end: "103.224.3.255",
      endNo: 103224003255
    },
    {
      begin: "103.224.40.0",
      beginNo: 103224040000,
      end: "103.224.47.255",
      endNo: 103224047255
    },
    {
      begin: "103.224.220.0",
      beginNo: 103224220000,
      end: "103.224.235.255",
      endNo: 103224235255
    },
    {
      begin: "103.226.56.0",
      beginNo: 103226056000,
      end: "103.226.63.255",
      endNo: 103226063255
    },
    {
      begin: "103.227.72.0",
      beginNo: 103227072000,
      end: "103.227.83.255",
      endNo: 103227083255
    },
    {
      begin: "103.227.132.0",
      beginNo: 103227132000,
      end: "103.227.139.255",
      endNo: 103227139255
    },
    {
      begin: "103.228.204.0",
      beginNo: 103228204000,
      end: "103.228.211.255",
      endNo: 103228211255
    },
    {
      begin: "103.228.228.0",
      beginNo: 103228228000,
      end: "103.228.235.255",
      endNo: 103228235255
    },
    {
      begin: "103.229.147.0",
      beginNo: 103229147000,
      end: "103.229.151.255",
      endNo: 103229151255
    },
    {
      begin: "103.229.212.0",
      beginNo: 103229212000,
      end: "103.229.220.255",
      endNo: 103229220255
    },
    {
      begin: "103.230.196.0",
      beginNo: 103230196000,
      end: "103.230.207.255",
      endNo: 103230207255
    },
    {
      begin: "103.231.16.0",
      beginNo: 103231016000,
      end: "103.231.23.255",
      endNo: 103231023255
    },
    {
      begin: "103.231.64.0",
      beginNo: 103231064000,
      end: "103.231.71.255",
      endNo: 103231071255
    },
    {
      begin: "103.231.180.0",
      beginNo: 103231180000,
      end: "103.231.187.255",
      endNo: 103231187255
    },
    {
      begin: "103.235.56.0",
      beginNo: 103235056000,
      end: "103.235.63.255",
      endNo: 103235063255
    },
    {
      begin: "103.235.80.0",
      beginNo: 103235080000,
      end: "103.235.87.255",
      endNo: 103235087255
    },
    {
      begin: "103.235.128.0",
      beginNo: 103235128000,
      end: "103.235.151.255",
      endNo: 103235151255
    },
    {
      begin: "103.235.220.0",
      beginNo: 103235220000,
      end: "103.236.99.255",
      endNo: 103236099255
    },
    {
      begin: "103.236.240.0",
      beginNo: 103236240000,
      end: "103.237.15.255",
      endNo: 103237015255
    },
    {
      begin: "103.237.24.0",
      beginNo: 103237024000,
      end: "103.237.31.255",
      endNo: 103237031255
    },
    {
      begin: "103.237.176.0",
      beginNo: 103237176000,
      end: "103.238.7.255",
      endNo: 103238007255
    },
    {
      begin: "103.238.16.0",
      beginNo: 103238016000,
      end: "103.238.59.255",
      endNo: 103238059255
    },
    {
      begin: "103.238.88.0",
      beginNo: 103238088000,
      end: "103.238.99.255",
      endNo: 103238099255
    },
    {
      begin: "103.238.140.0",
      beginNo: 103238140000,
      end: "103.238.147.255",
      endNo: 103238147255
    },
    {
      begin: "103.238.165.0",
      beginNo: 103238165000,
      end: "103.238.191.255",
      endNo: 103238191255
    },
    {
      begin: "103.238.252.0",
      beginNo: 103238252000,
      end: "103.239.3.255",
      endNo: 103239003255
    },
    {
      begin: "103.239.152.0",
      beginNo: 103239152000,
      end: "103.239.159.255",
      endNo: 103239159255
    },
    {
      begin: "103.239.176.0",
      beginNo: 103239176000,
      end: "103.239.187.255",
      endNo: 103239187255
    },
    {
      begin: "103.239.192.0",
      beginNo: 103239192000,
      end: "103.239.199.255",
      endNo: 103239199255
    },
    {
      begin: "103.239.204.0",
      beginNo: 103239204000,
      end: "103.239.211.255",
      endNo: 103239211255
    },
    {
      begin: "103.241.92.0",
      beginNo: 103241092000,
      end: "103.241.99.255",
      endNo: 103241099255
    },
    {
      begin: "103.241.184.0",
      beginNo: 103241184000,
      end: "103.241.191.255",
      endNo: 103241191255
    },
    {
      begin: "103.242.131.0",
      beginNo: 103242131000,
      end: "103.242.135.255",
      endNo: 103242135255
    },
    {
      begin: "103.242.168.0",
      beginNo: 103242168000,
      end: "103.242.179.255",
      endNo: 103242179255
    },
    {
      begin: "103.244.58.0",
      beginNo: 103244058000,
      end: "103.244.87.255",
      endNo: 103244087255
    },
    {
      begin: "103.245.124.0",
      beginNo: 103245124000,
      end: "103.245.131.255",
      endNo: 103245131255
    },
    {
      begin: "103.246.8.0",
      beginNo: 103246008000,
      end: "103.246.15.255",
      endNo: 103246015255
    },
    {
      begin: "103.246.120.0",
      beginNo: 103246120000,
      end: "103.246.127.255",
      endNo: 103246127255
    },
    {
      begin: "103.246.152.0",
      beginNo: 103246152000,
      end: "103.246.159.255",
      endNo: 103246159255
    },
    {
      begin: "103.247.168.0",
      beginNo: 103247168000,
      end: "103.247.179.255",
      endNo: 103247179255
    },
    {
      begin: "103.248.220.0",
      beginNo: 103248220000,
      end: "103.248.227.255",
      endNo: 103248227255
    },
    {
      begin: "103.249.8.0",
      beginNo: 103249008000,
      end: "103.249.15.255",
      endNo: 103249015255
    },
    {
      begin: "103.249.164.0",
      beginNo: 103249164000,
      end: "103.249.179.255",
      endNo: 103249179255
    },
    {
      begin: "103.249.188.0",
      beginNo: 103249188000,
      end: "103.249.195.255",
      endNo: 103249195255
    },
    {
      begin: "103.250.248.0",
      beginNo: 103250248000,
      end: "103.250.255.255",
      endNo: 103250255255
    },
    {
      begin: "103.251.124.0",
      beginNo: 103251124000,
      end: "103.251.131.255",
      endNo: 103251131255
    },
    {
      begin: "103.252.204.0",
      beginNo: 103252204000,
      end: "103.252.211.255",
      endNo: 103252211255
    },
    {
      begin: "103.253.220.0",
      beginNo: 103253220000,
      end: "103.253.227.255",
      endNo: 103253227255
    },
    {
      begin: "103.254.64.0",
      beginNo: 103254064000,
      end: "103.254.71.255",
      endNo: 103254071255
    },
    {
      begin: "103.255.88.0",
      beginNo: 103255088000,
      end: "103.255.95.255",
      endNo: 103255095255
    },
    {
      begin: "103.255.136.0",
      beginNo: 103255136000,
      end: "103.255.143.255",
      endNo: 103255143255
    },
    {
      begin: "106.0.2.0",
      beginNo: 106000002000,
      end: "106.0.31.255",
      endNo: 106000031255
    },
    {
      begin: "106.0.64.0",
      beginNo: 106000064000,
      end: "106.0.127.255",
      endNo: 106000127255
    },
    {
      begin: "106.2.0.0",
      beginNo: 106002000000,
      end: "106.9.255.255",
      endNo: 106009255255
    },
    {
      begin: "106.11.0.0",
      beginNo: 106011000000,
      end: "106.50.255.255",
      endNo: 106050255255
    },
    {
      begin: "106.52.0.0",
      beginNo: 106052000000,
      end: "106.63.255.255",
      endNo: 106063255255
    },
    {
      begin: "106.74.0.0",
      beginNo: 106074000000,
      end: "106.75.192.255",
      endNo: 106075192255
    },
    {
      begin: "106.75.194.0",
      beginNo: 106075194000,
      end: "106.75.255.255",
      endNo: 106075255255
    },
    {
      begin: "106.80.0.0",
      beginNo: 106080000000,
      end: "106.95.255.255",
      endNo: 106095255255
    },
    {
      begin: "106.108.0.0",
      beginNo: 106108000000,
      end: "106.127.255.255",
      endNo: 106127255255
    },
    {
      begin: "106.224.0.0",
      beginNo: 106224000000,
      end: "106.239.255.255",
      endNo: 106239255255
    },
    {
      begin: "109.244.0.0",
      beginNo: 109244000000,
      end: "109.244.255.255",
      endNo: 109244255255
    },
    {
      begin: "110.6.0.0",
      beginNo: 110006000000,
      end: "110.7.255.255",
      endNo: 110007255255
    },
    {
      begin: "110.16.0.0",
      beginNo: 110016000000,
      end: "110.19.255.255",
      endNo: 110019255255
    },
    {
      begin: "110.34.40.0",
      beginNo: 110034040000,
      end: "110.34.47.255",
      endNo: 110034047255
    },
    {
      begin: "110.40.0.0",
      beginNo: 110040000000,
      end: "110.43.255.255",
      endNo: 110043255255
    },
    {
      begin: "110.44.144.0",
      beginNo: 110044144000,
      end: "110.44.159.255",
      endNo: 110044159255
    },
    {
      begin: "110.48.0.0",
      beginNo: 110048000000,
      end: "110.48.255.255",
      endNo: 110048255255
    },
    {
      begin: "110.51.0.0",
      beginNo: 110051000000,
      end: "110.53.255.255",
      endNo: 110053255255
    },
    {
      begin: "110.56.0.0",
      beginNo: 110056000000,
      end: "110.65.255.255",
      endNo: 110065255255
    },
    {
      begin: "110.72.0.0",
      beginNo: 110072000000,
      end: "110.73.255.255",
      endNo: 110073255255
    },
    {
      begin: "110.75.0.0",
      beginNo: 110075000000,
      end: "110.76.63.255",
      endNo: 110076063255
    },
    {
      begin: "110.76.192.0",
      beginNo: 110076192000,
      end: "110.77.127.255",
      endNo: 110077127255
    },
    {
      begin: "110.80.0.0",
      beginNo: 110080000000,
      end: "110.91.255.255",
      endNo: 110091255255
    },
    {
      begin: "110.93.32.0",
      beginNo: 110093032000,
      end: "110.93.63.255",
      endNo: 110093063255
    },
    {
      begin: "110.94.0.0",
      beginNo: 110094000000,
      end: "110.127.255.255",
      endNo: 110127255255
    },
    {
      begin: "110.152.0.0",
      beginNo: 110152000000,
      end: "110.157.255.255",
      endNo: 110157255255
    },
    {
      begin: "110.165.36.0",
      beginNo: 110165036000,
      end: "110.165.47.255",
      endNo: 110165047255
    },
    {
      begin: "110.166.0.0",
      beginNo: 110166000000,
      end: "110.167.255.255",
      endNo: 110167255255
    },
    {
      begin: "110.172.192.0",
      beginNo: 110172192000,
      end: "110.173.47.255",
      endNo: 110173047255
    },
    {
      begin: "110.173.64.0",
      beginNo: 110173064000,
      end: "110.173.127.255",
      endNo: 110173127255
    },
    {
      begin: "110.173.192.0",
      beginNo: 110173192000,
      end: "110.173.223.255",
      endNo: 110173223255
    },
    {
      begin: "110.176.0.0",
      beginNo: 110176000000,
      end: "110.223.255.255",
      endNo: 110223255255
    },
    {
      begin: "110.228.0.0",
      beginNo: 110228000000,
      end: "110.231.255.255",
      endNo: 110231255255
    },
    {
      begin: "110.232.32.0",
      beginNo: 110232032000,
      end: "110.232.63.255",
      endNo: 110232063255
    },
    {
      begin: "110.236.0.0",
      beginNo: 110236000000,
      end: "110.237.255.255",
      endNo: 110237255255
    },
    {
      begin: "110.240.0.0",
      beginNo: 110240000000,
      end: "111.30.187.255",
      endNo: 111030187255
    },
    {
      begin: "111.30.190.0",
      beginNo: 111030190000,
      end: "111.31.185.255",
      endNo: 111031185255
    },
    {
      begin: "111.31.188.0",
      beginNo: 111031188000,
      end: "111.63.255.255",
      endNo: 111063255255
    },
    {
      begin: "111.66.0.0",
      beginNo: 111066000000,
      end: "111.66.255.255",
      endNo: 111066255255
    },
    {
      begin: "111.67.192.0",
      beginNo: 111067192000,
      end: "111.67.207.255",
      endNo: 111067207255
    },
    {
      begin: "111.68.64.0",
      beginNo: 111068064000,
      end: "111.68.95.255",
      endNo: 111068095255
    },
    {
      begin: "111.72.0.0",
      beginNo: 111072000000,
      end: "111.79.255.255",
      endNo: 111079255255
    },
    {
      begin: "111.85.0.0",
      beginNo: 111085000000,
      end: "111.85.255.255",
      endNo: 111085255255
    },
    {
      begin: "111.91.192.0",
      beginNo: 111091192000,
      end: "111.91.223.255",
      endNo: 111091223255
    },
    {
      begin: "111.92.248.0",
      beginNo: 111092248000,
      end: "111.92.255.255",
      endNo: 111092255255
    },
    {
      begin: "111.112.0.0",
      beginNo: 111112000000,
      end: "111.117.255.255",
      endNo: 111117255255
    },
    {
      begin: "111.118.200.0",
      beginNo: 111118200000,
      end: "111.118.207.255",
      endNo: 111118207255
    },
    {
      begin: "111.119.64.0",
      beginNo: 111119064000,
      end: "111.119.159.255",
      endNo: 111119159255
    },
    {
      begin: "111.120.0.0",
      beginNo: 111120000000,
      end: "111.124.255.255",
      endNo: 111124255255
    },
    {
      begin: "111.126.0.0",
      beginNo: 111126000000,
      end: "111.167.255.255",
      endNo: 111167255255
    },
    {
      begin: "111.170.0.0",
      beginNo: 111170000000,
      end: "111.170.255.255",
      endNo: 111170255255
    },
    {
      begin: "111.172.0.0",
      beginNo: 111172000000,
      end: "111.183.255.255",
      endNo: 111183255255
    },
    {
      begin: "111.186.0.0",
      beginNo: 111186000000,
      end: "111.187.255.255",
      endNo: 111187255255
    },
    {
      begin: "111.192.0.0",
      beginNo: 111192000000,
      end: "111.215.255.255",
      endNo: 111215255255
    },
    {
      begin: "111.221.128.0",
      beginNo: 111221128000,
      end: "111.222.255.255",
      endNo: 111222255255
    },
    {
      begin: "111.223.4.0",
      beginNo: 111223004000,
      end: "111.223.19.255",
      endNo: 111223019255
    },
    {
      begin: "111.224.0.0",
      beginNo: 111224000000,
      end: "111.231.255.255",
      endNo: 111231255255
    },
    {
      begin: "111.235.96.0",
      beginNo: 111235096000,
      end: "111.235.127.255",
      endNo: 111235127255
    },
    {
      begin: "111.235.156.0",
      beginNo: 111235156000,
      end: "111.235.191.255",
      endNo: 111235191255
    },
    {
      begin: "112.0.0.0",
      beginNo: 112000000000,
      end: "112.31.185.255",
      endNo: 112031185255
    },
    {
      begin: "112.31.188.0",
      beginNo: 112031188000,
      end: "112.32.185.255",
      endNo: 112032185255
    },
    {
      begin: "112.32.188.0",
      beginNo: 112032188000,
      end: "112.67.255.255",
      endNo: 112067255255
    },
    {
      begin: "112.73.0.0",
      beginNo: 112073000000,
      end: "112.75.255.255",
      endNo: 112075255255
    },
    {
      begin: "112.80.0.0",
      beginNo: 112080000000,
      end: "112.103.255.255",
      endNo: 112103255255
    },
    {
      begin: "112.109.128.0",
      beginNo: 112109128000,
      end: "112.109.255.255",
      endNo: 112109255255
    },
    {
      begin: "112.111.0.0",
      beginNo: 112111000000,
      end: "112.117.255.255",
      endNo: 112117255255
    },
    {
      begin: "112.122.0.0",
      beginNo: 112122000000,
      end: "112.132.255.255",
      endNo: 112132255255
    },
    {
      begin: "112.137.48.0",
      beginNo: 112137048000,
      end: "112.137.55.255",
      endNo: 112137055255
    },
    {
      begin: "112.192.0.0",
      beginNo: 112192000000,
      end: "112.195.255.255",
      endNo: 112195255255
    },
    {
      begin: "112.224.0.0",
      beginNo: 112224000000,
      end: "113.9.255.255",
      endNo: 113009255255
    },
    {
      begin: "113.11.192.0",
      beginNo: 113011192000,
      end: "113.11.223.255",
      endNo: 113011223255
    },
    {
      begin: "113.12.0.0",
      beginNo: 113012000000,
      end: "113.18.255.255",
      endNo: 113018255255
    },
    {
      begin: "113.21.232.0",
      beginNo: 113021232000,
      end: "113.21.239.255",
      endNo: 113021239255
    },
    {
      begin: "113.24.0.0",
      beginNo: 113024000000,
      end: "113.27.255.255",
      endNo: 113027255255
    },
    {
      begin: "113.31.0.0",
      beginNo: 113031000000,
      end: "113.31.255.255",
      endNo: 113031255255
    },
    {
      begin: "113.44.0.0",
      beginNo: 113044000000,
      end: "113.51.255.255",
      endNo: 113051255255
    },
    {
      begin: "113.52.160.0",
      beginNo: 113052160000,
      end: "113.52.191.255",
      endNo: 113052191255
    },
    {
      begin: "113.54.0.0",
      beginNo: 113054000000,
      end: "113.59.127.255",
      endNo: 113059127255
    },
    {
      begin: "113.62.0.0",
      beginNo: 113062000000,
      end: "113.129.255.255",
      endNo: 113129255255
    },
    {
      begin: "113.130.96.0",
      beginNo: 113130096000,
      end: "113.130.119.255",
      endNo: 113130119255
    },
    {
      begin: "113.132.0.0",
      beginNo: 113132000000,
      end: "113.143.255.255",
      endNo: 113143255255
    },
    {
      begin: "113.194.0.0",
      beginNo: 113194000000,
      end: "113.195.255.255",
      endNo: 113195255255
    },
    {
      begin: "113.197.100.0",
      beginNo: 113197100000,
      end: "113.197.107.255",
      endNo: 113197107255
    },
    {
      begin: "113.200.0.0",
      beginNo: 113200000000,
      end: "113.202.255.255",
      endNo: 113202255255
    },
    {
      begin: "113.204.0.0",
      beginNo: 113204000000,
      end: "113.207.255.255",
      endNo: 113207255255
    },
    {
      begin: "113.208.96.0",
      beginNo: 113208096000,
      end: "113.209.255.255",
      endNo: 113209255255
    },
    {
      begin: "113.212.0.0",
      beginNo: 113212000000,
      end: "113.212.63.255",
      endNo: 113212063255
    },
    {
      begin: "113.212.184.0",
      beginNo: 113212184000,
      end: "113.212.191.255",
      endNo: 113212191255
    },
    {
      begin: "113.213.0.0",
      beginNo: 113213000000,
      end: "113.213.127.255",
      endNo: 113213127255
    },
    {
      begin: "113.214.0.0",
      beginNo: 113214000000,
      end: "113.215.255.255",
      endNo: 113215255255
    },
    {
      begin: "113.218.0.0",
      beginNo: 113218000000,
      end: "113.251.255.255",
      endNo: 113251255255
    },
    {
      begin: "114.28.0.0",
      beginNo: 114028000000,
      end: "114.28.255.255",
      endNo: 114028255255
    },
    {
      begin: "114.31.64.0",
      beginNo: 114031064000,
      end: "114.31.71.255",
      endNo: 114031071255
    },
    {
      begin: "114.54.0.0",
      beginNo: 114054000000,
      end: "114.55.255.255",
      endNo: 114055255255
    },
    {
      begin: "114.60.0.0",
      beginNo: 114060000000,
      end: "114.68.255.255",
      endNo: 114068255255
    },
    {
      begin: "114.79.64.0",
      beginNo: 114079064000,
      end: "114.79.127.255",
      endNo: 114079127255
    },
    {
      begin: "114.80.0.0",
      beginNo: 114080000000,
      end: "114.107.255.255",
      endNo: 114107255255
    },
    {
      begin: "114.110.0.0",
      beginNo: 114110000000,
      end: "114.110.15.255",
      endNo: 114110015255
    },
    {
      begin: "114.110.64.0",
      beginNo: 114110064000,
      end: "114.110.127.255",
      endNo: 114110127255
    },
    {
      begin: "114.111.0.0",
      beginNo: 114111000000,
      end: "114.111.31.255",
      endNo: 114111031255
    },
    {
      begin: "114.111.160.0",
      beginNo: 114111160000,
      end: "114.111.191.255",
      endNo: 114111191255
    },
    {
      begin: "114.112.0.0",
      beginNo: 114112000000,
      end: "114.112.18.255",
      endNo: 114112018255
    },
    {
      begin: "114.112.22.0",
      beginNo: 114112022000,
      end: "114.112.129.255",
      endNo: 114112129255
    },
    {
      begin: "114.112.131.0",
      beginNo: 114112131000,
      end: "114.112.223.255",
      endNo: 114112223255
    },
    {
      begin: "114.113.0.0",
      beginNo: 114113000000,
      end: "114.113.191.255",
      endNo: 114113191255
    },
    {
      begin: "114.113.195.0",
      beginNo: 114113195000,
      end: "114.113.239.255",
      endNo: 114113239255
    },
    {
      begin: "114.113.246.0",
      beginNo: 114113246000,
      end: "114.113.251.255",
      endNo: 114113251255
    },
    {
      begin: "114.114.0.0",
      beginNo: 114114000000,
      end: "114.119.127.255",
      endNo: 114119127255
    },
    {
      begin: "114.119.192.0",
      beginNo: 114119192000,
      end: "114.119.255.255",
      endNo: 114119255255
    },
    {
      begin: "114.132.0.0",
      beginNo: 114132000000,
      end: "114.132.255.255",
      endNo: 114132255255
    },
    {
      begin: "114.135.0.0",
      beginNo: 114135000000,
      end: "114.135.255.255",
      endNo: 114135255255
    },
    {
      begin: "114.138.0.0",
      beginNo: 114138000000,
      end: "114.139.255.255",
      endNo: 114139255255
    },
    {
      begin: "114.141.64.0",
      beginNo: 114141064000,
      end: "114.141.71.255",
      endNo: 114141071255
    },
    {
      begin: "114.141.80.0",
      beginNo: 114141080000,
      end: "114.141.87.255",
      endNo: 114141087255
    },
    {
      begin: "114.141.128.0",
      beginNo: 114141128000,
      end: "114.141.191.255",
      endNo: 114141191255
    },
    {
      begin: "114.196.0.0",
      beginNo: 114196000000,
      end: "114.197.255.255",
      endNo: 114197255255
    },
    {
      begin: "114.198.248.0",
      beginNo: 114198248000,
      end: "114.198.255.255",
      endNo: 114198255255
    },
    {
      begin: "114.208.0.0",
      beginNo: 114208000000,
      end: "114.255.255.255",
      endNo: 114255255255
    },
    {
      begin: "115.24.0.0",
      beginNo: 115024000000,
      end: "115.29.255.255",
      endNo: 115029255255
    },
    {
      begin: "115.31.64.0",
      beginNo: 115031064000,
      end: "115.31.79.255",
      endNo: 115031079255
    },
    {
      begin: "115.32.0.0",
      beginNo: 115032000000,
      end: "115.35.255.255",
      endNo: 115035255255
    },
    {
      begin: "115.44.0.0",
      beginNo: 115044000000,
      end: "115.63.255.255",
      endNo: 115063255255
    },
    {
      begin: "115.69.64.0",
      beginNo: 115069064000,
      end: "115.69.79.255",
      endNo: 115069079255
    },
    {
      begin: "115.84.0.0",
      beginNo: 115084000000,
      end: "115.84.63.255",
      endNo: 115084063255
    },
    {
      begin: "115.84.192.0",
      beginNo: 115084192000,
      end: "115.84.223.255",
      endNo: 115084223255
    },
    {
      begin: "115.85.192.0",
      beginNo: 115085192000,
      end: "115.85.255.255",
      endNo: 115085255255
    },
    {
      begin: "115.100.0.0",
      beginNo: 115100000000,
      end: "115.107.255.255",
      endNo: 115107255255
    },
    {
      begin: "115.120.0.0",
      beginNo: 115120000000,
      end: "115.123.255.255",
      endNo: 115123255255
    },
    {
      begin: "115.124.16.0",
      beginNo: 115124016000,
      end: "115.124.31.255",
      endNo: 115124031255
    },
    {
      begin: "115.148.0.0",
      beginNo: 115148000000,
      end: "115.159.255.255",
      endNo: 115159255255
    },
    {
      begin: "115.166.64.0",
      beginNo: 115166064000,
      end: "115.166.95.255",
      endNo: 115166095255
    },
    {
      begin: "115.168.0.0",
      beginNo: 115168000000,
      end: "115.175.255.255",
      endNo: 115175255255
    },
    {
      begin: "115.180.0.0",
      beginNo: 115180000000,
      end: "115.183.255.255",
      endNo: 115183255255
    },
    {
      begin: "115.187.0.0",
      beginNo: 115187000000,
      end: "115.187.15.255",
      endNo: 115187015255
    },
    {
      begin: "115.190.0.0",
      beginNo: 115190000000,
      end: "115.239.255.255",
      endNo: 115239255255
    },
    {
      begin: "116.0.8.0",
      beginNo: 116000008000,
      end: "116.0.15.255",
      endNo: 116000015255
    },
    {
      begin: "116.0.24.0",
      beginNo: 116000024000,
      end: "116.0.31.255",
      endNo: 116000031255
    },
    {
      begin: "116.1.0.0",
      beginNo: 116001000000,
      end: "116.11.255.255",
      endNo: 116011255255
    },
    {
      begin: "116.13.0.0",
      beginNo: 116013000000,
      end: "116.13.255.255",
      endNo: 116013255255
    },
    {
      begin: "116.16.0.0",
      beginNo: 116016000000,
      end: "116.31.255.255",
      endNo: 116031255255
    },
    {
      begin: "116.50.0.0",
      beginNo: 116050000000,
      end: "116.50.15.255",
      endNo: 116050015255
    },
    {
      begin: "116.52.0.0",
      beginNo: 116052000000,
      end: "116.57.255.255",
      endNo: 116057255255
    },
    {
      begin: "116.58.128.0",
      beginNo: 116058128000,
      end: "116.58.143.255",
      endNo: 116058143255
    },
    {
      begin: "116.58.208.0",
      beginNo: 116058208000,
      end: "116.58.223.255",
      endNo: 116058223255
    },
    {
      begin: "116.60.0.0",
      beginNo: 116060000000,
      end: "116.63.255.255",
      endNo: 116063255255
    },
    {
      begin: "116.66.0.0",
      beginNo: 116066000000,
      end: "116.66.127.255",
      endNo: 116066127255
    },
    {
      begin: "116.68.136.0",
      beginNo: 116068136000,
      end: "116.68.143.255",
      endNo: 116068143255
    },
    {
      begin: "116.68.176.0",
      beginNo: 116068176000,
      end: "116.68.183.255",
      endNo: 116068183255
    },
    {
      begin: "116.69.0.0",
      beginNo: 116069000000,
      end: "116.70.127.255",
      endNo: 116070127255
    },
    {
      begin: "116.76.0.0",
      beginNo: 116076000000,
      end: "116.79.255.255",
      endNo: 116079255255
    },
    {
      begin: "116.85.0.0",
      beginNo: 116085000000,
      end: "116.85.255.255",
      endNo: 116085255255
    },
    {
      begin: "116.89.144.0",
      beginNo: 116089144000,
      end: "116.89.159.255",
      endNo: 116089159255
    },
    {
      begin: "116.90.80.0",
      beginNo: 116090080000,
      end: "116.90.95.255",
      endNo: 116090095255
    },
    {
      begin: "116.90.184.0",
      beginNo: 116090184000,
      end: "116.90.191.255",
      endNo: 116090191255
    },
    {
      begin: "116.95.0.0",
      beginNo: 116095000000,
      end: "116.95.255.255",
      endNo: 116095255255
    },
    {
      begin: "116.112.0.0",
      beginNo: 116112000000,
      end: "116.117.255.255",
      endNo: 116117255255
    },
    {
      begin: "116.128.0.0",
      beginNo: 116128000000,
      end: "116.192.255.255",
      endNo: 116192255255
    },
    {
      begin: "116.193.16.0",
      beginNo: 116193016000,
      end: "116.193.63.255",
      endNo: 116193063255
    },
    {
      begin: "116.193.176.0",
      beginNo: 116193176000,
      end: "116.193.183.255",
      endNo: 116193183255
    },
    {
      begin: "116.194.0.0",
      beginNo: 116194000000,
      end: "116.196.255.255",
      endNo: 116196255255
    },
    {
      begin: "116.197.160.0",
      beginNo: 116197160000,
      end: "116.197.167.255",
      endNo: 116197167255
    },
    {
      begin: "116.198.0.0",
      beginNo: 116198000000,
      end: "116.199.159.255",
      endNo: 116199159255
    },
    {
      begin: "116.204.0.0",
      beginNo: 116204000000,
      end: "116.204.127.255",
      endNo: 116204127255
    },
    {
      begin: "116.205.0.0",
      beginNo: 116205000000,
      end: "116.205.255.255",
      endNo: 116205255255
    },
    {
      begin: "116.207.0.0",
      beginNo: 116207000000,
      end: "116.211.255.255",
      endNo: 116211255255
    },
    {
      begin: "116.212.160.0",
      beginNo: 116212160000,
      end: "116.212.175.255",
      endNo: 116212175255
    },
    {
      begin: "116.213.64.0",
      beginNo: 116213064000,
      end: "116.213.255.255",
      endNo: 116213255255
    },
    {
      begin: "116.214.32.0",
      beginNo: 116214032000,
      end: "116.214.79.255",
      endNo: 116214079255
    },
    {
      begin: "116.214.128.0",
      beginNo: 116214128000,
      end: "116.219.255.255",
      endNo: 116219255255
    },
    {
      begin: "116.224.0.0",
      beginNo: 116224000000,
      end: "116.239.255.255",
      endNo: 116239255255
    },
    {
      begin: "116.242.0.0",
      beginNo: 116242000000,
      end: "116.249.255.255",
      endNo: 116249255255
    },
    {
      begin: "116.251.65.0",
      beginNo: 116251065000,
      end: "116.251.127.255",
      endNo: 116251127255
    },
    {
      begin: "116.252.0.0",
      beginNo: 116252000000,
      end: "116.253.255.255",
      endNo: 116253255255
    },
    {
      begin: "116.254.104.0",
      beginNo: 116254104000,
      end: "116.254.111.255",
      endNo: 116254111255
    },
    {
      begin: "116.254.128.0",
      beginNo: 116254128000,
      end: "116.254.255.255",
      endNo: 116254255255
    },
    {
      begin: "116.255.128.0",
      beginNo: 116255128000,
      end: "116.255.255.255",
      endNo: 116255255255
    },
    {
      begin: "117.8.0.0",
      beginNo: 117008000000,
      end: "117.15.255.255",
      endNo: 117015255255
    },
    {
      begin: "117.21.0.0",
      beginNo: 117021000000,
      end: "117.45.255.255",
      endNo: 117045255255
    },
    {
      begin: "117.48.0.0",
      beginNo: 117048000000,
      end: "117.50.255.255",
      endNo: 117050255255
    },
    {
      begin: "117.51.128.0",
      beginNo: 117051128000,
      end: "117.51.255.255",
      endNo: 117051255255
    },
    {
      begin: "117.53.48.0",
      beginNo: 117053048000,
      end: "117.53.63.255",
      endNo: 117053063255
    },
    {
      begin: "117.53.176.0",
      beginNo: 117053176000,
      end: "117.53.191.255",
      endNo: 117053191255
    },
    {
      begin: "117.57.0.0",
      beginNo: 117057000000,
      end: "117.58.127.255",
      endNo: 117058127255
    },
    {
      begin: "117.59.0.0",
      beginNo: 117059000000,
      end: "117.73.255.255",
      endNo: 117073255255
    },
    {
      begin: "117.74.64.0",
      beginNo: 117074064000,
      end: "117.74.95.255",
      endNo: 117074095255
    },
    {
      begin: "117.74.128.0",
      beginNo: 117074128000,
      end: "117.95.255.255",
      endNo: 117095255255
    },
    {
      begin: "117.100.0.0",
      beginNo: 117100000000,
      end: "117.101.255.255",
      endNo: 117101255255
    },
    {
      begin: "117.103.16.0",
      beginNo: 117103016000,
      end: "117.103.31.255",
      endNo: 117103031255
    },
    {
      begin: "117.103.40.0",
      beginNo: 117103040000,
      end: "117.103.47.255",
      endNo: 117103047255
    },
    {
      begin: "117.103.72.0",
      beginNo: 117103072000,
      end: "117.103.79.255",
      endNo: 117103079255
    },
    {
      begin: "117.103.128.0",
      beginNo: 117103128000,
      end: "117.103.143.255",
      endNo: 117103143255
    },
    {
      begin: "117.104.168.0",
      beginNo: 117104168000,
      end: "117.104.175.255",
      endNo: 117104175255
    },
    {
      begin: "117.106.0.0",
      beginNo: 117106000000,
      end: "117.107.255.255",
      endNo: 117107255255
    },
    {
      begin: "117.112.0.0",
      beginNo: 117112000000,
      end: "117.119.255.255",
      endNo: 117119255255
    },
    {
      begin: "117.120.64.0",
      beginNo: 117120064000,
      end: "117.121.199.255",
      endNo: 117121199255
    },
    {
      begin: "117.122.128.0",
      beginNo: 117122128000,
      end: "117.122.255.255",
      endNo: 117122255255
    },
    {
      begin: "117.124.0.0",
      beginNo: 117124000000,
      end: "117.191.255.255",
      endNo: 117191255255
    },
    {
      begin: "118.24.0.0",
      beginNo: 118024000000,
      end: "118.26.35.255",
      endNo: 118026035255
    },
    {
      begin: "118.26.40.0",
      beginNo: 118026040000,
      end: "118.26.103.255",
      endNo: 118026103255
    },
    {
      begin: "118.26.112.0",
      beginNo: 118026112000,
      end: "118.26.255.255",
      endNo: 118026255255
    },
    {
      begin: "118.28.0.0",
      beginNo: 118028000000,
      end: "118.31.255.255",
      endNo: 118031255255
    },
    {
      begin: "118.64.0.0",
      beginNo: 118064000000,
      end: "118.66.255.255",
      endNo: 118066255255
    },
    {
      begin: "118.67.112.0",
      beginNo: 118067112000,
      end: "118.67.127.255",
      endNo: 118067127255
    },
    {
      begin: "118.72.0.0",
      beginNo: 118072000000,
      end: "118.81.255.255",
      endNo: 118081255255
    },
    {
      begin: "118.84.0.0",
      beginNo: 118084000000,
      end: "118.85.255.255",
      endNo: 118085255255
    },
    {
      begin: "118.88.32.0",
      beginNo: 118088032000,
      end: "118.89.255.255",
      endNo: 118089255255
    },
    {
      begin: "118.91.240.0",
      beginNo: 118091240000,
      end: "118.91.255.255",
      endNo: 118091255255
    },
    {
      begin: "118.102.16.0",
      beginNo: 118102016000,
      end: "118.102.39.255",
      endNo: 118102039255
    },
    {
      begin: "118.103.164.0",
      beginNo: 118103164000,
      end: "118.103.179.255",
      endNo: 118103179255
    },
    {
      begin: "118.103.242.0",
      beginNo: 118103242000,
      end: "118.103.247.255",
      endNo: 118103247255
    },
    {
      begin: "118.112.0.0",
      beginNo: 118112000000,
      end: "118.126.255.255",
      endNo: 118126255255
    },
    {
      begin: "118.127.128.0",
      beginNo: 118127128000,
      end: "118.127.159.255",
      endNo: 118127159255
    },
    {
      begin: "118.132.0.0",
      beginNo: 118132000000,
      end: "118.135.255.255",
      endNo: 118135255255
    },
    {
      begin: "118.144.0.0",
      beginNo: 118144000000,
      end: "118.147.255.255",
      endNo: 118147255255
    },
    {
      begin: "118.178.0.0",
      beginNo: 118178000000,
      end: "118.178.255.255",
      endNo: 118178255255
    },
    {
      begin: "118.180.0.0",
      beginNo: 118180000000,
      end: "118.183.255.255",
      endNo: 118183255255
    },
    {
      begin: "118.184.128.0",
      beginNo: 118184128000,
      end: "118.184.255.255",
      endNo: 118184255255
    },
    {
      begin: "118.186.0.0",
      beginNo: 118186000000,
      end: "118.188.255.255",
      endNo: 118188255255
    },
    {
      begin: "118.190.0.0",
      beginNo: 118190000000,
      end: "118.191.12.255",
      endNo: 118191012255
    },
    {
      begin: "118.191.18.0",
      beginNo: 118191018000,
      end: "118.191.23.255",
      endNo: 118191023255
    },
    {
      begin: "118.191.64.0",
      beginNo: 118191064000,
      end: "118.191.83.255",
      endNo: 118191083255
    },
    {
      begin: "118.191.128.0",
      beginNo: 118191128000,
      end: "118.191.159.255",
      endNo: 118191159255
    },
    {
      begin: "118.191.176.0",
      beginNo: 118191176000,
      end: "118.191.208.255",
      endNo: 118191208255
    },
    {
      begin: "118.191.240.0",
      beginNo: 118191240000,
      end: "118.193.15.255",
      endNo: 118193015255
    },
    {
      begin: "118.193.48.36",
      beginNo: 118193048036,
      end: "118.193.55.255",
      endNo: 118193055255
    },
    {
      begin: "118.193.96.0",
      beginNo: 118193096000,
      end: "118.193.127.255",
      endNo: 118193127255
    },
    {
      begin: "118.194.0.0",
      beginNo: 118194000000,
      end: "118.194.227.255",
      endNo: 118194227255
    },
    {
      begin: "118.194.240.0",
      beginNo: 118194240000,
      end: "118.194.247.255",
      endNo: 118194247255
    },
    {
      begin: "118.195.0.0",
      beginNo: 118195000000,
      end: "118.199.255.255",
      endNo: 118199255255
    },
    {
      begin: "118.202.0.0",
      beginNo: 118202000000,
      end: "118.207.255.255",
      endNo: 118207255255
    },
    {
      begin: "118.212.0.0",
      beginNo: 118212000000,
      end: "118.213.255.255",
      endNo: 118213255255
    },
    {
      begin: "118.215.192.0",
      beginNo: 118215192000,
      end: "118.215.255.255",
      endNo: 118215255255
    },
    {
      begin: "118.224.0.0",
      beginNo: 118224000000,
      end: "118.230.255.255",
      endNo: 118230255255
    },
    {
      begin: "118.239.0.0",
      beginNo: 118239000000,
      end: "118.239.255.255",
      endNo: 118239255255
    },
    {
      begin: "118.242.0.0",
      beginNo: 118242000000,
      end: "118.242.255.255",
      endNo: 118242255255
    },
    {
      begin: "118.244.0.0",
      beginNo: 118244000000,
      end: "119.2.31.255",
      endNo: 119002031255
    },
    {
      begin: "119.2.128.0",
      beginNo: 119002128000,
      end: "119.7.255.255",
      endNo: 119007255255
    },
    {
      begin: "119.10.0.0",
      beginNo: 119010000000,
      end: "119.10.127.255",
      endNo: 119010127255
    },
    {
      begin: "119.15.136.0",
      beginNo: 119015136000,
      end: "119.15.143.255",
      endNo: 119015143255
    },
    {
      begin: "119.16.0.0",
      beginNo: 119016000000,
      end: "119.16.255.255",
      endNo: 119016255255
    },
    {
      begin: "119.18.192.0",
      beginNo: 119018192000,
      end: "119.18.215.255",
      endNo: 119018215255
    },
    {
      begin: "119.18.224.0",
      beginNo: 119018224000,
      end: "119.23.255.255",
      endNo: 119023255255
    },
    {
      begin: "119.27.64.0",
      beginNo: 119027064000,
      end: "119.27.255.255",
      endNo: 119027255255
    },
    {
      begin: "119.30.48.0",
      beginNo: 119030048000,
      end: "119.30.63.255",
      endNo: 119030063255
    },
    {
      begin: "119.31.192.0",
      beginNo: 119031192000,
      end: "119.31.223.255",
      endNo: 119031223255
    },
    {
      begin: "119.32.0.0",
      beginNo: 119032000000,
      end: "119.40.79.255",
      endNo: 119040079255
    },
    {
      begin: "119.40.128.0",
      beginNo: 119040128000,
      end: "119.42.31.255",
      endNo: 119042031255
    },
    {
      begin: "119.42.128.0",
      beginNo: 119042128000,
      end: "119.42.143.255",
      endNo: 119042143255
    },
    {
      begin: "119.42.224.0",
      beginNo: 119042224000,
      end: "119.42.255.255",
      endNo: 119042255255
    },
    {
      begin: "119.44.0.0",
      beginNo: 119044000000,
      end: "119.45.255.255",
      endNo: 119045255255
    },
    {
      begin: "119.48.0.0",
      beginNo: 119048000000,
      end: "119.55.255.255",
      endNo: 119055255255
    },
    {
      begin: "119.57.0.0",
      beginNo: 119057000000,
      end: "119.58.255.255",
      endNo: 119058255255
    },
    {
      begin: "119.59.128.0",
      beginNo: 119059128000,
      end: "119.62.255.255",
      endNo: 119062255255
    },
    {
      begin: "119.63.32.0",
      beginNo: 119063032000,
      end: "119.63.63.255",
      endNo: 119063063255
    },
    {
      begin: "119.75.208.0",
      beginNo: 119075208000,
      end: "119.75.223.255",
      endNo: 119075223255
    },
    {
      begin: "119.78.0.0",
      beginNo: 119078000000,
      end: "119.80.255.255",
      endNo: 119080255255
    },
    {
      begin: "119.82.208.0",
      beginNo: 119082208000,
      end: "119.82.223.255",
      endNo: 119082223255
    },
    {
      begin: "119.84.0.0",
      beginNo: 119084000000,
      end: "119.91.255.255",
      endNo: 119091255255
    },
    {
      begin: "119.96.0.0",
      beginNo: 119096000000,
      end: "119.103.255.255",
      endNo: 119103255255
    },
    {
      begin: "119.108.0.0",
      beginNo: 119108000000,
      end: "119.109.255.255",
      endNo: 119109255255
    },
    {
      begin: "119.112.0.0",
      beginNo: 119112000000,
      end: "119.147.255.255",
      endNo: 119147255255
    },
    {
      begin: "119.148.160.0",
      beginNo: 119148160000,
      end: "119.148.191.255",
      endNo: 119148191255
    },
    {
      begin: "119.151.192.0",
      beginNo: 119151192000,
      end: "119.151.255.255",
      endNo: 119151255255
    },
    {
      begin: "119.160.200.0",
      beginNo: 119160200000,
      end: "119.160.207.255",
      endNo: 119160207255
    },
    {
      begin: "119.161.120.0",
      beginNo: 119161120000,
      end: "119.167.255.255",
      endNo: 119167255255
    },
    {
      begin: "119.176.0.0",
      beginNo: 119176000000,
      end: "119.191.255.255",
      endNo: 119191255255
    },
    {
      begin: "119.232.0.0",
      beginNo: 119232000000,
      end: "119.233.255.255",
      endNo: 119233255255
    },
    {
      begin: "119.235.128.0",
      beginNo: 119235128000,
      end: "119.235.191.255",
      endNo: 119235191255
    },
    {
      begin: "119.248.0.0",
      beginNo: 119248000000,
      end: "119.251.255.255",
      endNo: 119251255255
    },
    {
      begin: "119.252.96.0",
      beginNo: 119252096000,
      end: "119.252.103.255",
      endNo: 119252103255
    },
    {
      begin: "119.252.240.0",
      beginNo: 119252240000,
      end: "120.15.255.255",
      endNo: 120015255255
    },
    {
      begin: "120.24.0.0",
      beginNo: 120024000000,
      end: "120.27.255.255",
      endNo: 120027255255
    },
    {
      begin: "120.30.0.0",
      beginNo: 120030000000,
      end: "120.49.255.255",
      endNo: 120049255255
    },
    {
      begin: "120.52.0.0",
      beginNo: 120052000000,
      end: "120.55.255.255",
      endNo: 120055255255
    },
    {
      begin: "120.64.0.0",
      beginNo: 120064000000,
      end: "120.71.255.255",
      endNo: 120071255255
    },
    {
      begin: "120.72.32.0",
      beginNo: 120072032000,
      end: "120.72.63.255",
      endNo: 120072063255
    },
    {
      begin: "120.72.128.0",
      beginNo: 120072128000,
      end: "120.72.255.255",
      endNo: 120072255255
    },
    {
      begin: "120.76.0.0",
      beginNo: 120076000000,
      end: "120.87.255.255",
      endNo: 120087255255
    },
    {
      begin: "120.88.8.0",
      beginNo: 120088008000,
      end: "120.88.15.255",
      endNo: 120088015255
    },
    {
      begin: "120.90.0.0",
      beginNo: 120090000000,
      end: "120.92.255.255",
      endNo: 120092255255
    },
    {
      begin: "120.94.0.0",
      beginNo: 120094000000,
      end: "120.95.255.255",
      endNo: 120095255255
    },
    {
      begin: "120.128.0.0",
      beginNo: 120128000000,
      end: "120.135.255.255",
      endNo: 120135255255
    },
    {
      begin: "120.136.16.0",
      beginNo: 120136016000,
      end: "120.136.23.255",
      endNo: 120136023255
    },
    {
      begin: "120.136.128.0",
      beginNo: 120136128000,
      end: "120.136.191.255",
      endNo: 120136191255
    },
    {
      begin: "120.137.0.0",
      beginNo: 120137000000,
      end: "120.137.127.255",
      endNo: 120137127255
    },
    {
      begin: "120.143.128.0",
      beginNo: 120143128000,
      end: "120.143.159.255",
      endNo: 120143159255
    },
    {
      begin: "120.192.0.0",
      beginNo: 120192000000,
      end: "120.255.255.255",
      endNo: 120255255255
    },
    {
      begin: "121.0.8.0",
      beginNo: 121000008000,
      end: "121.0.31.255",
      endNo: 121000031255
    },
    {
      begin: "121.4.0.0",
      beginNo: 121004000000,
      end: "121.5.255.255",
      endNo: 121005255255
    },
    {
      begin: "121.8.0.0",
      beginNo: 121008000000,
      end: "121.43.255.255",
      endNo: 121043255255
    },
    {
      begin: "121.46.0.0",
      beginNo: 121046000000,
      end: "121.46.63.255",
      endNo: 121046063255
    },
    {
      begin: "121.46.128.0",
      beginNo: 121046128000,
      end: "121.49.255.255",
      endNo: 121049255255
    },
    {
      begin: "121.50.8.0",
      beginNo: 121050008000,
      end: "121.50.15.255",
      endNo: 121050015255
    },
    {
      begin: "121.51.0.0",
      beginNo: 121051000000,
      end: "121.51.255.255",
      endNo: 121051255255
    },
    {
      begin: "121.52.160.0",
      beginNo: 121052160000,
      end: "121.52.191.255",
      endNo: 121052191255
    },
    {
      begin: "121.52.208.0",
      beginNo: 121052208000,
      end: "121.52.255.255",
      endNo: 121052255255
    },
    {
      begin: "121.54.176.0",
      beginNo: 121054176000,
      end: "121.54.183.255",
      endNo: 121054183255
    },
    {
      begin: "121.55.0.0",
      beginNo: 121055000000,
      end: "121.55.63.255",
      endNo: 121055063255
    },
    {
      begin: "121.56.0.0",
      beginNo: 121056000000,
      end: "121.58.127.255",
      endNo: 121058127255
    },
    {
      begin: "121.58.136.0",
      beginNo: 121058136000,
      end: "121.58.167.255",
      endNo: 121058167255
    },
    {
      begin: "121.59.0.0",
      beginNo: 121059000000,
      end: "121.59.16.255",
      endNo: 121059016255
    },
    {
      begin: "121.59.18.0",
      beginNo: 121059018000,
      end: "121.59.30.255",
      endNo: 121059030255
    },
    {
      begin: "121.60.0.0",
      beginNo: 121060000000,
      end: "121.63.255.255",
      endNo: 121063255255
    },
    {
      begin: "121.68.0.0",
      beginNo: 121068000000,
      end: "121.71.255.255",
      endNo: 121071255255
    },
    {
      begin: "121.76.0.0",
      beginNo: 121076000000,
      end: "121.77.255.255",
      endNo: 121077255255
    },
    {
      begin: "121.79.128.0",
      beginNo: 121079128000,
      end: "121.79.191.255",
      endNo: 121079191255
    },
    {
      begin: "121.89.0.0",
      beginNo: 121089000000,
      end: "121.89.255.255",
      endNo: 121089255255
    },
    {
      begin: "121.100.128.0",
      beginNo: 121100128000,
      end: "121.101.63.255",
      endNo: 121101063255
    },
    {
      begin: "121.101.208.0",
      beginNo: 121101208000,
      end: "121.101.223.255",
      endNo: 121101223255
    },
    {
      begin: "121.192.0.0",
      beginNo: 121192000000,
      end: "121.199.255.255",
      endNo: 121199255255
    },
    {
      begin: "121.200.192.0",
      beginNo: 121200192000,
      end: "121.200.199.255",
      endNo: 121200199255
    },
    {
      begin: "121.201.0.0",
      beginNo: 121201000000,
      end: "121.201.255.255",
      endNo: 121201255255
    },
    {
      begin: "121.204.0.0",
      beginNo: 121204000000,
      end: "121.207.255.255",
      endNo: 121207255255
    },
    {
      begin: "121.224.0.0",
      beginNo: 121224000000,
      end: "121.239.255.255",
      endNo: 121239255255
    },
    {
      begin: "121.248.0.0",
      beginNo: 121248000000,
      end: "121.251.255.255",
      endNo: 121251255255
    },
    {
      begin: "121.255.0.0",
      beginNo: 121255000000,
      end: "121.255.255.255",
      endNo: 121255255255
    },
    {
      begin: "122.0.64.0",
      beginNo: 122000064000,
      end: "122.0.255.255",
      endNo: 122000255255
    },
    {
      begin: "122.4.0.0",
      beginNo: 122004000000,
      end: "122.8.255.255",
      endNo: 122008255255
    },
    {
      begin: "122.10.128.0",
      beginNo: 122010128000,
      end: "122.10.133.255",
      endNo: 122010133255
    },
    {
      begin: "122.10.164.0",
      beginNo: 122010164000,
      end: "122.10.195.255",
      endNo: 122010195255
    },
    {
      begin: "122.10.200.0",
      beginNo: 122010200000,
      end: "122.10.219.255",
      endNo: 122010219255
    },
    {
      begin: "122.10.228.0",
      beginNo: 122010228000,
      end: "122.10.243.255",
      endNo: 122010243255
    },
    {
      begin: "122.11.0.0",
      beginNo: 122011000000,
      end: "122.11.127.255",
      endNo: 122011127255
    },
    {
      begin: "122.12.0.0",
      beginNo: 122012000000,
      end: "122.14.255.255",
      endNo: 122014255255
    },
    {
      begin: "122.48.0.0",
      beginNo: 122048000000,
      end: "122.49.63.255",
      endNo: 122049063255
    },
    {
      begin: "122.51.0.0",
      beginNo: 122051000000,
      end: "122.51.255.255",
      endNo: 122051255255
    },
    {
      begin: "122.64.0.0",
      beginNo: 122064000000,
      end: "122.97.255.255",
      endNo: 122097255255
    },
    {
      begin: "122.102.0.0",
      beginNo: 122102000000,
      end: "122.102.15.255",
      endNo: 122102015255
    },
    {
      begin: "122.102.64.0",
      beginNo: 122102064000,
      end: "122.102.95.255",
      endNo: 122102095255
    },
    {
      begin: "122.112.0.0",
      beginNo: 122112000000,
      end: "122.115.75.255",
      endNo: 122115075255
    },
    {
      begin: "122.115.80.0",
      beginNo: 122115080000,
      end: "122.115.255.255",
      endNo: 122115255255
    },
    {
      begin: "122.119.0.0",
      beginNo: 122119000000,
      end: "122.119.255.255",
      endNo: 122119255255
    },
    {
      begin: "122.128.120.0",
      beginNo: 122128120000,
      end: "122.128.127.255",
      endNo: 122128127255
    },
    {
      begin: "122.136.0.0",
      beginNo: 122136000000,
      end: "122.143.255.255",
      endNo: 122143255255
    },
    {
      begin: "122.144.128.0",
      beginNo: 122144128000,
      end: "122.144.255.255",
      endNo: 122144255255
    },
    {
      begin: "122.152.192.0",
      beginNo: 122152192000,
      end: "122.152.255.255",
      endNo: 122152255255
    },
    {
      begin: "122.156.0.0",
      beginNo: 122156000000,
      end: "122.159.255.255",
      endNo: 122159255255
    },
    {
      begin: "122.188.0.0",
      beginNo: 122188000000,
      end: "122.195.255.255",
      endNo: 122195255255
    },
    {
      begin: "122.198.0.0",
      beginNo: 122198000000,
      end: "122.198.255.255",
      endNo: 122198255255
    },
    {
      begin: "122.200.40.0",
      beginNo: 122200040000,
      end: "122.200.47.255",
      endNo: 122200047255
    },
    {
      begin: "122.200.64.0",
      beginNo: 122200064000,
      end: "122.200.127.255",
      endNo: 122200127255
    },
    {
      begin: "122.201.48.0",
      beginNo: 122201048000,
      end: "122.201.63.255",
      endNo: 122201063255
    },
    {
      begin: "122.204.0.0",
      beginNo: 122204000000,
      end: "122.207.255.255",
      endNo: 122207255255
    },
    {
      begin: "122.224.0.0",
      beginNo: 122224000000,
      end: "122.247.255.255",
      endNo: 122247255255
    },
    {
      begin: "122.248.24.0",
      beginNo: 122248024000,
      end: "122.248.31.255",
      endNo: 122248031255
    },
    {
      begin: "122.248.48.0",
      beginNo: 122248048000,
      end: "122.248.63.255",
      endNo: 122248063255
    },
    {
      begin: "122.255.64.0",
      beginNo: 122255064000,
      end: "122.255.71.255",
      endNo: 122255071255
    },
    {
      begin: "123.0.128.0",
      beginNo: 123000128000,
      end: "123.0.191.255",
      endNo: 123000191255
    },
    {
      begin: "123.4.0.0",
      beginNo: 123004000000,
      end: "123.15.255.255",
      endNo: 123015255255
    },
    {
      begin: "123.49.128.0",
      beginNo: 123049128000,
      end: "123.49.255.255",
      endNo: 123049255255
    },
    {
      begin: "123.50.160.0",
      beginNo: 123050160000,
      end: "123.50.191.255",
      endNo: 123050191255
    },
    {
      begin: "123.52.0.0",
      beginNo: 123052000000,
      end: "123.58.191.255",
      endNo: 123058191255
    },
    {
      begin: "123.58.224.0",
      beginNo: 123058224000,
      end: "123.59.255.255",
      endNo: 123059255255
    },
    {
      begin: "123.61.0.0",
      beginNo: 123061000000,
      end: "123.62.255.255",
      endNo: 123062255255
    },
    {
      begin: "123.64.0.0",
      beginNo: 123064000000,
      end: "123.98.127.255",
      endNo: 123098127255
    },
    {
      begin: "123.99.128.0",
      beginNo: 123099128000,
      end: "123.100.31.255",
      endNo: 123100031255
    },
    {
      begin: "123.101.0.0",
      beginNo: 123101000000,
      end: "123.101.255.255",
      endNo: 123101255255
    },
    {
      begin: "123.103.0.0",
      beginNo: 123103000000,
      end: "123.103.127.255",
      endNo: 123103127255
    },
    {
      begin: "123.108.128.0",
      beginNo: 123108128000,
      end: "123.108.143.255",
      endNo: 123108143255
    },
    {
      begin: "123.108.208.0",
      beginNo: 123108208000,
      end: "123.108.223.255",
      endNo: 123108223255
    },
    {
      begin: "123.112.0.0",
      beginNo: 123112000000,
      end: "123.135.255.255",
      endNo: 123135255255
    },
    {
      begin: "123.136.80.0",
      beginNo: 123136080000,
      end: "123.136.95.255",
      endNo: 123136095255
    },
    {
      begin: "123.137.0.0",
      beginNo: 123137000000,
      end: "123.139.255.255",
      endNo: 123139255255
    },
    {
      begin: "123.144.0.0",
      beginNo: 123144000000,
      end: "123.175.255.255",
      endNo: 123175255255
    },
    {
      begin: "123.176.80.0",
      beginNo: 123176080000,
      end: "123.176.95.255",
      endNo: 123176095255
    },
    {
      begin: "123.177.0.0",
      beginNo: 123177000000,
      end: "123.191.255.255",
      endNo: 123191255255
    },
    {
      begin: "123.196.0.0",
      beginNo: 123196000000,
      end: "123.197.255.255",
      endNo: 123197255255
    },
    {
      begin: "123.199.128.0",
      beginNo: 123199128000,
      end: "123.199.255.255",
      endNo: 123199255255
    },
    {
      begin: "123.206.0.0",
      beginNo: 123206000000,
      end: "123.207.255.255",
      endNo: 123207255255
    },
    {
      begin: "123.232.0.0",
      beginNo: 123232000000,
      end: "123.235.255.255",
      endNo: 123235255255
    },
    {
      begin: "123.242.0.0",
      beginNo: 123242000000,
      end: "123.242.127.255",
      endNo: 123242127255
    },
    {
      begin: "123.242.192.0",
      beginNo: 123242192000,
      end: "123.242.199.255",
      endNo: 123242199255
    },
    {
      begin: "123.244.0.0",
      beginNo: 123244000000,
      end: "123.247.255.255",
      endNo: 123247255255
    },
    {
      begin: "123.254.96.0",
      beginNo: 123254096000,
      end: "123.254.103.255",
      endNo: 123254103255
    },
    {
      begin: "124.6.64.0",
      beginNo: 124006064000,
      end: "124.6.127.255",
      endNo: 124006127255
    },
    {
      begin: "124.14.0.0",
      beginNo: 124014000000,
      end: "124.17.255.255",
      endNo: 124017255255
    },
    {
      begin: "124.20.0.0",
      beginNo: 124020000000,
      end: "124.23.255.255",
      endNo: 124023255255
    },
    {
      begin: "124.28.192.0",
      beginNo: 124028192000,
      end: "124.29.127.255",
      endNo: 124029127255
    },
    {
      begin: "124.31.0.0",
      beginNo: 124031000000,
      end: "124.31.255.255",
      endNo: 124031255255
    },
    {
      begin: "124.40.112.0",
      beginNo: 124040112000,
      end: "124.40.223.255",
      endNo: 124040223255
    },
    {
      begin: "124.42.0.0",
      beginNo: 124042000000,
      end: "124.42.255.255",
      endNo: 124042255255
    },
    {
      begin: "124.47.0.0",
      beginNo: 124047000000,
      end: "124.47.63.255",
      endNo: 124047063255
    },
    {
      begin: "124.64.0.0",
      beginNo: 124064000000,
      end: "124.66.127.255",
      endNo: 124066127255
    },
    {
      begin: "124.67.0.0",
      beginNo: 124067000000,
      end: "124.68.239.255",
      endNo: 124068239255
    },
    {
      begin: "124.68.244.0",
      beginNo: 124068244000,
      end: "124.79.255.255",
      endNo: 124079255255
    },
    {
      begin: "124.88.0.0",
      beginNo: 124088000000,
      end: "124.95.255.255",
      endNo: 124095255255
    },
    {
      begin: "124.108.8.0",
      beginNo: 124108008000,
      end: "124.108.15.255",
      endNo: 124108015255
    },
    {
      begin: "124.108.40.0",
      beginNo: 124108040000,
      end: "124.108.47.255",
      endNo: 124108047255
    },
    {
      begin: "124.109.96.0",
      beginNo: 124109096000,
      end: "124.109.103.255",
      endNo: 124109103255
    },
    {
      begin: "124.112.0.0",
      beginNo: 124112000000,
      end: "124.119.255.255",
      endNo: 124119255255
    },
    {
      begin: "124.126.0.0",
      beginNo: 124126000000,
      end: "124.135.255.255",
      endNo: 124135255255
    },
    {
      begin: "124.147.128.0",
      beginNo: 124147128000,
      end: "124.147.255.255",
      endNo: 124147255255
    },
    {
      begin: "124.151.0.0",
      beginNo: 124151000000,
      end: "124.152.255.255",
      endNo: 124152255255
    },
    {
      begin: "124.160.0.0",
      beginNo: 124160000000,
      end: "124.167.255.255",
      endNo: 124167255255
    },
    {
      begin: "124.172.0.0",
      beginNo: 124172000000,
      end: "124.175.255.255",
      endNo: 124175255255
    },
    {
      begin: "124.192.0.0",
      beginNo: 124192000000,
      end: "124.193.255.255",
      endNo: 124193255255
    },
    {
      begin: "124.196.0.0",
      beginNo: 124196000000,
      end: "124.196.255.255",
      endNo: 124196255255
    },
    {
      begin: "124.200.0.0",
      beginNo: 124200000000,
      end: "124.207.255.255",
      endNo: 124207255255
    },
    {
      begin: "124.220.0.0",
      beginNo: 124220000000,
      end: "124.240.191.255",
      endNo: 124240191255
    },
    {
      begin: "124.242.0.0",
      beginNo: 124242000000,
      end: "124.242.255.255",
      endNo: 124242255255
    },
    {
      begin: "124.243.192.0",
      beginNo: 124243192000,
      end: "124.243.255.255",
      endNo: 124243255255
    },
    {
      begin: "124.248.0.0",
      beginNo: 124248000000,
      end: "124.248.127.255",
      endNo: 124248127255
    },
    {
      begin: "124.249.0.0",
      beginNo: 124249000000,
      end: "124.251.255.255",
      endNo: 124251255255
    },
    {
      begin: "124.254.0.0",
      beginNo: 124254000000,
      end: "124.254.63.255",
      endNo: 124254063255
    },
    {
      begin: "125.31.192.0",
      beginNo: 125031192000,
      end: "125.47.255.255",
      endNo: 125047255255
    },
    {
      begin: "125.58.128.0",
      beginNo: 125058128000,
      end: "125.58.255.255",
      endNo: 125058255255
    },
    {
      begin: "125.61.128.0",
      beginNo: 125061128000,
      end: "125.62.66.255",
      endNo: 125062066255
    },
    {
      begin: "125.64.0.0",
      beginNo: 125064000000,
      end: "125.98.255.255",
      endNo: 125098255255
    },
    {
      begin: "125.104.0.0",
      beginNo: 125104000000,
      end: "125.127.255.255",
      endNo: 125127255255
    },
    {
      begin: "125.169.0.0",
      beginNo: 125169000000,
      end: "125.169.255.255",
      endNo: 125169255255
    },
    {
      begin: "125.171.0.0",
      beginNo: 125171000000,
      end: "125.171.255.255",
      endNo: 125171255255
    },
    {
      begin: "125.208.0.0",
      beginNo: 125208000000,
      end: "125.208.63.255",
      endNo: 125208063255
    },
    {
      begin: "125.210.0.0",
      beginNo: 125210000000,
      end: "125.211.255.255",
      endNo: 125211255255
    },
    {
      begin: "125.213.0.0",
      beginNo: 125213000000,
      end: "125.213.127.255",
      endNo: 125213127255
    },
    {
      begin: "125.214.96.0",
      beginNo: 125214096000,
      end: "125.214.127.255",
      endNo: 125214127255
    },
    {
      begin: "125.215.0.0",
      beginNo: 125215000000,
      end: "125.215.63.255",
      endNo: 125215063255
    },
    {
      begin: "125.216.0.0",
      beginNo: 125216000000,
      end: "125.223.255.255",
      endNo: 125223255255
    },
    {
      begin: "125.254.128.0",
      beginNo: 125254128000,
      end: "125.254.255.255",
      endNo: 125254255255
    },
    {
      begin: "128.108.0.0",
      beginNo: 128108000000,
      end: "128.108.255.255",
      endNo: 128108255255
    },
    {
      begin: "129.28.0.0",
      beginNo: 129028000000,
      end: "129.28.255.255",
      endNo: 129028255255
    },
    {
      begin: "129.204.0.0",
      beginNo: 129204000000,
      end: "129.204.255.255",
      endNo: 129204255255
    },
    {
      begin: "129.211.0.0",
      beginNo: 129211000000,
      end: "129.211.255.255",
      endNo: 129211255255
    },
    {
      begin: "132.232.0.0",
      beginNo: 132232000000,
      end: "132.232.255.255",
      endNo: 132232255255
    },
    {
      begin: "134.175.0.0",
      beginNo: 134175000000,
      end: "134.175.255.255",
      endNo: 134175255255
    },
    {
      begin: "139.5.56.0",
      beginNo: 139005056000,
      end: "139.5.63.255",
      endNo: 139005063255
    },
    {
      begin: "139.5.204.0",
      beginNo: 139005204000,
      end: "139.5.215.255",
      endNo: 139005215255
    },
    {
      begin: "139.9.0.0",
      beginNo: 139009000000,
      end: "139.9.255.255",
      endNo: 139009255255
    },
    {
      begin: "139.95.0.0",
      beginNo: 139095000000,
      end: "139.95.19.255",
      endNo: 139095019255
    },
    {
      begin: "139.129.0.0",
      beginNo: 139129000000,
      end: "139.129.255.255",
      endNo: 139129255255
    },
    {
      begin: "139.148.0.0",
      beginNo: 139148000000,
      end: "139.148.255.255",
      endNo: 139148255255
    },
    {
      begin: "139.155.0.0",
      beginNo: 139155000000,
      end: "139.155.255.255",
      endNo: 139155255255
    },
    {
      begin: "139.159.0.0",
      beginNo: 139159000000,
      end: "139.159.255.255",
      endNo: 139159255255
    },
    {
      begin: "139.170.0.0",
      beginNo: 139170000000,
      end: "139.170.255.255",
      endNo: 139170255255
    },
    {
      begin: "139.176.0.0",
      beginNo: 139176000000,
      end: "139.176.255.255",
      endNo: 139176255255
    },
    {
      begin: "139.183.0.0",
      beginNo: 139183000000,
      end: "139.183.255.255",
      endNo: 139183255255
    },
    {
      begin: "139.186.0.0",
      beginNo: 139186000000,
      end: "139.186.255.255",
      endNo: 139186255255
    },
    {
      begin: "139.189.0.0",
      beginNo: 139189000000,
      end: "139.189.255.255",
      endNo: 139189255255
    },
    {
      begin: "139.196.0.0",
      beginNo: 139196000000,
      end: "139.215.255.255",
      endNo: 139215255255
    },
    {
      begin: "139.217.0.0",
      beginNo: 139217000000,
      end: "139.217.255.255",
      endNo: 139217255255
    },
    {
      begin: "139.219.0.0",
      beginNo: 139219000000,
      end: "139.221.255.255",
      endNo: 139221255255
    },
    {
      begin: "139.224.0.0",
      beginNo: 139224000000,
      end: "139.224.255.255",
      endNo: 139224255255
    },
    {
      begin: "139.226.0.0",
      beginNo: 139226000000,
      end: "139.227.255.255",
      endNo: 139227255255
    },
    {
      begin: "140.75.0.0",
      beginNo: 140075000000,
      end: "140.75.255.255",
      endNo: 140075255255
    },
    {
      begin: "140.143.0.0",
      beginNo: 140143000000,
      end: "140.143.255.255",
      endNo: 140143255255
    },
    {
      begin: "140.179.0.0",
      beginNo: 140179000000,
      end: "140.179.255.255",
      endNo: 140179255255
    },
    {
      begin: "140.205.0.0",
      beginNo: 140205000000,
      end: "140.207.255.255",
      endNo: 140207255255
    },
    {
      begin: "140.210.0.0",
      beginNo: 140210000000,
      end: "140.210.255.255",
      endNo: 140210255255
    },
    {
      begin: "140.224.0.0",
      beginNo: 140224000000,
      end: "140.224.255.255",
      endNo: 140224255255
    },
    {
      begin: "140.237.0.0",
      beginNo: 140237000000,
      end: "140.237.255.255",
      endNo: 140237255255
    },
    {
      begin: "140.240.0.0",
      beginNo: 140240000000,
      end: "140.240.255.255",
      endNo: 140240255255
    },
    {
      begin: "140.243.0.0",
      beginNo: 140243000000,
      end: "140.243.255.255",
      endNo: 140243255255
    },
    {
      begin: "140.246.0.0",
      beginNo: 140246000000,
      end: "140.246.255.255",
      endNo: 140246255255
    },
    {
      begin: "140.249.0.0",
      beginNo: 140249000000,
      end: "140.250.255.255",
      endNo: 140250255255
    },
    {
      begin: "140.255.0.0",
      beginNo: 140255000000,
      end: "140.255.255.255",
      endNo: 140255255255
    },
    {
      begin: "142.70.0.0",
      beginNo: 142070000000,
      end: "142.70.255.255",
      endNo: 142070255255
    },
    {
      begin: "142.86.0.0",
      beginNo: 142086000000,
      end: "142.86.255.255",
      endNo: 142086255255
    },
    {
      begin: "143.191.64.0",
      beginNo: 143191064000,
      end: "143.191.103.255",
      endNo: 143191103255
    },
    {
      begin: "144.0.0.0",
      beginNo: 144000000000,
      end: "144.0.255.255",
      endNo: 144000255255
    },
    {
      begin: "144.7.0.0",
      beginNo: 144007000000,
      end: "144.7.255.255",
      endNo: 144007255255
    },
    {
      begin: "144.12.0.0",
      beginNo: 144012000000,
      end: "144.12.255.255",
      endNo: 144012255255
    },
    {
      begin: "144.48.180.0",
      beginNo: 144048180000,
      end: "144.48.187.255",
      endNo: 144048187255
    },
    {
      begin: "144.48.204.0",
      beginNo: 144048204000,
      end: "144.48.215.255",
      endNo: 144048215255
    },
    {
      begin: "144.52.0.0",
      beginNo: 144052000000,
      end: "144.52.255.255",
      endNo: 144052255255
    },
    {
      begin: "144.123.0.0",
      beginNo: 144123000000,
      end: "144.123.255.255",
      endNo: 144123255255
    },
    {
      begin: "144.255.0.0",
      beginNo: 144255000000,
      end: "144.255.255.255",
      endNo: 144255255255
    },
    {
      begin: "146.56.192.0",
      beginNo: 146056192000,
      end: "146.56.255.255",
      endNo: 146056255255
    },
    {
      begin: "146.196.68.0",
      beginNo: 146196068000,
      end: "146.196.75.255",
      endNo: 146196075255
    },
    {
      begin: "146.196.112.0",
      beginNo: 146196112000,
      end: "146.196.119.255",
      endNo: 146196119255
    },
    {
      begin: "148.70.0.0",
      beginNo: 148070000000,
      end: "148.70.255.255",
      endNo: 148070255255
    },
    {
      begin: "149.41.0.0",
      beginNo: 149041000000,
      end: "149.41.255.255",
      endNo: 149041255255
    },
    {
      begin: "149.129.32.0",
      beginNo: 149129032000,
      end: "149.129.63.255",
      endNo: 149129063255
    },
    {
      begin: "150.0.0.0",
      beginNo: 150000000000,
      end: "150.0.255.255",
      endNo: 150000255255
    },
    {
      begin: "150.115.0.0",
      beginNo: 150115000000,
      end: "150.115.255.255",
      endNo: 150115255255
    },
    {
      begin: "150.121.0.0",
      beginNo: 150121000000,
      end: "150.122.255.255",
      endNo: 150122255255
    },
    {
      begin: "150.138.0.0",
      beginNo: 150138000000,
      end: "150.139.255.255",
      endNo: 150139255255
    },
    {
      begin: "150.158.0.0",
      beginNo: 150158000000,
      end: "150.158.255.255",
      endNo: 150158255255
    },
    {
      begin: "150.223.0.0",
      beginNo: 150223000000,
      end: "150.223.255.255",
      endNo: 150223255255
    },
    {
      begin: "150.242.0.0",
      beginNo: 150242000000,
      end: "150.242.11.255",
      endNo: 150242011255
    },
    {
      begin: "150.242.44.0",
      beginNo: 150242044000,
      end: "150.242.59.255",
      endNo: 150242059255
    },
    {
      begin: "150.242.76.0",
      beginNo: 150242076000,
      end: "150.242.83.255",
      endNo: 150242083255
    },
    {
      begin: "150.242.92.0",
      beginNo: 150242092000,
      end: "150.242.99.255",
      endNo: 150242099255
    },
    {
      begin: "150.242.112.0",
      beginNo: 150242112000,
      end: "150.242.123.255",
      endNo: 150242123255
    },
    {
      begin: "150.242.152.0",
      beginNo: 150242152000,
      end: "150.242.171.255",
      endNo: 150242171255
    },
    {
      begin: "150.242.184.0",
      beginNo: 150242184000,
      end: "150.242.195.255",
      endNo: 150242195255
    },
    {
      begin: "150.242.232.0",
      beginNo: 150242232000,
      end: "150.242.251.255",
      endNo: 150242251255
    },
    {
      begin: "150.248.0.0",
      beginNo: 150248000000,
      end: "150.248.255.255",
      endNo: 150248255255
    },
    {
      begin: "150.255.0.0",
      beginNo: 150255000000,
      end: "150.255.255.255",
      endNo: 150255255255
    },
    {
      begin: "152.104.128.0",
      beginNo: 152104128000,
      end: "152.104.255.255",
      endNo: 152104255255
    },
    {
      begin: "152.136.0.0",
      beginNo: 152136000000,
      end: "152.136.255.255",
      endNo: 152136255255
    },
    {
      begin: "153.0.0.0",
      beginNo: 153000000000,
      end: "153.0.255.255",
      endNo: 153000255255
    },
    {
      begin: "153.3.0.0",
      beginNo: 153003000000,
      end: "153.3.255.255",
      endNo: 153003255255
    },
    {
      begin: "153.34.0.0",
      beginNo: 153034000000,
      end: "153.37.255.255",
      endNo: 153037255255
    },
    {
      begin: "153.99.0.0",
      beginNo: 153099000000,
      end: "153.99.255.255",
      endNo: 153099255255
    },
    {
      begin: "153.101.0.0",
      beginNo: 153101000000,
      end: "153.101.255.255",
      endNo: 153101255255
    },
    {
      begin: "153.118.0.0",
      beginNo: 153118000000,
      end: "153.119.255.255",
      endNo: 153119255255
    },
    {
      begin: "154.8.128.0",
      beginNo: 154008128000,
      end: "154.8.255.255",
      endNo: 154008255255
    },
    {
      begin: "156.59.0.0",
      beginNo: 156059000000,
      end: "156.59.255.255",
      endNo: 156059255255
    },
    {
      begin: "157.0.0.0",
      beginNo: 157000000000,
      end: "157.0.255.255",
      endNo: 157000255255
    },
    {
      begin: "157.18.0.0",
      beginNo: 157018000000,
      end: "157.18.255.255",
      endNo: 157018255255
    },
    {
      begin: "157.61.0.0",
      beginNo: 157061000000,
      end: "157.61.255.255",
      endNo: 157061255255
    },
    {
      begin: "157.119.8.0",
      beginNo: 157119008000,
      end: "157.119.19.255",
      endNo: 157119019255
    },
    {
      begin: "157.119.132.0",
      beginNo: 157119132000,
      end: "157.119.167.255",
      endNo: 157119167255
    },
    {
      begin: "157.119.192.0",
      beginNo: 157119192000,
      end: "157.119.199.255",
      endNo: 157119199255
    },
    {
      begin: "157.122.0.0",
      beginNo: 157122000000,
      end: "157.122.255.255",
      endNo: 157122255255
    },
    {
      begin: "157.133.192.0",
      beginNo: 157133192000,
      end: "157.133.199.255",
      endNo: 157133199255
    },
    {
      begin: "157.148.0.0",
      beginNo: 157148000000,
      end: "157.148.255.255",
      endNo: 157148255255
    },
    {
      begin: "157.156.0.0",
      beginNo: 157156000000,
      end: "157.156.255.255",
      endNo: 157156255255
    },
    {
      begin: "157.255.0.0",
      beginNo: 157255000000,
      end: "157.255.255.255",
      endNo: 157255255255
    },
    {
      begin: "158.46.200.0",
      beginNo: 158046200000,
      end: "158.46.207.255",
      endNo: 158046207255
    },
    {
      begin: "158.79.0.0",
      beginNo: 158079000000,
      end: "158.79.255.255",
      endNo: 158079255255
    },
    {
      begin: "159.75.0.0",
      beginNo: 159075000000,
      end: "159.75.255.255",
      endNo: 159075255255
    },
    {
      begin: "159.226.0.0",
      beginNo: 159226000000,
      end: "159.226.255.255",
      endNo: 159226255255
    },
    {
      begin: "160.19.208.0",
      beginNo: 160019208000,
      end: "160.19.219.255",
      endNo: 160019219255
    },
    {
      begin: "160.202.148.0",
      beginNo: 160202148000,
      end: "160.202.155.255",
      endNo: 160202155255
    },
    {
      begin: "160.202.212.0",
      beginNo: 160202212000,
      end: "160.202.255.255",
      endNo: 160202255255
    },
    {
      begin: "161.120.0.0",
      beginNo: 161120000000,
      end: "161.120.255.255",
      endNo: 161120255255
    },
    {
      begin: "161.189.0.0",
      beginNo: 161189000000,
      end: "161.189.255.255",
      endNo: 161189255255
    },
    {
      begin: "161.207.0.0",
      beginNo: 161207000000,
      end: "161.207.255.255",
      endNo: 161207255255
    },
    {
      begin: "162.14.0.0",
      beginNo: 162014000000,
      end: "162.14.255.255",
      endNo: 162014255255
    },
    {
      begin: "162.105.0.0",
      beginNo: 162105000000,
      end: "162.105.255.255",
      endNo: 162105255255
    },
    {
      begin: "163.0.0.0",
      beginNo: 163000000000,
      end: "163.0.255.255",
      endNo: 163000255255
    },
    {
      begin: "163.53.0.0",
      beginNo: 163053000000,
      end: "163.53.15.255",
      endNo: 163053015255
    },
    {
      begin: "163.53.36.0",
      beginNo: 163053036000,
      end: "163.53.67.255",
      endNo: 163053067255
    },
    {
      begin: "163.53.88.0",
      beginNo: 163053088000,
      end: "163.53.139.255",
      endNo: 163053139255
    },
    {
      begin: "163.53.160.0",
      beginNo: 163053160000,
      end: "163.53.175.255",
      endNo: 163053175255
    },
    {
      begin: "163.125.0.0",
      beginNo: 163125000000,
      end: "163.125.255.255",
      endNo: 163125255255
    },
    {
      begin: "163.142.0.0",
      beginNo: 163142000000,
      end: "163.142.255.255",
      endNo: 163142255255
    },
    {
      begin: "163.177.0.0",
      beginNo: 163177000000,
      end: "163.177.255.255",
      endNo: 163177255255
    },
    {
      begin: "163.179.0.0",
      beginNo: 163179000000,
      end: "163.179.255.255",
      endNo: 163179255255
    },
    {
      begin: "163.204.0.0",
      beginNo: 163204000000,
      end: "163.204.255.255",
      endNo: 163204255255
    },
    {
      begin: "166.111.0.0",
      beginNo: 166111000000,
      end: "166.111.255.255",
      endNo: 166111255255
    },
    {
      begin: "167.139.0.0",
      beginNo: 167139000000,
      end: "167.139.255.255",
      endNo: 167139255255
    },
    {
      begin: "167.189.0.0",
      beginNo: 167189000000,
      end: "167.189.255.255",
      endNo: 167189255255
    },
    {
      begin: "168.160.0.0",
      beginNo: 168160000000,
      end: "168.160.255.255",
      endNo: 168160255255
    },
    {
      begin: "170.179.0.0",
      beginNo: 170179000000,
      end: "170.179.255.255",
      endNo: 170179255255
    },
    {
      begin: "171.8.0.0",
      beginNo: 171008000000,
      end: "171.15.255.255",
      endNo: 171015255255
    },
    {
      begin: "171.34.0.0",
      beginNo: 171034000000,
      end: "171.47.255.255",
      endNo: 171047255255
    },
    {
      begin: "171.80.0.0",
      beginNo: 171080000000,
      end: "171.95.255.255",
      endNo: 171095255255
    },
    {
      begin: "171.104.0.0",
      beginNo: 171104000000,
      end: "171.127.255.255",
      endNo: 171127255255
    },
    {
      begin: "171.208.0.0",
      beginNo: 171208000000,
      end: "171.223.255.255",
      endNo: 171223255255
    },
    {
      begin: "172.81.192.0",
      beginNo: 172081192000,
      end: "172.81.255.255",
      endNo: 172081255255
    },
    {
      begin: "175.0.0.0",
      beginNo: 175000000000,
      end: "175.27.255.255",
      endNo: 175027255255
    },
    {
      begin: "175.30.0.0",
      beginNo: 175030000000,
      end: "175.31.255.255",
      endNo: 175031255255
    },
    {
      begin: "175.42.0.0",
      beginNo: 175042000000,
      end: "175.44.255.255",
      endNo: 175044255255
    },
    {
      begin: "175.46.0.0",
      beginNo: 175046000000,
      end: "175.95.255.255",
      endNo: 175095255255
    },
    {
      begin: "175.102.0.0",
      beginNo: 175102000000,
      end: "175.102.255.255",
      endNo: 175102255255
    },
    {
      begin: "175.106.128.0",
      beginNo: 175106128000,
      end: "175.106.255.255",
      endNo: 175106255255
    },
    {
      begin: "175.111.144.0",
      beginNo: 175111144000,
      end: "175.111.175.255",
      endNo: 175111175255
    },
    {
      begin: "175.146.0.0",
      beginNo: 175146000000,
      end: "175.155.255.255",
      endNo: 175155255255
    },
    {
      begin: "175.160.0.0",
      beginNo: 175160000000,
      end: "175.175.255.255",
      endNo: 175175255255
    },
    {
      begin: "175.178.0.0",
      beginNo: 175178000000,
      end: "175.178.255.255",
      endNo: 175178255255
    },
    {
      begin: "175.184.128.0",
      beginNo: 175184128000,
      end: "175.184.191.255",
      endNo: 175184191255
    },
    {
      begin: "175.185.0.0",
      beginNo: 175185000000,
      end: "175.191.255.255",
      endNo: 175191255255
    },
    {
      begin: "180.76.0.0",
      beginNo: 180076000000,
      end: "180.79.255.255",
      endNo: 180079255255
    },
    {
      begin: "180.84.0.0",
      beginNo: 180084000000,
      end: "180.86.255.255",
      endNo: 180086255255
    },
    {
      begin: "180.88.0.0",
      beginNo: 180088000000,
      end: "180.91.255.255",
      endNo: 180091255255
    },
    {
      begin: "180.94.56.0",
      beginNo: 180094056000,
      end: "180.94.63.255",
      endNo: 180094063255
    },
    {
      begin: "180.94.96.0",
      beginNo: 180094096000,
      end: "180.94.111.255",
      endNo: 180094111255
    },
    {
      begin: "180.94.120.0",
      beginNo: 180094120000,
      end: "180.94.127.255",
      endNo: 180094127255
    },
    {
      begin: "180.95.128.0",
      beginNo: 180095128000,
      end: "180.127.255.255",
      endNo: 180127255255
    },
    {
      begin: "180.129.128.0",
      beginNo: 180129128000,
      end: "180.130.255.255",
      endNo: 180130255255
    },
    {
      begin: "180.136.0.0",
      beginNo: 180136000000,
      end: "180.143.255.255",
      endNo: 180143255255
    },
    {
      begin: "180.148.16.0",
      beginNo: 180148016000,
      end: "180.148.23.255",
      endNo: 180148023255
    },
    {
      begin: "180.148.152.0",
      beginNo: 180148152000,
      end: "180.148.159.255",
      endNo: 180148159255
    },
    {
      begin: "180.148.216.0",
      beginNo: 180148216000,
      end: "180.148.255.255",
      endNo: 180148255255
    },
    {
      begin: "180.149.128.0",
      beginNo: 180149128000,
      end: "180.149.159.255",
      endNo: 180149159255
    },
    {
      begin: "180.150.160.0",
      beginNo: 180150160000,
      end: "180.150.191.255",
      endNo: 180150191255
    },
    {
      begin: "180.152.0.0",
      beginNo: 180152000000,
      end: "180.175.255.255",
      endNo: 180175255255
    },
    {
      begin: "180.178.112.0",
      beginNo: 180178112000,
      end: "180.178.119.255",
      endNo: 180178119255
    },
    {
      begin: "180.178.192.0",
      beginNo: 180178192000,
      end: "180.178.255.255",
      endNo: 180178255255
    },
    {
      begin: "180.184.0.0",
      beginNo: 180184000000,
      end: "180.188.127.255",
      endNo: 180188127255
    },
    {
      begin: "180.200.252.0",
      beginNo: 180200252000,
      end: "180.203.255.255",
      endNo: 180203255255
    },
    {
      begin: "180.208.0.0",
      beginNo: 180208000000,
      end: "180.209.255.255",
      endNo: 180209255255
    },
    {
      begin: "180.210.230.0",
      beginNo: 180210230000,
      end: "180.210.255.255",
      endNo: 180210255255
    },
    {
      begin: "180.212.0.0",
      beginNo: 180212000000,
      end: "180.213.255.255",
      endNo: 180213255255
    },
    {
      begin: "180.222.224.0",
      beginNo: 180222224000,
      end: "180.223.255.255",
      endNo: 180223255255
    },
    {
      begin: "180.233.0.0",
      beginNo: 180233000000,
      end: "180.233.95.255",
      endNo: 180233095255
    },
    {
      begin: "180.235.64.0",
      beginNo: 180235064000,
      end: "180.235.95.255",
      endNo: 180235095255
    },
    {
      begin: "182.16.144.0",
      beginNo: 182016144000,
      end: "182.16.151.255",
      endNo: 182016151255
    },
    {
      begin: "182.16.192.0",
      beginNo: 182016192000,
      end: "182.16.223.255",
      endNo: 182016223255
    },
    {
      begin: "182.18.0.0",
      beginNo: 182018000000,
      end: "182.18.127.255",
      endNo: 182018127255
    },
    {
      begin: "182.23.184.0",
      beginNo: 182023184000,
      end: "182.23.191.255",
      endNo: 182023191255
    },
    {
      begin: "182.23.200.0",
      beginNo: 182023200000,
      end: "182.23.207.255",
      endNo: 182023207255
    },
    {
      begin: "182.32.0.0",
      beginNo: 182032000000,
      end: "182.47.255.255",
      endNo: 182047255255
    },
    {
      begin: "182.48.96.0",
      beginNo: 182048096000,
      end: "182.48.127.255",
      endNo: 182048127255
    },
    {
      begin: "182.49.0.0",
      beginNo: 182049000000,
      end: "182.50.15.255",
      endNo: 182050015255
    },
    {
      begin: "182.50.112.0",
      beginNo: 182050112000,
      end: "182.50.127.255",
      endNo: 182050127255
    },
    {
      begin: "182.51.0.0",
      beginNo: 182051000000,
      end: "182.51.255.255",
      endNo: 182051255255
    },
    {
      begin: "182.54.0.0",
      beginNo: 182054000000,
      end: "182.54.127.255",
      endNo: 182054127255
    },
    {
      begin: "182.61.0.0",
      beginNo: 182061000000,
      end: "182.61.255.255",
      endNo: 182061255255
    },
    {
      begin: "182.80.0.0",
      beginNo: 182080000000,
      end: "182.92.255.255",
      endNo: 182092255255
    },
    {
      begin: "182.96.0.0",
      beginNo: 182096000000,
      end: "182.151.255.255",
      endNo: 182151255255
    },
    {
      begin: "182.157.0.0",
      beginNo: 182157000000,
      end: "182.157.255.255",
      endNo: 182157255255
    },
    {
      begin: "182.160.64.0",
      beginNo: 182160064000,
      end: "182.160.95.255",
      endNo: 182160095255
    },
    {
      begin: "182.174.0.0",
      beginNo: 182174000000,
      end: "182.175.255.255",
      endNo: 182175255255
    },
    {
      begin: "182.200.0.0",
      beginNo: 182200000000,
      end: "182.207.255.255",
      endNo: 182207255255
    },
    {
      begin: "182.236.128.0",
      beginNo: 182236128000,
      end: "182.236.255.255",
      endNo: 182236255255
    },
    {
      begin: "182.237.24.0",
      beginNo: 182237024000,
      end: "182.237.31.255",
      endNo: 182237031255
    },
    {
      begin: "182.238.0.0",
      beginNo: 182238000000,
      end: "182.239.31.255",
      endNo: 182239031255
    },
    {
      begin: "182.240.0.0",
      beginNo: 182240000000,
      end: "182.247.255.255",
      endNo: 182247255255
    },
    {
      begin: "182.254.0.0",
      beginNo: 182254000000,
      end: "182.254.255.255",
      endNo: 182254255255
    },
    {
      begin: "183.0.0.0",
      beginNo: 183000000000,
      end: "183.71.255.255",
      endNo: 183071255255
    },
    {
      begin: "183.78.160.0",
      beginNo: 183078160000,
      end: "183.78.167.255",
      endNo: 183078167255
    },
    {
      begin: "183.84.0.0",
      beginNo: 183084000000,
      end: "183.85.255.255",
      endNo: 183085255255
    },
    {
      begin: "183.91.136.0",
      beginNo: 183091136000,
      end: "183.91.159.255",
      endNo: 183091159255
    },
    {
      begin: "183.92.0.0",
      beginNo: 183092000000,
      end: "183.95.255.255",
      endNo: 183095255255
    },
    {
      begin: "183.128.0.0",
      beginNo: 183128000000,
      end: "183.170.255.255",
      endNo: 183170255255
    },
    {
      begin: "183.172.0.0",
      beginNo: 183172000000,
      end: "183.175.255.255",
      endNo: 183175255255
    },
    {
      begin: "183.182.0.0",
      beginNo: 183182000000,
      end: "183.182.31.255",
      endNo: 183182031255
    },
    {
      begin: "183.184.0.0",
      beginNo: 183184000000,
      end: "183.255.255.255",
      endNo: 183255255255
    },
    {
      begin: "184.174.17.0",
      beginNo: 184174017000,
      end: "184.174.39.255",
      endNo: 184174039255
    },
    {
      begin: "188.131.128.0",
      beginNo: 188131128000,
      end: "188.131.255.255",
      endNo: 188131255255
    },
    {
      begin: "192.140.128.0",
      beginNo: 192140128000,
      end: "192.140.139.255",
      endNo: 192140139255
    },
    {
      begin: "192.140.156.0",
      beginNo: 192140156000,
      end: "192.140.215.255",
      endNo: 192140215255
    },
    {
      begin: "192.144.128.0",
      beginNo: 192144128000,
      end: "192.144.255.255",
      endNo: 192144255255
    },
    {
      begin: "193.112.0.0",
      beginNo: 193112000000,
      end: "193.112.255.255",
      endNo: 193112255255
    },
    {
      begin: "199.65.192.0",
      beginNo: 199065192000,
      end: "199.65.199.255",
      endNo: 199065199255
    },
    {
      begin: "199.91.96.0",
      beginNo: 199091096000,
      end: "199.91.103.255",
      endNo: 199091103255
    },
    {
      begin: "202.4.128.0",
      beginNo: 202004128000,
      end: "202.4.159.255",
      endNo: 202004159255
    },
    {
      begin: "202.5.208.0",
      beginNo: 202005208000,
      end: "202.5.219.255",
      endNo: 202005219255
    },
    {
      begin: "202.6.176.0",
      beginNo: 202006176000,
      end: "202.6.191.255",
      endNo: 202006191255
    },
    {
      begin: "202.8.128.0",
      beginNo: 202008128000,
      end: "202.8.159.255",
      endNo: 202008159255
    },
    {
      begin: "202.8.192.0",
      beginNo: 202008192000,
      end: "202.8.207.255",
      endNo: 202008207255
    },
    {
      begin: "202.10.64.0",
      beginNo: 202010064000,
      end: "202.10.79.255",
      endNo: 202010079255
    },
    {
      begin: "202.10.112.0",
      beginNo: 202010112000,
      end: "202.10.127.255",
      endNo: 202010127255
    },
    {
      begin: "202.14.169.0",
      beginNo: 202014169000,
      end: "202.14.176.255",
      endNo: 202014176255
    },
    {
      begin: "202.14.235.0",
      beginNo: 202014235000,
      end: "202.14.239.255",
      endNo: 202014239255
    },
    {
      begin: "202.21.48.0",
      beginNo: 202021048000,
      end: "202.21.63.255",
      endNo: 202021063255
    },
    {
      begin: "202.21.150.0",
      beginNo: 202021150000,
      end: "202.21.154.255",
      endNo: 202021154255
    },
    {
      begin: "202.22.248.0",
      beginNo: 202022248000,
      end: "202.22.255.255",
      endNo: 202022255255
    },
    {
      begin: "202.38.8.0",
      beginNo: 202038008000,
      end: "202.38.15.255",
      endNo: 202038015255
    },
    {
      begin: "202.38.48.0",
      beginNo: 202038048000,
      end: "202.38.138.255",
      endNo: 202038138255
    },
    {
      begin: "202.38.149.0",
      beginNo: 202038149000,
      end: "202.38.156.255",
      endNo: 202038156255
    },
    {
      begin: "202.38.164.0",
      beginNo: 202038164000,
      end: "202.38.171.255",
      endNo: 202038171255
    },
    {
      begin: "202.38.184.0",
      beginNo: 202038184000,
      end: "202.38.255.255",
      endNo: 202038255255
    },
    {
      begin: "202.41.152.0",
      beginNo: 202041152000,
      end: "202.41.159.255",
      endNo: 202041159255
    },
    {
      begin: "202.41.196.0",
      beginNo: 202041196000,
      end: "202.41.203.255",
      endNo: 202041203255
    },
    {
      begin: "202.41.240.0",
      beginNo: 202041240000,
      end: "202.41.255.255",
      endNo: 202041255255
    },
    {
      begin: "202.43.144.0",
      beginNo: 202043144000,
      end: "202.43.159.255",
      endNo: 202043159255
    },
    {
      begin: "202.44.16.0",
      beginNo: 202044016000,
      end: "202.44.31.255",
      endNo: 202044031255
    },
    {
      begin: "202.45.15.0",
      beginNo: 202045015000,
      end: "202.45.31.255",
      endNo: 202045031255
    },
    {
      begin: "202.46.32.0",
      beginNo: 202046032000,
      end: "202.46.39.255",
      endNo: 202046039255
    },
    {
      begin: "202.46.41.0",
      beginNo: 202046041000,
      end: "202.46.63.255",
      endNo: 202046063255
    },
    {
      begin: "202.46.224.0",
      beginNo: 202046224000,
      end: "202.46.239.255",
      endNo: 202046239255
    },
    {
      begin: "202.47.96.0",
      beginNo: 202047096000,
      end: "202.47.111.255",
      endNo: 202047111255
    },
    {
      begin: "202.57.192.0",
      beginNo: 202057192000,
      end: "202.57.207.255",
      endNo: 202057207255
    },
    {
      begin: "202.57.212.0",
      beginNo: 202057212000,
      end: "202.57.219.255",
      endNo: 202057219255
    },
    {
      begin: "202.57.240.0",
      beginNo: 202057240000,
      end: "202.58.0.255",
      endNo: 202058000255
    },
    {
      begin: "202.60.48.0",
      beginNo: 202060048000,
      end: "202.60.55.255",
      endNo: 202060055255
    },
    {
      begin: "202.60.96.0",
      beginNo: 202060096000,
      end: "202.60.103.255",
      endNo: 202060103255
    },
    {
      begin: "202.60.112.0",
      beginNo: 202060112000,
      end: "202.60.127.255",
      endNo: 202060127255
    },
    {
      begin: "202.60.132.0",
      beginNo: 202060132000,
      end: "202.60.159.255",
      endNo: 202060159255
    },
    {
      begin: "202.62.248.0",
      beginNo: 202062248000,
      end: "202.62.252.255",
      endNo: 202062252255
    },
    {
      begin: "202.63.80.0",
      beginNo: 202063080000,
      end: "202.63.95.255",
      endNo: 202063095255
    },
    {
      begin: "202.63.160.0",
      beginNo: 202063160000,
      end: "202.63.191.255",
      endNo: 202063191255
    },
    {
      begin: "202.65.0.0",
      beginNo: 202065000000,
      end: "202.65.9.255",
      endNo: 202065009255
    },
    {
      begin: "202.65.96.0",
      beginNo: 202065096000,
      end: "202.65.111.255",
      endNo: 202065111255
    },
    {
      begin: "202.69.16.0",
      beginNo: 202069016000,
      end: "202.69.31.255",
      endNo: 202069031255
    },
    {
      begin: "202.70.0.0",
      beginNo: 202070000000,
      end: "202.70.31.255",
      endNo: 202070031255
    },
    {
      begin: "202.70.96.0",
      beginNo: 202070096000,
      end: "202.70.111.255",
      endNo: 202070111255
    },
    {
      begin: "202.70.192.0",
      beginNo: 202070192000,
      end: "202.70.207.255",
      endNo: 202070207255
    },
    {
      begin: "202.71.32.0",
      beginNo: 202071032000,
      end: "202.71.47.255",
      endNo: 202071047255
    },
    {
      begin: "202.72.40.0",
      beginNo: 202072040000,
      end: "202.72.47.255",
      endNo: 202072047255
    },
    {
      begin: "202.72.80.0",
      beginNo: 202072080000,
      end: "202.72.95.255",
      endNo: 202072095255
    },
    {
      begin: "202.72.112.0",
      beginNo: 202072112000,
      end: "202.72.127.255",
      endNo: 202072127255
    },
    {
      begin: "202.73.240.0",
      beginNo: 202073240000,
      end: "202.73.255.255",
      endNo: 202073255255
    },
    {
      begin: "202.74.8.0",
      beginNo: 202074008000,
      end: "202.74.15.255",
      endNo: 202074015255
    },
    {
      begin: "202.74.80.0",
      beginNo: 202074080000,
      end: "202.74.95.255",
      endNo: 202074095255
    },
    {
      begin: "202.75.208.0",
      beginNo: 202075208000,
      end: "202.75.223.255",
      endNo: 202075223255
    },
    {
      begin: "202.77.80.0",
      beginNo: 202077080000,
      end: "202.77.87.255",
      endNo: 202077087255
    },
    {
      begin: "202.78.8.0",
      beginNo: 202078008000,
      end: "202.78.15.255",
      endNo: 202078015255
    },
    {
      begin: "202.79.224.0",
      beginNo: 202079224000,
      end: "202.79.231.255",
      endNo: 202079231255
    },
    {
      begin: "202.80.192.0",
      beginNo: 202080192000,
      end: "202.80.207.255",
      endNo: 202080207255
    },
    {
      begin: "202.81.176.0",
      beginNo: 202081176000,
      end: "202.81.191.255",
      endNo: 202081191255
    },
    {
      begin: "202.84.4.0",
      beginNo: 202084004000,
      end: "202.84.17.255",
      endNo: 202084017255
    },
    {
      begin: "202.84.24.0",
      beginNo: 202084024000,
      end: "202.84.31.255",
      endNo: 202084031255
    },
    {
      begin: "202.85.208.0",
      beginNo: 202085208000,
      end: "202.85.223.255",
      endNo: 202085223255
    },
    {
      begin: "202.87.80.0",
      beginNo: 202087080000,
      end: "202.87.95.255",
      endNo: 202087095255
    },
    {
      begin: "202.89.8.0",
      beginNo: 202089008000,
      end: "202.89.15.255",
      endNo: 202089015255
    },
    {
      begin: "202.89.232.0",
      beginNo: 202089232000,
      end: "202.89.239.255",
      endNo: 202089239255
    },
    {
      begin: "202.90.16.0",
      beginNo: 202090016000,
      end: "202.90.31.255",
      endNo: 202090031255
    },
    {
      begin: "202.90.96.0",
      beginNo: 202090096000,
      end: "202.90.127.255",
      endNo: 202090127255
    },
    {
      begin: "202.90.224.0",
      beginNo: 202090224000,
      end: "202.90.239.255",
      endNo: 202090239255
    },
    {
      begin: "202.91.96.0",
      beginNo: 202091096000,
      end: "202.91.111.255",
      endNo: 202091111255
    },
    {
      begin: "202.91.176.0",
      beginNo: 202091176000,
      end: "202.91.191.255",
      endNo: 202091191255
    },
    {
      begin: "202.91.224.0",
      beginNo: 202091224000,
      end: "202.92.3.255",
      endNo: 202092003255
    },
    {
      begin: "202.92.8.0",
      beginNo: 202092008000,
      end: "202.92.15.255",
      endNo: 202092015255
    },
    {
      begin: "202.92.48.0",
      beginNo: 202092048000,
      end: "202.92.63.255",
      endNo: 202092063255
    },
    {
      begin: "202.92.252.0",
      beginNo: 202092252000,
      end: "202.93.3.255",
      endNo: 202093003255
    },
    {
      begin: "202.95.0.0",
      beginNo: 202095000000,
      end: "202.95.15.255",
      endNo: 202095015255
    },
    {
      begin: "202.95.24.0",
      beginNo: 202095024000,
      end: "202.95.31.255",
      endNo: 202095031255
    },
    {
      begin: "202.95.240.0",
      beginNo: 202095240000,
      end: "202.95.247.255",
      endNo: 202095247255
    },
    {
      begin: "202.95.252.0",
      beginNo: 202095252000,
      end: "202.97.95.255",
      endNo: 202097095255
    },
    {
      begin: "202.97.128.0",
      beginNo: 202097128000,
      end: "202.98.15.255",
      endNo: 202098015255
    },
    {
      begin: "202.98.24.0",
      beginNo: 202098024000,
      end: "202.120.24.223",
      endNo: 202120024223
    },
    {
      begin: "202.120.25.0",
      beginNo: 202120025000,
      end: "202.122.7.255",
      endNo: 202122007255
    },
    {
      begin: "202.122.32.0",
      beginNo: 202122032000,
      end: "202.122.39.255",
      endNo: 202122039255
    },
    {
      begin: "202.122.64.0",
      beginNo: 202122064000,
      end: "202.122.95.255",
      endNo: 202122095255
    },
    {
      begin: "202.122.112.0",
      beginNo: 202122112000,
      end: "202.122.128.255",
      endNo: 202122128255
    },
    {
      begin: "202.123.96.0",
      beginNo: 202123096000,
      end: "202.123.111.255",
      endNo: 202123111255
    },
    {
      begin: "202.123.116.0",
      beginNo: 202123116000,
      end: "202.123.123.255",
      endNo: 202123123255
    },
    {
      begin: "202.124.16.0",
      beginNo: 202124016000,
      end: "202.124.27.255",
      endNo: 202124027255
    },
    {
      begin: "202.125.112.0",
      beginNo: 202125112000,
      end: "202.125.127.255",
      endNo: 202125127255
    },
    {
      begin: "202.125.176.0",
      beginNo: 202125176000,
      end: "202.125.191.255",
      endNo: 202125191255
    },
    {
      begin: "202.127.0.0",
      beginNo: 202127000000,
      end: "202.127.7.255",
      endNo: 202127007255
    },
    {
      begin: "202.127.12.0",
      beginNo: 202127012000,
      end: "202.127.31.255",
      endNo: 202127031255
    },
    {
      begin: "202.127.40.0",
      beginNo: 202127040000,
      end: "202.127.63.255",
      endNo: 202127063255
    },
    {
      begin: "202.127.112.0",
      beginNo: 202127112000,
      end: "202.127.167.255",
      endNo: 202127167255
    },
    {
      begin: "202.127.192.0",
      beginNo: 202127192000,
      end: "202.127.209.255",
      endNo: 202127209255
    },
    {
      begin: "202.127.212.0",
      beginNo: 202127212000,
      end: "202.127.255.255",
      endNo: 202127255255
    },
    {
      begin: "202.130.0.0",
      beginNo: 202130000000,
      end: "202.130.31.255",
      endNo: 202130031255
    },
    {
      begin: "202.130.224.0",
      beginNo: 202130224000,
      end: "202.130.255.255",
      endNo: 202130255255
    },
    {
      begin: "202.131.16.0",
      beginNo: 202131016000,
      end: "202.131.23.255",
      endNo: 202131023255
    },
    {
      begin: "202.131.48.0",
      beginNo: 202131048000,
      end: "202.131.63.255",
      endNo: 202131063255
    },
    {
      begin: "202.131.208.0",
      beginNo: 202131208000,
      end: "202.131.223.255",
      endNo: 202131223255
    },
    {
      begin: "202.133.32.0",
      beginNo: 202133032000,
      end: "202.133.47.255",
      endNo: 202133047255
    },
    {
      begin: "202.134.128.0",
      beginNo: 202134128000,
      end: "202.134.143.255",
      endNo: 202134143255
    },
    {
      begin: "202.134.208.0",
      beginNo: 202134208000,
      end: "202.134.223.255",
      endNo: 202134223255
    },
    {
      begin: "202.136.48.0",
      beginNo: 202136048000,
      end: "202.136.63.255",
      endNo: 202136063255
    },
    {
      begin: "202.136.208.0",
      beginNo: 202136208000,
      end: "202.136.239.255",
      endNo: 202136239255
    },
    {
      begin: "202.140.140.0",
      beginNo: 202140140000,
      end: "202.140.159.255",
      endNo: 202140159255
    },
    {
      begin: "202.141.160.0",
      beginNo: 202141160000,
      end: "202.141.191.255",
      endNo: 202141191255
    },
    {
      begin: "202.142.16.0",
      beginNo: 202142016000,
      end: "202.142.31.255",
      endNo: 202142031255
    },
    {
      begin: "202.143.16.0",
      beginNo: 202143016000,
      end: "202.143.47.255",
      endNo: 202143047255
    },
    {
      begin: "202.143.56.0",
      beginNo: 202143056000,
      end: "202.143.63.255",
      endNo: 202143063255
    },
    {
      begin: "202.143.100.0",
      beginNo: 202143100000,
      end: "202.143.107.255",
      endNo: 202143107255
    },
    {
      begin: "202.146.160.0",
      beginNo: 202146160000,
      end: "202.146.175.255",
      endNo: 202146175255
    },
    {
      begin: "202.146.196.0",
      beginNo: 202146196000,
      end: "202.146.207.255",
      endNo: 202146207255
    },
    {
      begin: "202.147.144.0",
      beginNo: 202147144000,
      end: "202.147.159.255",
      endNo: 202147159255
    },
    {
      begin: "202.148.32.0",
      beginNo: 202148032000,
      end: "202.148.47.255",
      endNo: 202148047255
    },
    {
      begin: "202.148.64.0",
      beginNo: 202148064000,
      end: "202.148.127.255",
      endNo: 202148127255
    },
    {
      begin: "202.149.32.0",
      beginNo: 202149032000,
      end: "202.149.63.255",
      endNo: 202149063255
    },
    {
      begin: "202.149.160.0",
      beginNo: 202149160000,
      end: "202.149.191.255",
      endNo: 202149191255
    },
    {
      begin: "202.149.224.0",
      beginNo: 202149224000,
      end: "202.149.255.255",
      endNo: 202149255255
    },
    {
      begin: "202.150.16.0",
      beginNo: 202150016000,
      end: "202.150.47.255",
      endNo: 202150047255
    },
    {
      begin: "202.150.192.0",
      beginNo: 202150192000,
      end: "202.150.207.255",
      endNo: 202150207255
    },
    {
      begin: "202.150.224.0",
      beginNo: 202150224000,
      end: "202.151.3.255",
      endNo: 202151003255
    },
    {
      begin: "202.151.128.0",
      beginNo: 202151128000,
      end: "202.151.159.255",
      endNo: 202151159255
    },
    {
      begin: "202.152.176.0",
      beginNo: 202152176000,
      end: "202.152.191.255",
      endNo: 202152191255
    },
    {
      begin: "202.153.48.0",
      beginNo: 202153048000,
      end: "202.153.63.255",
      endNo: 202153063255
    },
    {
      begin: "202.157.192.0",
      beginNo: 202157192000,
      end: "202.157.223.255",
      endNo: 202157223255
    },
    {
      begin: "202.158.160.0",
      beginNo: 202158160000,
      end: "202.158.191.255",
      endNo: 202158191255
    },
    {
      begin: "202.160.176.0",
      beginNo: 202160176000,
      end: "202.160.191.255",
      endNo: 202160191255
    },
    {
      begin: "202.164.0.0",
      beginNo: 202164000000,
      end: "202.164.15.255",
      endNo: 202164015255
    },
    {
      begin: "202.164.96.0",
      beginNo: 202164096000,
      end: "202.164.127.255",
      endNo: 202164127255
    },
    {
      begin: "202.165.176.0",
      beginNo: 202165176000,
      end: "202.165.191.255",
      endNo: 202165191255
    },
    {
      begin: "202.165.208.0",
      beginNo: 202165208000,
      end: "202.165.223.255",
      endNo: 202165223255
    },
    {
      begin: "202.165.251.0",
      beginNo: 202165251000,
      end: "202.165.255.255",
      endNo: 202165255255
    },
    {
      begin: "202.166.224.0",
      beginNo: 202166224000,
      end: "202.166.255.255",
      endNo: 202166255255
    },
    {
      begin: "202.168.128.0",
      beginNo: 202168128000,
      end: "202.168.143.255",
      endNo: 202168143255
    },
    {
      begin: "202.168.160.0",
      beginNo: 202168160000,
      end: "202.168.191.255",
      endNo: 202168191255
    },
    {
      begin: "202.170.128.0",
      beginNo: 202170128000,
      end: "202.170.159.255",
      endNo: 202170159255
    },
    {
      begin: "202.170.216.0",
      beginNo: 202170216000,
      end: "202.170.255.255",
      endNo: 202170255255
    },
    {
      begin: "202.171.216.0",
      beginNo: 202171216000,
      end: "202.171.223.255",
      endNo: 202171223255
    },
    {
      begin: "202.173.8.0",
      beginNo: 202173008000,
      end: "202.173.15.255",
      endNo: 202173015255
    },
    {
      begin: "202.173.224.0",
      beginNo: 202173224000,
      end: "202.173.255.255",
      endNo: 202173255255
    },
    {
      begin: "202.174.64.0",
      beginNo: 202174064000,
      end: "202.174.79.255",
      endNo: 202174079255
    },
    {
      begin: "202.176.224.0",
      beginNo: 202176224000,
      end: "202.176.255.255",
      endNo: 202176255255
    },
    {
      begin: "202.179.160.0",
      beginNo: 202179160000,
      end: "202.179.175.255",
      endNo: 202179175255
    },
    {
      begin: "202.179.240.0",
      beginNo: 202179240000,
      end: "202.179.255.255",
      endNo: 202179255255
    },
    {
      begin: "202.180.128.0",
      beginNo: 202180128000,
      end: "202.180.159.255",
      endNo: 202180159255
    },
    {
      begin: "202.180.208.0",
      beginNo: 202180208000,
      end: "202.180.215.255",
      endNo: 202180215255
    },
    {
      begin: "202.181.112.0",
      beginNo: 202181112000,
      end: "202.181.127.255",
      endNo: 202181127255
    },
    {
      begin: "202.182.32.0",
      beginNo: 202182032000,
      end: "202.182.47.255",
      endNo: 202182047255
    },
    {
      begin: "202.182.192.0",
      beginNo: 202182192000,
      end: "202.182.223.255",
      endNo: 202182223255
    },
    {
      begin: "202.189.0.0",
      beginNo: 202189000000,
      end: "202.189.63.255",
      endNo: 202189063255
    },
    {
      begin: "202.189.80.0",
      beginNo: 202189080000,
      end: "202.189.95.255",
      endNo: 202189095255
    },
    {
      begin: "202.189.184.0",
      beginNo: 202189184000,
      end: "202.189.191.255",
      endNo: 202189191255
    },
    {
      begin: "202.191.68.0",
      beginNo: 202191068000,
      end: "202.191.95.255",
      endNo: 202191095255
    },
    {
      begin: "202.192.0.0",
      beginNo: 202192000000,
      end: "202.192.241.255",
      endNo: 202192241255
    },
    {
      begin: "202.192.243.0",
      beginNo: 202192243000,
      end: "202.207.255.255",
      endNo: 202207255255
    },
    {
      begin: "203.0.104.0",
      beginNo: 203000104000,
      end: "203.0.111.255",
      endNo: 203000111255
    },
    {
      begin: "203.0.130.0",
      beginNo: 203000130000,
      end: "203.0.135.255",
      endNo: 203000135255
    },
    {
      begin: "203.1.97.0",
      beginNo: 203001097000,
      end: "203.1.103.255",
      endNo: 203001103255
    },
    {
      begin: "203.2.64.0",
      beginNo: 203002064000,
      end: "203.2.71.255",
      endNo: 203002071255
    },
    {
      begin: "203.2.112.0",
      beginNo: 203002112000,
      end: "203.2.119.255",
      endNo: 203002119255
    },
    {
      begin: "203.2.152.0",
      beginNo: 203002152000,
      end: "203.2.157.255",
      endNo: 203002157255
    },
    {
      begin: "203.2.160.0",
      beginNo: 203002160000,
      end: "203.2.167.255",
      endNo: 203002167255
    },
    {
      begin: "203.3.80.0",
      beginNo: 203003080000,
      end: "203.3.87.255",
      endNo: 203003087255
    },
    {
      begin: "203.3.112.0",
      beginNo: 203003112000,
      end: "203.3.120.255",
      endNo: 203003120255
    },
    {
      begin: "203.4.151.0",
      beginNo: 203004151000,
      end: "203.4.155.255",
      endNo: 203004155255
    },
    {
      begin: "203.5.52.0",
      beginNo: 203005052000,
      end: "203.5.57.255",
      endNo: 203005057255
    },
    {
      begin: "203.6.224.0",
      beginNo: 203006224000,
      end: "203.6.239.255",
      endNo: 203006239255
    },
    {
      begin: "203.8.209.0",
      beginNo: 203008209000,
      end: "203.8.215.255",
      endNo: 203008215255
    },
    {
      begin: "203.9.96.0",
      beginNo: 203009096000,
      end: "203.9.101.255",
      endNo: 203009101255
    },
    {
      begin: "203.10.84.0",
      beginNo: 203010084000,
      end: "203.10.88.255",
      endNo: 203010088255
    },
    {
      begin: "203.15.0.0",
      beginNo: 203015000000,
      end: "203.15.15.255",
      endNo: 203015015255
    },
    {
      begin: "203.15.112.0",
      beginNo: 203015112000,
      end: "203.15.119.255",
      endNo: 203015119255
    },
    {
      begin: "203.15.232.0",
      beginNo: 203015232000,
      end: "203.15.241.255",
      endNo: 203015241255
    },
    {
      begin: "203.16.16.0",
      beginNo: 203016016000,
      end: "203.16.23.255",
      endNo: 203016023255
    },
    {
      begin: "203.23.226.0",
      beginNo: 203023226000,
      end: "203.23.231.255",
      endNo: 203023231255
    },
    {
      begin: "203.25.208.0",
      beginNo: 203025208000,
      end: "203.25.223.255",
      endNo: 203025223255
    },
    {
      begin: "203.57.224.0",
      beginNo: 203057224000,
      end: "203.57.239.255",
      endNo: 203057239255
    },
    {
      begin: "203.76.208.0",
      beginNo: 203076208000,
      end: "203.76.219.255",
      endNo: 203076219255
    },
    {
      begin: "203.78.48.0",
      beginNo: 203078048000,
      end: "203.78.63.255",
      endNo: 203078063255
    },
    {
      begin: "203.79.0.0",
      beginNo: 203079000000,
      end: "203.79.15.255",
      endNo: 203079015255
    },
    {
      begin: "203.80.32.0",
      beginNo: 203080032000,
      end: "203.80.47.255",
      endNo: 203080047255
    },
    {
      begin: "203.80.144.0",
      beginNo: 203080144000,
      end: "203.80.159.255",
      endNo: 203080159255
    },
    {
      begin: "203.81.16.0",
      beginNo: 203081016000,
      end: "203.81.31.255",
      endNo: 203081031255
    },
    {
      begin: "203.82.112.0",
      beginNo: 203082112000,
      end: "203.82.127.255",
      endNo: 203082127255
    },
    {
      begin: "203.82.224.0",
      beginNo: 203082224000,
      end: "203.82.239.255",
      endNo: 203082239255
    },
    {
      begin: "203.83.8.0",
      beginNo: 203083008000,
      end: "203.83.15.255",
      endNo: 203083015255
    },
    {
      begin: "203.83.56.0",
      beginNo: 203083056000,
      end: "203.83.63.255",
      endNo: 203083063255
    },
    {
      begin: "203.83.224.0",
      beginNo: 203083224000,
      end: "203.83.239.255",
      endNo: 203083239255
    },
    {
      begin: "203.86.0.0",
      beginNo: 203086000000,
      end: "203.86.127.255",
      endNo: 203086127255
    },
    {
      begin: "203.88.32.0",
      beginNo: 203088032000,
      end: "203.88.63.255",
      endNo: 203088063255
    },
    {
      begin: "203.88.192.0",
      beginNo: 203088192000,
      end: "203.88.223.255",
      endNo: 203088223255
    },
    {
      begin: "203.90.8.0",
      beginNo: 203090008000,
      end: "203.90.15.255",
      endNo: 203090015255
    },
    {
      begin: "203.90.128.0",
      beginNo: 203090128000,
      end: "203.90.223.255",
      endNo: 203090223255
    },
    {
      begin: "203.91.32.0",
      beginNo: 203091032000,
      end: "203.91.63.255",
      endNo: 203091063255
    },
    {
      begin: "203.91.96.0",
      beginNo: 203091096000,
      end: "203.91.111.255",
      endNo: 203091111255
    },
    {
      begin: "203.91.120.0",
      beginNo: 203091120000,
      end: "203.91.127.255",
      endNo: 203091127255
    },
    {
      begin: "203.92.160.0",
      beginNo: 203092160000,
      end: "203.92.191.255",
      endNo: 203092191255
    },
    {
      begin: "203.93.0.0",
      beginNo: 203093000000,
      end: "203.94.31.255",
      endNo: 203094031255
    },
    {
      begin: "203.95.0.0",
      beginNo: 203095000000,
      end: "203.95.7.255",
      endNo: 203095007255
    },
    {
      begin: "203.95.96.0",
      beginNo: 203095096000,
      end: "203.95.191.255",
      endNo: 203095191255
    },
    {
      begin: "203.95.200.0",
      beginNo: 203095200000,
      end: "203.95.211.255",
      endNo: 203095211255
    },
    {
      begin: "203.95.224.0",
      beginNo: 203095224000,
      end: "203.95.255.255",
      endNo: 203095255255
    },
    {
      begin: "203.99.16.0",
      beginNo: 203099016000,
      end: "203.99.31.255",
      endNo: 203099031255
    },
    {
      begin: "203.99.80.0",
      beginNo: 203099080000,
      end: "203.99.95.255",
      endNo: 203099095255
    },
    {
      begin: "203.100.32.0",
      beginNo: 203100032000,
      end: "203.100.47.255",
      endNo: 203100047255
    },
    {
      begin: "203.100.80.0",
      beginNo: 203100080000,
      end: "203.100.127.255",
      endNo: 203100127255
    },
    {
      begin: "203.100.192.0",
      beginNo: 203100192000,
      end: "203.100.207.255",
      endNo: 203100207255
    },
    {
      begin: "203.104.32.0",
      beginNo: 203104032000,
      end: "203.104.47.255",
      endNo: 203104047255
    },
    {
      begin: "203.105.96.0",
      beginNo: 203105096000,
      end: "203.105.159.255",
      endNo: 203105159255
    },
    {
      begin: "203.107.0.0",
      beginNo: 203107000000,
      end: "203.107.127.255",
      endNo: 203107127255
    },
    {
      begin: "203.110.160.0",
      beginNo: 203110160000,
      end: "203.110.191.255",
      endNo: 203110191255
    },
    {
      begin: "203.110.208.0",
      beginNo: 203110208000,
      end: "203.110.223.255",
      endNo: 203110223255
    },
    {
      begin: "203.114.80.0",
      beginNo: 203114080000,
      end: "203.114.95.255",
      endNo: 203114095255
    },
    {
      begin: "203.118.192.0",
      beginNo: 203118192000,
      end: "203.118.223.255",
      endNo: 203118223255
    },
    {
      begin: "203.119.24.0",
      beginNo: 203119024000,
      end: "203.119.35.255",
      endNo: 203119035255
    },
    {
      begin: "203.119.113.0",
      beginNo: 203119113000,
      end: "203.119.119.255",
      endNo: 203119119255
    },
    {
      begin: "203.119.128.0",
      beginNo: 203119128000,
      end: "203.119.196.255",
      endNo: 203119196255
    },
    {
      begin: "203.119.198.0",
      beginNo: 203119198000,
      end: "203.119.215.255",
      endNo: 203119215255
    },
    {
      begin: "203.119.217.0",
      beginNo: 203119217000,
      end: "203.119.255.255",
      endNo: 203119255255
    },
    {
      begin: "203.128.32.0",
      beginNo: 203128032000,
      end: "203.128.63.255",
      endNo: 203128063255
    },
    {
      begin: "203.128.96.0",
      beginNo: 203128096000,
      end: "203.128.127.255",
      endNo: 203128127255
    },
    {
      begin: "203.130.32.0",
      beginNo: 203130032000,
      end: "203.130.63.255",
      endNo: 203130063255
    },
    {
      begin: "203.132.32.0",
      beginNo: 203132032000,
      end: "203.132.63.255",
      endNo: 203132063255
    },
    {
      begin: "203.134.240.0",
      beginNo: 203134240000,
      end: "203.134.247.255",
      endNo: 203134247255
    },
    {
      begin: "203.135.96.0",
      beginNo: 203135096000,
      end: "203.135.127.255",
      endNo: 203135127255
    },
    {
      begin: "203.135.160.0",
      beginNo: 203135160000,
      end: "203.135.175.255",
      endNo: 203135175255
    },
    {
      begin: "203.142.224.0",
      beginNo: 203142224000,
      end: "203.142.255.255",
      endNo: 203142255255
    },
    {
      begin: "203.144.96.0",
      beginNo: 203144096000,
      end: "203.144.127.255",
      endNo: 203144127255
    },
    {
      begin: "203.145.0.0",
      beginNo: 203145000000,
      end: "203.145.31.255",
      endNo: 203145031255
    },
    {
      begin: "203.148.0.0",
      beginNo: 203148000000,
      end: "203.148.83.255",
      endNo: 203148083255
    },
    {
      begin: "203.152.64.0",
      beginNo: 203152064000,
      end: "203.152.95.255",
      endNo: 203152095255
    },
    {
      begin: "203.152.128.0",
      beginNo: 203152128000,
      end: "203.152.159.255",
      endNo: 203152159255
    },
    {
      begin: "203.156.192.0",
      beginNo: 203156192000,
      end: "203.156.255.255",
      endNo: 203156255255
    },
    {
      begin: "203.158.16.0",
      beginNo: 203158016000,
      end: "203.158.23.255",
      endNo: 203158023255
    },
    {
      begin: "203.160.192.0",
      beginNo: 203160192000,
      end: "203.160.223.255",
      endNo: 203160223255
    },
    {
      begin: "203.161.192.0",
      beginNo: 203161192000,
      end: "203.161.223.255",
      endNo: 203161223255
    },
    {
      begin: "203.166.160.0",
      beginNo: 203166160000,
      end: "203.166.191.255",
      endNo: 203166191255
    },
    {
      begin: "203.168.0.0",
      beginNo: 203168000000,
      end: "203.168.31.255",
      endNo: 203168031255
    },
    {
      begin: "203.171.224.0",
      beginNo: 203171224000,
      end: "203.171.239.255",
      endNo: 203171239255
    },
    {
      begin: "203.174.96.0",
      beginNo: 203174096000,
      end: "203.174.127.255",
      endNo: 203174127255
    },
    {
      begin: "203.175.128.0",
      beginNo: 203175128000,
      end: "203.175.159.255",
      endNo: 203175159255
    },
    {
      begin: "203.175.192.0",
      beginNo: 203175192000,
      end: "203.176.95.255",
      endNo: 203176095255
    },
    {
      begin: "203.176.168.0",
      beginNo: 203176168000,
      end: "203.176.175.255",
      endNo: 203176175255
    },
    {
      begin: "203.184.80.0",
      beginNo: 203184080000,
      end: "203.184.95.255",
      endNo: 203184095255
    },
    {
      begin: "203.187.160.0",
      beginNo: 203187160000,
      end: "203.187.191.255",
      endNo: 203187191255
    },
    {
      begin: "203.189.192.0",
      beginNo: 203189192000,
      end: "203.189.223.255",
      endNo: 203189223255
    },
    {
      begin: "203.190.96.0",
      beginNo: 203190096000,
      end: "203.190.111.255",
      endNo: 203190111255
    },
    {
      begin: "203.191.64.0",
      beginNo: 203191064000,
      end: "203.191.127.255",
      endNo: 203191127255
    },
    {
      begin: "203.191.144.0",
      beginNo: 203191144000,
      end: "203.191.159.255",
      endNo: 203191159255
    },
    {
      begin: "203.192.0.0",
      beginNo: 203192000000,
      end: "203.192.31.255",
      endNo: 203192031255
    },
    {
      begin: "203.193.224.0",
      beginNo: 203193224000,
      end: "203.193.255.255",
      endNo: 203193255255
    },
    {
      begin: "203.195.64.0",
      beginNo: 203195064000,
      end: "203.195.95.255",
      endNo: 203195095255
    },
    {
      begin: "203.195.128.0",
      beginNo: 203195128000,
      end: "203.196.7.255",
      endNo: 203196007255
    },
    {
      begin: "203.205.64.0",
      beginNo: 203205064000,
      end: "203.205.95.255",
      endNo: 203205095255
    },
    {
      begin: "203.205.148.0",
      beginNo: 203205148000,
      end: "203.205.152.255",
      endNo: 203205152255
    },
    {
      begin: "203.205.155.0",
      beginNo: 203205155000,
      end: "203.205.175.255",
      endNo: 203205175255
    },
    {
      begin: "203.205.180.0",
      beginNo: 203205180000,
      end: "203.205.186.255",
      endNo: 203205186255
    },
    {
      begin: "203.205.189.0",
      beginNo: 203205189000,
      end: "203.205.195.255",
      endNo: 203205195255
    },
    {
      begin: "203.205.198.0",
      beginNo: 203205198000,
      end: "203.205.217.255",
      endNo: 203205217255
    },
    {
      begin: "203.205.224.0",
      beginNo: 203205224000,
      end: "203.205.247.255",
      endNo: 203205247255
    },
    {
      begin: "203.207.64.0",
      beginNo: 203207064000,
      end: "203.208.19.255",
      endNo: 203208019255
    },
    {
      begin: "203.208.32.0",
      beginNo: 203208032000,
      end: "203.208.63.255",
      endNo: 203208063255
    },
    {
      begin: "203.209.224.0",
      beginNo: 203209224000,
      end: "203.209.255.255",
      endNo: 203209255255
    },
    {
      begin: "203.212.0.0",
      beginNo: 203212000000,
      end: "203.212.15.255",
      endNo: 203212015255
    },
    {
      begin: "203.212.80.0",
      beginNo: 203212080000,
      end: "203.212.95.255",
      endNo: 203212095255
    },
    {
      begin: "210.2.0.0",
      beginNo: 210002000000,
      end: "210.2.31.255",
      endNo: 210002031255
    },
    {
      begin: "210.5.0.0",
      beginNo: 210005000000,
      end: "210.5.31.255",
      endNo: 210005031255
    },
    {
      begin: "210.5.128.0",
      beginNo: 210005128000,
      end: "210.5.159.255",
      endNo: 210005159255
    },
    {
      begin: "210.7.56.0",
      beginNo: 210007056000,
      end: "210.7.63.255",
      endNo: 210007063255
    },
    {
      begin: "210.12.0.0",
      beginNo: 210012000000,
      end: "210.13.255.255",
      endNo: 210013255255
    },
    {
      begin: "210.14.64.0",
      beginNo: 210014064000,
      end: "210.14.95.255",
      endNo: 210014095255
    },
    {
      begin: "210.14.112.0",
      beginNo: 210014112000,
      end: "210.15.191.255",
      endNo: 210015191255
    },
    {
      begin: "210.16.128.0",
      beginNo: 210016128000,
      end: "210.16.191.255",
      endNo: 210016191255
    },
    {
      begin: "210.21.0.0",
      beginNo: 210021000000,
      end: "210.22.255.255",
      endNo: 210022255255
    },
    {
      begin: "210.23.32.0",
      beginNo: 210023032000,
      end: "210.23.63.255",
      endNo: 210023063255
    },
    {
      begin: "210.25.0.0",
      beginNo: 210025000000,
      end: "210.47.255.255",
      endNo: 210047255255
    },
    {
      begin: "210.51.0.0",
      beginNo: 210051000000,
      end: "210.53.255.255",
      endNo: 210053255255
    },
    {
      begin: "210.56.192.0",
      beginNo: 210056192000,
      end: "210.56.223.255",
      endNo: 210056223255
    },
    {
      begin: "210.72.0.0",
      beginNo: 210072000000,
      end: "210.78.255.255",
      endNo: 210078255255
    },
    {
      begin: "210.79.64.0",
      beginNo: 210079064000,
      end: "210.79.127.255",
      endNo: 210079127255
    },
    {
      begin: "210.79.224.0",
      beginNo: 210079224000,
      end: "210.79.255.255",
      endNo: 210079255255
    },
    {
      begin: "210.82.0.0",
      beginNo: 210082000000,
      end: "210.83.255.255",
      endNo: 210083255255
    },
    {
      begin: "210.87.128.0",
      beginNo: 210087128000,
      end: "210.87.191.255",
      endNo: 210087191255
    },
    {
      begin: "210.185.192.0",
      beginNo: 210185192000,
      end: "210.185.255.255",
      endNo: 210185255255
    },
    {
      begin: "210.192.96.0",
      beginNo: 210192096000,
      end: "210.192.127.255",
      endNo: 210192127255
    },
    {
      begin: "211.64.0.0",
      beginNo: 211064000000,
      end: "211.71.255.255",
      endNo: 211071255255
    },
    {
      begin: "211.80.0.0",
      beginNo: 211080000000,
      end: "211.103.255.255",
      endNo: 211103255255
    },
    {
      begin: "211.136.0.0",
      beginNo: 211136000000,
      end: "211.152.127.255",
      endNo: 211152127255
    },
    {
      begin: "211.152.157.0",
      beginNo: 211152157000,
      end: "211.167.255.255",
      endNo: 211167255255
    },
    {
      begin: "212.64.0.0",
      beginNo: 212064000000,
      end: "212.64.127.255",
      endNo: 212064127255
    },
    {
      begin: "212.129.128.0",
      beginNo: 212129128000,
      end: "212.129.255.255",
      endNo: 212129255255
    },
    {
      begin: "213.182.219.0",
      beginNo: 213182219000,
      end: "213.182.223.255",
      endNo: 213182223255
    },
    {
      begin: "216.74.120.0",
      beginNo: 216074120000,
      end: "216.74.127.255",
      endNo: 216074127255
    },
    {
      begin: "218.0.0.0",
      beginNo: 218000000000,
      end: "218.30.55.255",
      endNo: 218030055255
    },
    {
      begin: "218.30.64.0",
      beginNo: 218030064000,
      end: "218.31.255.255",
      endNo: 218031255255
    },
    {
      begin: "218.56.0.0",
      beginNo: 218056000000,
      end: "218.98.110.255",
      endNo: 218098110255
    },
    {
      begin: "218.98.112.0",
      beginNo: 218098112000,
      end: "218.99.255.255",
      endNo: 218099255255
    },
    {
      begin: "218.100.92.0",
      beginNo: 218100092000,
      end: "218.100.255.255",
      endNo: 218100255255
    },
    {
      begin: "218.104.0.0",
      beginNo: 218104000000,
      end: "218.109.255.255",
      endNo: 218109255255
    },
    {
      begin: "218.185.192.0",
      beginNo: 218185192000,
      end: "218.185.223.255",
      endNo: 218185223255
    },
    {
      begin: "218.192.0.0",
      beginNo: 218192000000,
      end: "218.207.255.255",
      endNo: 218207255255
    },
    {
      begin: "218.240.0.0",
      beginNo: 218240000000,
      end: "218.247.255.255",
      endNo: 218247255255
    },
    {
      begin: "218.249.0.0",
      beginNo: 218249000000,
      end: "218.249.255.255",
      endNo: 218249255255
    },
    {
      begin: "219.72.0.0",
      beginNo: 219072000000,
      end: "219.72.255.255",
      endNo: 219072255255
    },
    {
      begin: "219.82.0.0",
      beginNo: 219082000000,
      end: "219.82.255.255",
      endNo: 219082255255
    },
    {
      begin: "219.83.128.0",
      beginNo: 219083128000,
      end: "219.83.255.255",
      endNo: 219083255255
    },
    {
      begin: "219.90.68.0",
      beginNo: 219090068000,
      end: "219.90.79.255",
      endNo: 219090079255
    },
    {
      begin: "219.128.0.0",
      beginNo: 219128000000,
      end: "219.159.255.255",
      endNo: 219159255255
    },
    {
      begin: "219.216.0.0",
      beginNo: 219216000000,
      end: "219.239.255.255",
      endNo: 219239255255
    },
    {
      begin: "219.242.0.0",
      beginNo: 219242000000,
      end: "219.247.255.255",
      endNo: 219247255255
    },
    {
      begin: "220.101.192.0",
      beginNo: 220101192000,
      end: "220.101.255.255",
      endNo: 220101255255
    },
    {
      begin: "220.112.0.0",
      beginNo: 220112000000,
      end: "220.115.255.255",
      endNo: 220115255255
    },
    {
      begin: "220.152.128.0",
      beginNo: 220152128000,
      end: "220.152.255.255",
      endNo: 220152255255
    },
    {
      begin: "220.154.0.0",
      beginNo: 220154000000,
      end: "220.155.255.255",
      endNo: 220155255255
    },
    {
      begin: "220.160.0.0",
      beginNo: 220160000000,
      end: "220.207.255.255",
      endNo: 220207255255
    },
    {
      begin: "220.231.0.0",
      beginNo: 220231000000,
      end: "220.231.63.255",
      endNo: 220231063255
    },
    {
      begin: "220.231.128.0",
      beginNo: 220231128000,
      end: "220.231.255.255",
      endNo: 220231255255
    },
    {
      begin: "220.232.64.0",
      beginNo: 220232064000,
      end: "220.232.127.255",
      endNo: 220232127255
    },
    {
      begin: "220.234.0.0",
      beginNo: 220234000000,
      end: "220.234.255.255",
      endNo: 220234255255
    },
    {
      begin: "220.242.0.0",
      beginNo: 220242000000,
      end: "220.243.255.255",
      endNo: 220243255255
    },
    {
      begin: "220.247.136.0",
      beginNo: 220247136000,
      end: "220.247.143.255",
      endNo: 220247143255
    },
    {
      begin: "220.248.0.0",
      beginNo: 220248000000,
      end: "220.252.255.255",
      endNo: 220252255255
    },
    {
      begin: "221.0.0.0",
      beginNo: 221000000000,
      end: "221.12.191.255",
      endNo: 221012191255
    },
    {
      begin: "221.13.0.0",
      beginNo: 221013000000,
      end: "221.15.255.255",
      endNo: 221015255255
    },
    {
      begin: "221.122.0.0",
      beginNo: 221122000000,
      end: "221.123.255.255",
      endNo: 221123255255
    },
    {
      begin: "221.128.128.0",
      beginNo: 221128128000,
      end: "221.131.255.255",
      endNo: 221131255255
    },
    {
      begin: "221.133.224.0",
      beginNo: 221133224000,
      end: "221.133.255.255",
      endNo: 221133255255
    },
    {
      begin: "221.136.0.0",
      beginNo: 221136000000,
      end: "221.137.255.255",
      endNo: 221137255255
    },
    {
      begin: "221.172.0.0",
      beginNo: 221172000000,
      end: "221.183.255.255",
      endNo: 221183255255
    },
    {
      begin: "221.192.0.0",
      beginNo: 221192000000,
      end: "221.199.207.255",
      endNo: 221199207255
    },
    {
      begin: "221.199.224.0",
      beginNo: 221199224000,
      end: "221.239.255.255",
      endNo: 221239255255
    },
    {
      begin: "222.16.0.0",
      beginNo: 222016000000,
      end: "222.95.255.255",
      endNo: 222095255255
    },
    {
      begin: "222.125.0.0",
      beginNo: 222125000000,
      end: "222.125.255.255",
      endNo: 222125255255
    },
    {
      begin: "222.126.128.0",
      beginNo: 222126128000,
      end: "222.126.255.255",
      endNo: 222126255255
    },
    {
      begin: "222.128.0.0",
      beginNo: 222128000000,
      end: "222.143.255.255",
      endNo: 222143255255
    },
    {
      begin: "222.160.0.0",
      beginNo: 222160000000,
      end: "222.163.255.255",
      endNo: 222163255255
    },
    {
      begin: "222.168.0.0",
      beginNo: 222168000000,
      end: "222.223.255.255",
      endNo: 222223255255
    },
    {
      begin: "222.240.0.0",
      beginNo: 222240000000,
      end: "222.249.255.255",
      endNo: 222249255255
    },
    {
      begin: "223.0.0.0",
      beginNo: 223000000000,
      end: "223.15.255.255",
      endNo: 223015255255
    },
    {
      begin: "223.20.0.0",
      beginNo: 223020000000,
      end: "223.21.255.255",
      endNo: 223021255255
    },
    {
      begin: "223.64.0.0",
      beginNo: 223064000000,
      end: "223.117.255.255",
      endNo: 223117255255
    },
    {
      begin: "223.120.128.0",
      beginNo: 223120128000,
      end: "223.120.255.255",
      endNo: 223120255255
    },
    {
      begin: "223.121.128.0",
      beginNo: 223121128000,
      end: "223.129.255.255",
      endNo: 223129255255
    },
    {
      begin: "223.144.0.0",
      beginNo: 223144000000,
      end: "223.163.255.255",
      endNo: 223163255255
    },
    {
      begin: "223.166.0.0",
      beginNo: 223166000000,
      end: "223.167.255.255",
      endNo: 223167255255
    },
    {
      begin: "223.192.0.0",
      beginNo: 223192000000,
      end: "223.193.255.255",
      endNo: 223193255255
    },
    {
      begin: "223.198.0.0",
      beginNo: 223198000000,
      end: "223.199.255.255",
      endNo: 223199255255
    },
    {
      begin: "223.201.0.0",
      beginNo: 223201000000,
      end: "223.203.255.255",
      endNo: 223203255255
    },
    {
      begin: "223.208.0.0",
      beginNo: 223208000000,
      end: "223.215.255.255",
      endNo: 223215255255
    },
    {
      begin: "223.220.0.0",
      beginNo: 223220000000,
      end: "223.221.255.255",
      endNo: 223221255255
    },
    {
      begin: "223.223.176.0",
      beginNo: 223223176000,
      end: "223.223.207.255",
      endNo: 223223207255
    },
    {
      begin: "223.240.0.0",
      beginNo: 223240000000,
      end: "223.251.255.255",
      endNo: 223251255255
    },
    {
      begin: "223.252.128.0",
      beginNo: 223252128000,
      end: "223.252.175.255",
      endNo: 223252175255
    },
    {
      begin: "223.252.177.0",
      beginNo: 223252177000,
      end: "223.252.255.255",
      endNo: 223252255255
    },
    {
      begin: "223.254.0.0",
      beginNo: 223254000000,
      end: "223.255.127.255",
      endNo: 223255127255
    }
  ];
  let ipCheck = IPtoNum(request.headers["x-forwarded-for"]);
  let result = iprange.filter(
    ip => ip.beginNo <= ipCheck && ip.endNo >= ipCheck
  );
  if (result.length > 0) {
    response.json({ result: true });
  } else {
    response.json({ result: false });
  }
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
