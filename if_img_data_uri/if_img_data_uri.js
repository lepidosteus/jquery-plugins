/**
 * Detect image data-uri support in the browser and call the corresponding callback
 *
 * $.if_img_data_uri(callback_if_true, callback_if_false);
 *
 * No particular reasons to use jquery or add it as a plugin, but that simplified my use case. Feel free to extract it out as a stand alone function.
 */
jQuery.if_img_data_uri = function(options) {
    "use strict";

    var
    settings,
    data_uri_test_img
    ;

    // configuration object
    settings = {
	'success': null,
	'failure': null
    };

    if (options) {
	jQuery.extend(settings, options);
    }

    // we try to load a sample image using a data-uri, and then use the load/error event to detect if it worked

    data_uri_test_img = new Image();
    data_uri_test_img.onload = function() {
	// detect if the image was properly loaded
	if(this.width == 1 && this.height == 1){
	    if (settings.success != null) {
		settings.success();
	    }
	} else {
	    if (settings.failure != null) {
		settings.failure();
	    }
	}
    }
    data_uri_test_img.onerror = data_uri_test_img.onload;

    // try to load a 1x1 gif
    data_uri_test_img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

    return this;
};
