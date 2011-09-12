var request = require('request');

module.exports = (function (api_key, options) {
	if (typeof api_key == undefined)  {
		throw("You must provide your postmark API key");
	}
	if (typeof options === 'undefined')  { options = {}; }
	if (options.ssl && options.ssl !== true) { options.ssl = false; }



	return {
		send: function(message, fn) {
			console.log('inside postmark.send');

			var valid_parameters = ["From", "To", "Cc", "Bcc", "Subject", "Tag", "HtmlBody", "TextBody", "ReplyTo", "Headers", "Attachments"]
			var valid_attachment_parameters = ["Name", "Content", "ContentType"];
			var attr, attach;
			for (attr in message) {
				if (valid_parameters.indexOf(attr) < 0)  {
					return fn("You can only provide attributes that work with the Postmark JSON message format. Details: http://developer.postmarkapp.com/developer-build.html#message-format", null);
				}
				if (attr == "Attachments") {
					for(attach in message[attr])  {
						var attach_attr;
						for (attach_attr in message[attr][attach])  {
							if (valid_attachment_parameters.indexOf(attach_attr) < 0)  {
								return fn("You can only provide attributes for attachments that work with the Postmark JSON message format. Details: http://developer.postmarkapp.com/developer-build.html#attachments", null);
							}
						}
					}
				}
			}


			var postmark_headers = {
				"Accept":  "application/json",
				"X-Postmark-Server-Token":  api_key
			}


			var port = options.ssl ? 443 : 80;
			var opts = {
				method: 'POST',
				uri: "http://api.postmarkapp.com:" + port + "/email",
				headers: postmark_headers,
				json: true,
				body: message,
			};
			console.log(opts);
			request(opts, function (err, res, body) {
				console.log('request complete');
				if (err) { return fn(err); }
				if (res.statusCode != 200) {
					return fn({
						status: res.statusCode,
						errorcode: JSON.parse(body)["ErrorCode"],
						message: JSON.parse(body)["Message"]
					});
				}
				return fn(null, message["To"]);
			});
		}
	}
});
