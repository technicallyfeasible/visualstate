(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(["jquery"], factory);
    } else {
        // Browser globals (root is window)
        factory(jQuery);
  }
}(this, function ($) {
	var priv = {
		visualStates: {},
		/**
		 * get the current visual state
		 */
		get: function($parent, prefix) {
    			return $parent.data("vstate-" + (prefix || ''));
		},

		/**
		 * Toggle the state between the two given states
		 */
		toggle: function($parent, prefix, state1, state2) {
			var cur = this.get($parent, prefix);
			if (cur === state1)
				this.set($parent, prefix, state2);
			else
				this.set($parent, prefix, state1);
		},
		
		/**
		 * Set the state as the current visual for context. Uses document as context when empty.
		 */
		set: function ($parent, prefix, state) {
			if (!state) state = "";
			var cur = ($parent.data("vstate-" + prefix) || "");
			// nothing to do if same state
			if (cur === state)
				return;

			var pcur = prefix + '-' + cur;
			var pstate = prefix + '-' + state;
			
			// check for defined visual functions
			if (!priv.visualStates)
				priv.visualStates = {};
			// find transition from 'cur' for 'state'
			var func = priv.visualStates[pstate] && priv.visualStates[pstate][pcur];
			if (typeof func === "function")
				func($parent);
			// check for special target state value $all
			func = priv.visualStates[prefix + "-$all"] && priv.visualStates[prefix + "-$all"][pcur];
			if (typeof func === "function")
				func($parent);
			// check for special source state value $all
			func = priv.visualStates[pstate] && priv.visualStates[pstate][prefix + "-$all"];
			if (typeof func === "function")
				func($parent);

			// find elements with state instructions
			var context = this;
			$parent.find("[data-vis-" + pcur + "],[data-vis-" + pstate + "]").each(function(i, o) {
				var $o = $(o);
				// parse the data values
				var dataCur = $o.data("vis-" + pcur);
				var dataNew = $o.data("vis-" + pstate);
				priv.applyVisual($o, dataCur, true);
				priv.applyVisual($o, dataNew);
			});
			// remove state property when state is the empty state
			if (state === (prefix + "-"))
			{
				$parent.removeAttr("data-vstate-" + prefix);
				$parent.removeData("vstate-" + prefix);
			}
			else
				$parent.data("vstate-" + prefix, state);
		},
		/**
		 * Apply the visual options. If reverse is true then apply the reverse of options.
		 */
		applyVisual: function($element, options, reverse) {
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
		}
	}
	
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
			return priv.get(this, prefix);
		else if (typeof(state2) === "undefined")
			priv.set(this, prefix, state1);
		else
			priv.toggle(this, prefix, state1, state2);
	};
	
	/**
	 * Register the visual states given in "visual".
	 * If "apply" is truthy then also applies any of the new visual states for all elements on the page.
	 */
	$.fn.visualstate.register = function(visual, apply) {
		if (!visual) return;
		priv.visualStates = $.extend(priv.visualStates || {}, visual);
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
				$(document).find("[data-vstate-" + prefix + "]").each(function(i, o) {
					var $o = $(o);
					var state = $o.data("vstate-" + prefix);
					$o.removeAttr("data-vstate-" + prefix);
					$o.removeData("vstate-" + prefix);
					priv.set($o, prefix, state);
				});
			}
		}
	};
	
    return $.fn.visualstate;
}));
