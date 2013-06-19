/*
 * @author Ian Maffett
 * @copyright Intel 2012
 * @desc - Range slider for jqMobi apps
 */


/**
 *
   af.range.js replicates the HTML5 range input for mobile apps.
   This is based on https://github.com/ubilabs/mobile-range-slider
   but adapted for App Framework
   ```
    $("#slider1").range({min:1,max:20,val:10,stepFunc(val){}});
   ```
   *@param {Object} [options]
   *@title $().range([options]);
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
		this.pointer.addEventListener('mousedown', function() {
			console.log('mousedown');
		}, true);
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
//            this.pointer.addEventListener("touchmove", this);
//            this.pointer.addEventListener("touchend", this);

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
                var
                pointerW = this.pointer.offsetWidth,
                    rangeW = this.range.offsetWidth,
                    range = this.max - this.min,
                    width = rangeW - pointerW,
                    position = Math.round((val - this.min) * width / range, 10);
                $(this.bubble).cssTranslate(position + "px,0");
                $(this.pointer).cssTranslate(position + "px,0");


            }
            this.rangeFill.style.width = position + "px";

            this.bubble.innerHTML = val;
            this.value = val;
            this.stepFunc(val);
        }
    };

	var interval = function() {
		interval.super.apply(this, arguments);
		return this;
	}

	!function() {
		var f = function() {};
		f.prototype = range.prototype;
		var F = new f();
		interval.prototype = F;
		interval.prototype.constructor = interval;
		interval.super = range;
	}();

	interval.prototype.val = function(val, position) {
		console.log('interval.val(' + this.name + ')', val);
		if (val === undefined)
			return this.value;

		val = Math.min(val, this.max);
		val = Math.max(val, this.min);
		if (position === undefined) {
			var
			pointerW = this.pointer.offsetWidth,
				rangeW = this.range.offsetWidth,
				range = this.max - this.min,
				width = rangeW - pointerW,
				position = Math.round((val - this.min) * width / range, 10);
			$(this.bubble).cssTranslate(position + "px,0");
			$(this.pointer).cssTranslate(position + "px,0");


		}
		//this.rangeFill.style.width = position + "px";


		this.bubble.innerHTML = val;
		this.value = val;
		this.stepFunc(val);
	};


    $.fn.interval = function(opts) {
        if (this.length === 0) return;
        if (opts === undefined)
            return rangeCache[this[0].rangeID];
        for (var i = 0; i < this.length; i++) {
            //Assign a jqid for the cache in case they don't have an id on the elements
            if (!this[i].rangeID)
                this[i].rangeID = $.uuid();
            //rangeCache[this[i].rangeID] = new range(this[i], opts);
			var first = new interval(this[i], {
					name: 'first',
					value: 10
				}),
				second = new interval(this[i], {
					name: 'second',
					range: first.range,
					rangeFill: first.rangeFill,
					value: 20
				});

                var
                pointerW = first.pointer.offsetWidth,
                    rangeW = first.range.offsetWidth,
                    range = first.max - first.min,
                    width = rangeW - pointerW,
                    position_left = Math.round((10 - first.min) * width / range, 10);

				console.log(pointerW, rangeW, range, width, position_left);


                var
                pointerW = second.pointer.offsetWidth,
                    rangeW = second.range.offsetWidth,
                    range = second.max - second.min,
                    width = rangeW - pointerW,
                    position_right = Math.round((20 - second.min) * width / range, 10);
				console.log(pointerW, rangeW, range, width, position_right);

				first.rangeFill.style.left=position_left + 'px';
				first.rangeFill.style.width=(position_right - position_left) + 'px';

        }
    };

})(jq);
