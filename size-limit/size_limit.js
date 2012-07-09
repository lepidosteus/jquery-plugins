/**
 * Limit the maximum allowed size of an input/textarea and update a label with how many characters are left
 *
 * eg: limit to 300 characters, and write the label into $('span.description_size_limit')
 * jQuery('textarea[name=description]').size_limit({
 *    size: 300,
 *    label: 'span.description_size_limit'
 * });
 */
(function($){
    "use strict";
    $.fn.size_limit = function(options) {
	var
	// the configuration
	settings,
	// the <input> element
	$this,
	// the label
	$label
	;

	// the input we are watching
	$this = $(this);

	// configuration object
	settings = {
	    'size': 500,
	    'label': ''
	};

	if (options) {
	    $.extend(settings, options);
	}

	if (typeof(settings.label) == 'string') {
	    $label = $this.parents('form').find(settings.label);
	} else {
	    $label = $(settings.label);
	}

	// on changes, recompute the label and force the size limit
	$this.bind('keyup paste change fl_refresh', function(e) {
	    var val = $this.val();
	    var size_left = settings.size - val.length;

	    if (size_left < 0) {
		$this.val(val.substring(0, settings.size));
		size_left = 0;
	    }

	    $label.text(size_left);
	});

	// initial count
	$this.trigger('fl_refresh');

	return this;
    };
}(jQuery));
