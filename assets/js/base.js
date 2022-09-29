import $ from 'jquery';

export default function () {
    if (localStorage.getItem("shp-country")) {

    } else {                    
        fetch(`https://www.cloudflare.com/cdn-cgi/trace`)
        .then(r=>r.text())
        .then(data=> {
            // console.log(data);
            data = data.trim().split('\n').reduce(function(obj, pair) {
                pair = pair.split('=');
                return obj[pair[0]] = pair[1], obj;
            }, {});                    
            if (data.loc) {
                localStorage.setItem("shp-country", data.loc);
                // if (data.loc=="CA" || data.loc=="FR") {
                //     setTimeout(function() {
                //         $(".popup-country").css({display:"flex"});
                //         $(".popup-country-title").append(data.loc=="FR" ?
                //             "bonjour" :
                //             "hi there")
                //         $(".popup-country-main").append(data.loc=="FR"?
                //             "Il semble que vous nous rendiez visite depuis la France.<br/>Vous pouvez consulter notre site web en France pour les prix en Euros et les options d'expédition locales." : 
                //             "It looks like you are visiting us from Canada.<br/>You can visit our Canadian website for CAD prices and local shipping options.")
                //         $(".popup-country-link").append(data.loc=="FR" ?
                //             "emmenez-moi là" :
                //             "take me there")
                //         $(".popup-country-continue").append(data.loc=="FR" ?
                //             "<div>Non, je ne viens pas de France</div><div class=popup-country-continue-link>Continuer de naviguer!</div>" :
                //             "<div>No, I am not from Canada</div><div class=popup-country-continue-link>Continue browsing!</div>")
                        
                //         $('.popup-country-link').attr('href',data.loc=="CA"?"//superhairpieces.ca":"//superhairpieces.fr")

                //         $(".popup-country-continue-link").on("click", function() {
                //             $(".popup-country").hide();
                //         });
                //         $(".popup-country-overlay").on("click", function() {
                //             $(".popup-country").hide();
                //         })
                //     },3500);
                // }
                if (data.loc=="US") {
                    setTimeout(function() {
                        $(".popup-country").css({display:"flex"});
                        $(".popup-country-title").append("hi there")
                        $(".popup-country-main").append("It looks like you are visiting us from US.<br/>You can visit our main website for USD prices and local shipping options.")
                        $(".popup-country-link").append("take me there")
                        $(".popup-country-continue").append("<div>No, I am not from Canada</div><div class=popup-country-continue-link>Continue browsing!</div>")
                        
                        $('.popup-country-link').attr('href', "//superhairpieces.com")

                        $(".popup-country-continue-link").on("click", function() {
                            $(".popup-country").hide();
                        });
                        $(".popup-country-overlay").on("click", function() {
                            $(".popup-country").hide();
                        })
                    },3500);
                }  
                // if (data.loc!="CA") {
                //     setTimeout(function() {
                //         $(".popup-country").css({display:"flex"});
                //         $(".popup-country-title").append(data.loc=="FR" ?
                //             "bonjour" :
                //             "hi there")
                //         $(".popup-country-main").append(data.loc=="FR"?
                //             "Il semble que vous nous rendiez visite depuis la France.<br/>Vous pouvez consulter notre site web en France pour les prix en Euros et les options d'expédition locales." : 
                //             "Are you visiting Superhairpieces.ca from outside Canada?<br/>Visit our official global site for more relevant pricing, promotions and events.")
                //         $(".popup-country-link").append(data.loc=="FR" ?
                //             "emmenez-moi là" :
                //             "take me there")
                //         $(".popup-country-continue").append(data.loc=="FR" ?
                //             "<div>Non, je ne viens pas de France</div><div class=popup-country-continue-link>Continuer de naviguer!</div>" :
                //             "<div>No, I am from Canada</div><div class=popup-country-continue-link>Continue browsing!</div>")
                        
                //         $('.popup-country-link').attr('href',data.loc=="FR"?"//superhairpieces.fr":"//superhairpieces.com")

                //         $(".popup-country-continue-link").on("click", function() {
                //             $(".popup-country").hide();
                //         });
                //         $(".popup-country-overlay").on("click", function() {
                //             $(".popup-country").hide();
                //         })
                //     },3500);
                // } 
    
            }
        })
        .catch(e=>console.log(e));
    }     


}
