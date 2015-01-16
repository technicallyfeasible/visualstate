/*!
 * jquery.visualstate.js v0.6.0
 * Copyright 2015 Jens Elstner
 * Released under MIT license
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(["jquery"], factory);
    } else {
        // Browser globals (root is window)
        factory(jQuery);
  }
}(this, function ($) {
	var c_vstate = "vstate-";
	var c_all = "-$all";
	var c_vis = "vis-";
	
	var visualStates = {};
	
	/**
	 * get the current visual state
	 */
	var get = function($parent, prefix) {
			return $parent.data(c_vstate + (prefix || ''));
	};

	/**
	 * Toggle the state between the two given states
	 */
	var toggle = function($parent, prefix, state1, state2) {
		var cur = get($parent, prefix);
		if (cur === state1)
			set($parent, prefix, state2);
		else
			set($parent, prefix, state1);
	};
	
	/**
	 * Apply the visual options. If reverse is true then apply the reverse of options.
	 */
	var applyVisual = function($element, options, reverse) {
		if (!options) return;

		var ops = options.split(',');
		for (var i = 0; i < ops.length; i++) {
			var parts = ops[i].split(':');
			switch(parts[0]) {
				case "addClass":
					(reverse ? $element.removeClass(parts[1].trim()) : $element.addClass(parts[1].trim()));
					break;
				case "removeClass":
					(reverse ? $element.addClass(parts[1].trim()) : $element.removeClass(parts[1].trim()));
					break;
			}
		}
	};

	/**
	 * Set the state as the current visual for context. Uses document as context when empty.
	 */
	var set = function ($parent, prefix, state, context) {
		if (!state) state = "";
		var cur = ($parent.data(c_vstate + prefix) || "");
		var pstate = prefix + '-' + state;
		var targetTrans = visualStates[pstate];
		// try to call update if state is the same
		if (cur === state) {
			var func = targetTrans && targetTrans["$update"];
			if (typeof func === "function")
				func.apply(targetTrans, [$parent, context]);
			return;
		}

		var pcur = prefix + '-' + cur;
		
		// find transition from 'cur' for 'state'
		var func = targetTrans && targetTrans[pcur];
		if (typeof func === "function")
			func.apply(targetTrans, [$parent, context]);
		// check for special target state value $all
		func = visualStates[prefix + c_all] && visualStates[prefix + c_all][pcur];
		if (typeof func === "function")
			func.apply(visualStates[prefix + c_all], [$parent, context]);
		// check for special source state value $all
		func = targetTrans && targetTrans[prefix + c_all];
		if (typeof func === "function")
			func.apply(targetTrans, [$parent, context]);

		// find elements with state instructions
		var context = this;
		$parent.find("[data-" + c_vis + pcur + "],[data-" + c_vis + pstate + "]").each(function(i, o) {
			var $o = $(o);
			// parse the data values
			var dataCur = $o.data(c_vis + pcur);
			var dataNew = $o.data(c_vis + pstate);
			applyVisual($o, dataCur, true);
			applyVisual($o, dataNew);
		});
		// remove state property when state is the empty state
		if (state === (prefix + "-"))
		{
			$parent.removeAttr("data-" + c_vstate + prefix);
			$parent.removeData(c_vstate + prefix);
		}
		else
			$parent.data(c_vstate + prefix, state);
	};

	
	/**
	 * Plugin base
	 * Call with:
	 * 1 parameter: return current states for prefix
	 * 2 parameter: set current state to parameter value
	 * 3 parameters: toggle current state between both values
	 */
	$.fn.visualstate = function(prefix, state1, state2) {
		// if called without parameters then return current state
		if (typeof(state1) === "undefined")
			return get(this, prefix);
		else if (typeof(state2) !== "string")
			// if state2 is no string then it is context
			set(this, prefix, state1, state2);
		else
			toggle(this, prefix, state1, state2);
	};
	
	/**
	 * Register the visual states given in "visual".
	 * If "apply" is truthy then also applies any of the new visual states for all elements on the page.
	 */
	$.fn.visualstate.register = function(visual, apply) {
		if (!visual) return;
		visualStates = $.extend(true, visualStates || {}, visual);
		if (apply) {
			// find prefixes that were just registered
			var prefixes = [], prefix, state;
			for (state in visual) {
				prefix = state.split('-')[0];
				if (prefixes.indexOf(prefix) == -1)
					prefixes.push(prefix);
			}
			for (var i = 0; i < prefixes.length; i++) {
				prefix = prefixes[i];
				$(document).find("[data-" + c_vstate + prefix + "]").each(function(i, o) {
					var $o = $(o);
					var state = $o.data(c_vstate + prefix);
					$o.removeAttr("data-" + c_vstate + prefix);
					$o.removeData(c_vstate + prefix);
					set($o, prefix, state);
				});
			}
		}
	};
	
    return $.fn.visualstate;
}));
