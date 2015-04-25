var phantom = require('phantom'),
	nodemailer = require('nodemailer'),
	colors = require('colors'),
	hosted_search_pages = ["http://search.tix4cause.com/", "http://search.craftsvilla.com/", "http://search.lenskart.com/"],
	error_msgs="",
	mailOptions = {
					from: 'info@unbxd.com',
					to: 'support@unbxd.com',
					cc:'praveen@unbxd.com',
					subject: 'unbxd search js sdk is not working on URL',
					text: 'unbxd search js sdk is not working on URL'
				},
   transporter = nodemailer.createTransport({
	    service: 'Gmail',
	    auth: {
	        user: 'info@unbxd.com',
	        pass: ''
	    }
	});

//callbacks
var checkDOM = function (url, page, phantom, status) {
				console.log("opening ", url, status);
				if(status === "success"){
			         page.evaluate(function() { 
			         	return jQuery('*[unbxdattr="product"]').length
			         }, checkProducts.bind(null, url) );
				}
				phantom.exit();
};

var checkProducts = function( url, products ){

		if( typeof products === "number" && products > 0){
			console.log("search js sdk still works for ".green + url .green);
			return true;
		}else{
			console.log("search js sdk is NOT working for ".red + url .red );
			mailOptions.subject = mailOptions.subject.replace("URL", url);
			mailOptions.text = mailOptions.text.replace("URL", url);
			transporter.sendMail(mailOptions);
			return false;
		}
};
 

for( var k=0; k<hosted_search_pages.length; k++){
	var url = hosted_search_pages[k];
	(function(e){ 
		phantom.create(function (phantom) {
			phantom.createPage(function (page) {
				page.open(e, checkDOM.bind(null, e, page, phantom) );
			});
		});
	})(url); 
};