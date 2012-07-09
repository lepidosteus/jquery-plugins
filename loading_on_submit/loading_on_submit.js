/**
 * Show a loading element on top of a form on its submit event
 *
 * $('#myform').loading_on_submit({
 *    'img_src': 'http://static.com/loader.gif',
 *    'img_height': 32
 * });
 */
(function($){
    "use strict";
    $.fn.loading_on_submit = function(options) {
	var
	// the configuration
	settings,
	// the <form> element
	$this,
	// our loading overlay
	$loading,
	// our loading image
	$loading_img,
	// our data object
	$data,
	// our hide and show functions
	show_loading,
	hide_loading
	;

	// the form we are watching
	$this = $(this);

	show_loading = function ($data) {
	    var form_offset = $this.offset();
	    var form_height = $this.outerHeight();
	    var form_width = $this.outerWidth();
	    $data.loading_img.css('margin-top', (form_height / 2) - ($data.settings.img_height / 2));
	    $data.loading.css({
		'top': form_offset.top,
		'left': form_offset.left,
		'width': form_width,
		'height': form_height
	    }).show();
	};

	hide_loading = function ($data) {
	    $data.loading.hide();
	};

	$data = $this.data('loading_on_submit');

	if ($data) {
	    if (options == 'show') {
		show_loading($data);
	    } else if (options == 'hide') {
		hide_loading($data);
	    }
	    return;
	}

	// configuration object
	settings = {
	    'img_src': '',
	    'img_height': 0,
	    'img_width': 0,
	    'background-color': 'white',
	    'opacity': 0.7
	};

	if (options) {
	    $.extend(settings, options);
	}

	if (0 >= settings.img_width) {
	    settings.img_width = settings.img_height;
	}

	// create our elements

	$loading_img = $('<img>')
	    .attr('width', settings.img_width)
	    .attr('height', settings.img_height)
	    .attr('src', settings.img_src);
	$loading = $('<div>')
	    .css({
		'position': 'absolute',
		'background-color': settings['background-color'],
		'opacity': settings.opacity,
		'text-align': 'center',
		'display': 'none',
		'z-index': '10'
	    })
	    .append($loading_img);
	$('body').append($loading);

	$data = {'loading': $loading, 'loading_img': $loading_img, 'settings': settings};

	$this.data('loading_on_submit', $data);

	// bind on submit

	$this.bind('submit', function(e) {
	    show_loading($data);
	});

	return this;
    };
}(jQuery));
