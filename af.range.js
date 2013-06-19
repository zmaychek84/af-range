/*
 * @author Ian Maffett, Konstantin Likhter
 * @copyright Intel 2013
 * @desc - Range slider for jqMobi apps
 */


/**
 *
   af.range.js replicates the HTML5 range input for mobile apps.
   This is based on https://github.com/ubilabs/mobile-range-slider
   but adapted for App Framework
   ```
    $("#slider1").range({min:1,max:20,val:10,stepFunc(val){}});
	$("#slider2").interval({min:1, max: 20, val: {
		left: 5,
		right: 15
	}, stepFunc(val) {} });
   ```
   *@param {Object} [options]
   *@title $().range([options]);
   *@title $().interval([options]);
   */
(function($) {

    var rangeCache = {};
    window.rangeCache = rangeCache;
    /**
     * This creates a range object or retrieves it from the cache
     */
    $.fn.range = function(opts) {
        if (this.length === 0) return;
        if (opts === undefined)
            return rangeCache[this[0].rangeID];
        for (var i = 0; i < this.length; i++) {
            //Assign a jqid for the cache in case they don't have an id on the elements
            if (!this[i].rangeID)
                this[i].rangeID = $.uuid();
            rangeCache[this[i].rangeID] = new range(this[i], opts);
        }
    };

    var range = function(elem, opts) {
        var that = this;
        this.elem = elem;
        $(elem).bind('destroy', function() {
            var id = that.elem.rangeID;
            if (rangeCache[id]) delete rangeCache[id];
        });

		for (var j in opts) {
            this[j] = opts[j];
        }

		if (!this.pointer) {
			this.pointer = $("<div class='" + this.pointerClass + "'></div>").get(); //round pointer we drag
		}
		if (!this.range) {
	        this.range = $("<div class='" + this.rangeClass + "'></div>").get(); //range that we drag on
		}
		if (!this.rangeFill) {
			this.rangeFill = $("<div class='" + this.rangeFillClass + "'></div>").get(); //range fill to the left
		}
		if (!this.bubble) {
	        this.bubble = $("<div class='" + this.bubbleClass + "'></div>").get(); //bubble above showing the value
		}
        this.pointer.style.webkitTransitionDuration = "0ms";
        this.elem.appendChild(this.pointer);
        this.elem.appendChild(this.range);
        this.elem.appendChild(this.rangeFill);
        this.elem.appendChild(this.bubble);
        if (this.elem.style.position === "static")
            this.elem.style.position = "relative";

        

        if (opts['value'])
            this.val(opts['value']);

        this.elem.addEventListener("touchstart", this);
        //this.pointer.addEventListener("touchstart", this);

		this.elem._afRange = true;

        return this;
    };

    range.prototype = {
        min: 1,
        max: 100,
        value: 0,
        rangeClass: "range",
        pointerClass: "pointer",
        sliderClass: "slider",
        rangeFillClass: "rangefill",
        bubbleClass: "rangeBubble",
        stepFunc: function() {},
        handleEvent: function(evt) {
			if (evt.target != this.pointer && this.pointer != this.elem._afLastDragged) {
				return;
			}
			if (evt.target == this.pointer) {
				this.elem._afLastDragged = this.pointer;
			}
            switch (evt.type) {
                case "touchstart":
                    this.onTouchStart(evt);
                    break;
                case "touchmove":
                    this.onTouchMove(evt);
                    break;
                case "touchend":
                    this.onTouchEnd(evt);
                    break;
            }
        },
        onTouchStart: function(event) {
            var that = this;
            this.elem.addEventListener("touchmove", this);
            this.elem.addEventListener("touchend", this);

        },
        onTouchMove: function(event) {
            event.preventDefault();

            var position = event.touches[0].pageX,
                element,
                pointerW = this.pointer.offsetWidth,
                rangeW = this.range.offsetWidth,
                width = rangeW - pointerW,
                range = this.max - this.min,
                value;

            position -= $(this.elem).offset().left;

            position += pointerW / 2;
            position = Math.min(position, rangeW);
            position = Math.max(position - pointerW, 0);
            $(this.bubble).cssTranslate(position + "px,0");
            $(this.pointer).cssTranslate(position + "px,0");

            // update
            value = this.min + Math.round(position * range / width);
            this.val(value, position);
        },
        onTouchEnd: function(event) {

            this.elem.removeEventListener("touchmove", this, true);
            this.elem.removeEventListener("touchend", this, true);
        },
        val: function(val, position) {
            if (val === undefined)
                return this.value;

            val = Math.min(val, this.max);
            val = Math.max(val, this.min);
            if (position === undefined) {
				var position = this.getPosition(val);
                $(this.bubble).cssTranslate(position + "px,0");
                $(this.pointer).cssTranslate(position + "px,0");


            }
            this.rangeFill.style.width = position + "px";

            this.bubble.innerHTML = val;
            this.value = val;
            this.stepFunc(val);
        },

		getPosition: function(val) {
			var
				value = val || this.value,
				pointerW = this.pointer.offsetWidth,
				rangeW = this.range.offsetWidth,
				range = this.max - this.min,
				width = rangeW - pointerW,
				position = Math.round((value - this.min) * width / range, 10);

			return position;
		}
    };

	/** @constructor */
	var intervalSelector = function() {
		intervalSelector.super.apply(this, arguments);
		return this;
	}

	// extend intervalSelector from range
	!function() {
		var f = function() {};
		f.prototype = range.prototype;
		var F = new f();
		intervalSelector.prototype = F;
		intervalSelector.prototype.constructor = intervalSelector;
		intervalSelector.super = range;
	}();

	intervalSelector.prototype.val = function(val, position, dontFire) {
		if (val === undefined)
			return this.value;

		val = Math.min(val, this.max);
		val = Math.max(val, this.min);
		if (position === undefined) {
			var position = this.getPosition(val);

			$(this.bubble).cssTranslate(position + "px,0");
			$(this.pointer).cssTranslate(position + "px,0");

		}
		//this.rangeFill.style.width = position + "px";


		this.bubble.innerHTML = val;
		this.value = val;

		//this.stepFunc(val);
		if (!dontFire) {
			this.stepFunc(position, val);
		}
	};

	/** @constructor */
	var interval = function(el, opts) {
		var that = this;

		this.stepFunc = opts.stepFunc || function() { };
		delete opts.stepFunc;

		// configs for first and second intervalSelectors 
		var cfg = {}, firstCfg = {}, secondCfg = {};
		$.extend(cfg, this.defaultRangeConfig, opts);
		$.extend(firstCfg, cfg, {
			value: opts.value.left,
			stepFunc: this.rangeStepFunc.bind(this)
		});
		$.extend(secondCfg, cfg, {
			value: opts.value.right,
			stepFunc: this.rangeStepFunc.bind(this)
		});

		// create first range
		this.first = new intervalSelector(el, firstCfg);
		// using the same range and rangeFill objects
		$.extend(secondCfg, {
			range: this.first.range,
			rangeFill: this.first.rangeFill
		});
		// create second range
		this.second = new intervalSelector(el, secondCfg);

		// set rangeFill position
		var firstPos = this.first.getPosition(),
			secondPos = this.second.getPosition();

		this.first.rangeFill.style.left = firstPos + 'px';
		this.first.rangeFill.style.width = (secondPos - firstPos) + 'px';
	};

	interval.prototype = { 
		
		defaultRangeConfig: {
			min: 1,
			max: 100,
			value: 0,
			rangeClass: "range",
			pointerClass: "pointer",
			sliderClass: "slider",
			rangeFillClass: "rangefill",
			bubbleClass: "rangeBubble"
		},

		stepFunc: function() { },

		rangeStepFunc:  function(pos, val) {
			if (!this.first || !this.second) { 
				return;
			}

			var firstPos = this.first.getPosition(),
				secondPos = this.second.getPosition(),
				isFirstLeft = firstPos < secondPos,
				leftPos = isFirstLeft ? firstPos : secondPos,
				rightPos = isFirstLeft ? secondPos : firstPos;

			this.first.rangeFill.style.left = leftPos + 'px';
			this.first.rangeFill.style.width = (rightPos - leftPos) + 'px';

			this.stepFunc(this.val());
		},

		val: function(val) {
			if (val === undefined) {
				return {
					left: Math.min(this.first.val(), this.second.val()),
					right: Math.max(this.first.val(), this.second.val())
				};
			} else {
				if (typeof val.left !== 'number' || typeof val.right !== 'number') {
					throw new TypeError('interval.set incorret value passed');
				}
				// first one should not fire the stepFunc event
				this.first.val(val.left, undefined, true);
				this.second.val(val.right);
			}
		}
	};

    $.fn.interval = function(opts) {
        if (this.length === 0) return;
        if (opts === undefined)
            return rangeCache[this[0].rangeID];
        for (var i = 0; i < this.length; i++) {
            //Assign a jqid for the cache in case they don't have an id on the elements
            if (!this[i].rangeID)
                this[i].rangeID = $.uuid();

			rangeCache[this[i].rangeID] = new interval(this[i], opts);
		}
		return this;
	};

})(jq);
