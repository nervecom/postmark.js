var http = require("http");
var sys = require("sys");

module.exports = (function (api_key, options) {
  if (typeof api_key == undefined)  {
    throw("You must provide your postmark API key");
  }
  if (typeof options === 'undefined')  { options = {}; }
  if (options.ssl && options.ssl !== true) { options.ssl = false; }
  
  
  
  return {
    send: function(message, fn) {
      
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
      
      
      postmark_headers = {
        "Accept":  "application/json",
        "Content-Type":  "application/json",
        "X-Postmark-Server-Token":  api_key
      }
      
      var req = http.request({
        host: "api.postmarkapp.com",
        path: "/email",
        method: "POST",
        headers: postmark_headers,
        port: (options.ssl ? 443 : 80)
      }, function (response) {
		var body = "";
		response.on("data", function (i) { body += i; })
		response.on("end", function () {
			if (response.statusCode == 200) {
				if (fn) {
					return fn(null, message["To"]);
				}
			} else {
				if (fn) {
					return fn({status: response.statusCode, errorcode: JSON.parse(body)["ErrorCode"], message: JSON.parse(body)["Message"]});
				}
			}
		});
      });

      req.write(JSON.stringify(message));
      req.end();
    }
  }
});
