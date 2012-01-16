/*
---
description: native css animations.

license: MIT-style

authors:
- Thierry Bela

credits:
- amadeus (CSSEvents)
- André Fiedler, eskimoblood (Fx.Tween.CSS3)

requires:
core/1.3:
- Array
- Element.Style
- Fx.CSS

provides: [FxCSS]

...
*/

!function (context) {
"use strict";

	var set = Element.prototype.setStyle,
		get = Element.prototype.getStyle,
		//vendor = '',
		div = new Element('div'),
		prefix = Browser.safari || Browser.chrome || Browser.Platform.ios ? 'webkit' : (Browser.opera ? 'o' : (Browser.ie ? 'ms' : '')),
		prefixes = ['Khtml','O','Ms','Moz','Webkit'],
		cache = {};
			
	Element.implement({

		getPrefixed: function (prop) {  
		
			prop = prop.camelCase();
			
			if(cache[prop] != undefined) return cache[prop];
			
			cache[prop] = prop;
		
			//return unprefixed property if supported. prefixed properties sometimes do not work fine (MozOpacity is an empty string in FF4)
			if(!(prop in this.style)) {
				
				var upper = prop.charAt(0).toUpperCase() + prop.slice(1); 
				
				for(var i = prefixes.length; i--;) if(prefixes[i] + upper in this.style) {
				
					cache[prop] = prefixes[i] + upper; 
					break
				}	
			}
					
			return cache[prop]
		},  
		
		setStyle: function (property, value) {

			return set.call(this, this.getPrefixed(property), value);
		},
		getStyle: function (property) {

			return get.call(this, this.getPrefixed(property));
		}
	});

	//eventTypes
	['transitionStart', 'transitionEnd', 'animationStart', 'animationIteration', 'animationEnd' /* */].each(function(eventType) {

		Element.NativeEvents[eventType.toLowerCase()] = 2;

		var customType = eventType;
		
		if (prefix) customType = prefix + customType.capitalize();
		else customType = customType.toLowerCase();

		Element.NativeEvents[customType] = 2;
		Element.Events[eventType.toLowerCase()] = {base: customType }
		
	});
	
	//detect if transition property is supported
	Fx.css3Transition = (function (prop) {
	
		//
		if(prop in div.style) return true;
		
		var prefixes = ['Khtml','O','ms','Moz','Webkit'], upper = prop.charAt(0).toUpperCase() + prop.slice(1); 
		
		for(var i = prefixes.length; i--;) if(prefixes[i] + upper in div.style) return true; 
				
		return false
	})('transition');
	
	Fx.transitionTimings = {
		'linear'		: '0,0,1,1',
		'expo:in'		: '0.71,0.01,0.83,0',
		'expo:out'		: '0.14,1,0.32,0.99',
		'expo:in:out'	: '0.85,0,0.15,1',
		'circ:in'		: '0.34,0,0.96,0.23',
		'circ:out'		: '0,0.5,0.37,0.98',
		'circ:in:out'	: '0.88,0.1,0.12,0.9',
		'sine:in'		: '0.22,0.04,0.36,0',
		'sine:out'		: '0.04,0,0.5,1',
		'sine:in:out'	: '0.37,0.01,0.63,1',
		'quad:in'		: '0.14,0.01,0.49,0',
		'quad:out'		: '0.01,0,0.43,1',
		'quad:in:out'	: '0.47,0.04,0.53,0.96',
		'cubic:in'		: '0.35,0,0.65,0',
		'cubic:out'		: '0.09,0.25,0.24,1',
		'cubic:in:out'	: '0.66,0,0.34,1',
		'quart:in'		: '0.69,0,0.76,0.17',
		'quart:out'		: '0.26,0.96,0.44,1',
		'quart:in:out'	: '0.76,0,0.24,1',
		'quint:in'		: '0.64,0,0.78,0',
		'quint:out'		: '0.22,1,0.35,1',
		'quint:in:out'	: '0.9,0,0.1,1'
	};
	
	context.FxCSS = {

		Binds: ['stop'],
		css: false,
		locked: false,
		running: false,
		initialize: function(element, options) {

			this.element = this.subject = document.id(element);
			this.parent(Object.append({transition: 'sine:in:out'}, options));
			this.events = {transitionend: this.stop}
		},

		isRunning: function () {
		
			//if(this.css) return this.css;
			
			return this.css || this.parent() || false
		},
		
		createStyle: function (styles, className, cssText) {
		
			//console.log(arguments)
		
			var style = document.createElement('style'), 
				styleString = cssText || '',
				tmp = div.clone(false);
			
			tmp.style.cssText = '';
			
			Object.each(styles, function (value, key) { tmp.setStyle(key, value) });
			
			styleString =  '.' + className + '{' + styleString + tmp.style.cssText.split(';').map(function (value) { if(value.trim() != '') return value.replace(' !important', '') + ' !important' }).join(';') + '}';
			
			if(style.textContent != undefined) style.textContent = styleString;
			else style.styleSheet.cssText = styleString;
			
			//console.log(styleString)
			return style
		},
		
		stop: function () {

			if(this.css) {

				console.log('stop')
				
				this.element.removeEvents(this.events).style[this.element.getPrefixed('transition')] = '';
				this.fireEvent('complete', this.subject);
				
				if (!this.callChain()) this.fireEvent('chainComplete', this.subject);

				this.css = false;
				
				return this
			}

			return this.parent()
		},

		cancel: function() {

			if (this.css) {
		
				this.css = false;
				this.element.removeEvents(this.events).style[this.element.getPrefixed('transition')] = '';
				return this.fireEvent('cancel', this.subject).clearChain();
			}

			return this.parent()
		}
	}

}(this);
