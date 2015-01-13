# visualstate jQuery plugin
Allows you to define visual states to be used by elements on your page and makes switching between them easy. 
Use sophisticated view states without polluting the model with view code.

A demo can be found here:
[http://demos.technicallyfeasible.com/visualstate/](http://demos.technicallyfeasible.com/visualstate/)


## How it works
All view states are organized in groups and each element can only have one state of a particular group at any time but it can have different states from different groups.

Imagine two groups: __display__ with states __full__ and __compact__ and __theme__ with states __red__ and __blue__. 
Any element where you set a state can either be in the __full__ state or __compact__ state but not both at the same time. 

It can however be in the __display-compact__ state _and_ __theme-red__ state.


## Attribute based state definition
The simplest method of defining what happens with the dom in different states is by applying attributes to the element.

Syntax: data-vis-__group__-__state__="__action__"

Supported actions are currently __addClass__ (add a css class when entering the state) and __removeClass__ (remove a css class when entering the state).


## Javascript based state definition
If you need more control over what happens when an element is switched to another state (sophisticated animations for example) you can define javascript functions to handle state transitions. Javascript transitions must be registered with the plugin before they can be used.

	$.fn.visualstate.register({
		// compact target state
		"display-compact": {
			// full source state
			"display-full": function($p) {
				// $p is the jquery object for the parent element where the state is set
			}
		},
		// full target state
		"display-full": {
			// compact source state
			"display-compact": function($p) {
				// $p is the jquery object for the parent element where the state is set
			}
		}
	})

States are denoted by joining the group name and the state name with a dash (__group__-__state__).
Transitions are defined in a simple nested javascript object where the top level is the target state and 
the next deeper level is the source state and the function assigned to this property is executed for transitions from source to target.

Each of the transition functions get a single parameter $p which is the jquery object for the parent element where the state is set.


## Transition the state of an element
To transition an element to another state, simply use the .visualstate() function on it.

	// get the current visual state from the display group
	$element.visualstate("display");

	// set the current visual state from the display group to full
	$element.visualstate("display", "full");

	// toggle the visual state between compact and full
	$element.visualstate("display", "compact", "full");
