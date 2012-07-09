/**
 * Provide a "tags" form input, when the user can enter multiple tags and delete them in a natural way
 *
 * eg:
 * $('input[name=tags]').tagifier();
 *
 * Requires jquery-json >= 2.0 from http://code.google.com/p/jquery-json/
 */
(function($){
    "use strict";
    $.fn.tagifier = function(options) {
	var
	// the configuration
	settings,
	// the <input> element
	$this,
	// current tags list
	tags,
	// our index in the tag list, used for backspace quick deletion
	currentTagIndex,
	// the host <ul>
	$tags_host,
	// the dynamic <input> inside the <ul>
	$tags_input,
	// the default input size
	input_width_default,
	// our fake span to test text size
	$input_size_tester,
	// functions
	parse_value,
	tag_push,
	tag_pop,
	tag_find,
	update_value
	;

	// the input we are watching
	$this = $(this);

	// configuration object
	settings = {
	    // translations for messages can be provided here
	    str_prompt: 'Enter your tags here',
	    str_delete: 'Remove this tag',
	    str_edit: 'Edit this tag',
	    // do we allow the same tag twice ?
	    allow_duplicates: false,
	    // how long can a tag be
	    max_char_per_tag: 20,
	    // should be force tag on blur (if not, the user has to hit enter in the field to add the tag in the active list)
	    tagify_on_blur: true
	};

	if (options) {
	    $.extend(settings, options);
	}

	// read the value="" of the input and find tags in it
	parse_value = function () {
	    try {
		var tmp = $.parseJSON($this.val());
		$.each($.parseJSON($this.val()), function (idx, val) {
		    tag_push(val);
		});
	    } catch(e) {
	    }
	};

	// given a tag, find its index in our list or return false if not found
	tag_find = function (tag) {
	    for (var i in tags) {
		if (!isNaN(parseInt(i, 10))) {
		    if (tags[i] == tag) {
			return i;
		    }
		}
	    }
	    return false;
	};

	// push a new tag to the end
	tag_push = function (tag) {
	    tag = tag.substr(0, settings.max_char_per_tag);

	    if (!settings.allow_duplicates) {
		// if we don't want duplicated, make sure this tag doesn't exist yet, otherwise flash it and cancel
		var tag_index = tag_find(tag);

		if (tag_index !== false) {
		    $tags_host.find('li').eq(tag_index).fadeTo(300, 0.1, function() {
			$(this).fadeTo(300, 1);
		    });
		    return;
		}
	    }

	    // create the html

	    var $tag = $('<li title="' + settings.str_edit + '"><span>' + tag + '</span></li>');

	    var $close = $('<a title="' + settings.str_delete + '" href="#">x</a>');

	    $tag.prepend($close);

	    // put the tag in last, before our input

	    $tags_input.before($tag);

	    // handle the edit function
	    $tag.click(function(e) {
		e.preventDefault();

		var $li = $(this);

		$tags_input.val($li.find('span').text());

		tag_pop($li.prevAll('li').length);
	    });

	    // the delete button
	    $close.click(function(e) {
		e.preventDefault();
		e.stopPropagation();

		tag_pop($(this).parent().prevAll('li').length);
	    });

	    // add to our tag list and update the live index

	    tags.push(tag);

	    currentTagIndex++;

	    // make sure to keep our real input synchronized

	    update_value();
	};

	// remove the tag at index, if no index then remove the last one
	tag_pop = function(index) {
	    if (index == undefined) {
		index = currentTagIndex;
	    }

	    if (index < 0 && index >= currentTagIndex) { // nope, no tag there
		return;
	    }

	    tags.remove(index);

	    currentTagIndex--;

	    $tags_host.find('li').eq(index).remove();

	    update_value();
	};

	// update our input's value="" with the current tag list
	update_value = function() {
	    if (tags.length > 0) {
		$this.val(encodeURIComponent($.toJSON(tags)));
	    } else {
		$this.val('');
	    }
	};

	// initialize our tags list

	tags = [];
	tags.remove = function(from, to) {
	    var rest = this.slice((to || from) + 1 || this.length);
	    this.length = from < 0 ? this.length + from : from;
	    return this.push.apply(this, rest);
	};

	currentTagIndex = -1;

	input_width_default = $this.width();

	// create our "beautified" tag editor

	$tags_host = $('<ul class="tags_host"></ul>');
	$tags_input = $('<input type="text" class="target_input" autocomplete="off" />');

	$tags_input.width(input_width_default);

	$tags_host.append($tags_input);

	// we will use this to know what size to give to our magic input

	$input_size_tester = $('<span id="tagifier_dummy_size_tester"></span>');
	$input_size_tester.css({
	    'float': 'left',
	    'display': 'inline-block',
	    'position': 'absolute',
	    'left': -1000
	});
	$.each(['font-size', 'font-family', 'padding-left', 'padding-top', 'padding-bottom', 'padding-right', 'border-left', 'border-right', 'border-top', 'border-bottom', 'word-spacing', 'letter-spacing', 'text-indent', 'text-transform'], function (idx, val) {
	    $input_size_tester.css(val, $this.css(val));
	});

	$tags_host.append($input_size_tester);

	// insert our new tag editor

	$this.hide().after($tags_host);

	// if we don't click on a specific tag, just focus the magic input

	$tags_host.click(function(e) {
	    $tags_input.focus();
	});

	// handle our edition commands

	$tags_input
	    .attr('placeholder', settings.str_prompt)
	    .bind('tagify', function(e) {
		var val = $tags_input.val();
		if (val.length > 1) {
		    tag_push(val);
		    $tags_input.val('');
		}
	    })
	    .keypress(function(e) {
		var delims = [13, 10, 44, 59]; // enter, ctrl+enter, comma, semi-colon

		for (var i in delims) {
		    if (e.which == delims[i]) {
			e.preventDefault();
			$tags_input.trigger('tagify');
			return false;
		    }
		}

	    })
	    .keydown(function(e) {
		var val = $tags_input.val();

		// if backspace is hit with no input, remove the last tag
		if (e.which == 8) { // backspace
		    if (val == '') {
			e.preventDefault();
			tag_pop();
			return false;
		    }
		}
	    })
	    .bind('keydown keyup change paste', function(e) {
		// make sure to resize our magic input as needed
		$input_size_tester.text($tags_input.val());
		var c_size = $input_size_tester.width() + 25;
		$input_size_tester.text('');

		if (c_size > input_width_default) {
		    $tags_input.width(c_size);
		} else {
		    $tags_input.width(input_width_default);
		}
	    }).bind('keyup change paste', function(e) {
		var val = $tags_input.val();
		if (val.length > settings.max_char_per_tag) {
		    val = val.substr(0, settings.max_char_per_tag);
		    $tags_input.val(val);
		}
	    });

	// we're all done here, read the tag list and load it

	parse_value();

	// if asked for, register a tagify event when the form submits

	if (settings.tagify_on_blur) {
	    $tags_input.blur(function() {
		$tags_input.trigger('tagify');
	    });
	}

	// Todo: integrate some form of autocomplete (from jquery-ui ?)

	return this;
    };
}(jQuery));
