var ImgCanvas = function(canvas) {

    var self = this, 
    
	 draw_tool_select = document.querySelectorAll( '.story .drawtools > li' );
    this.canvas = canvas;
		
	for ( var i = 0, max = draw_tool_select.length; i < max; i++ ) {
	    
 	    drawing = draw_tool_select[i].addEventListener( 'click', function() {
			 
 			for ( var y = 0, max = draw_tool_select.length; y < max; y++ ) {
 			    var drawDisable = draw_tool_select[y];
 			    drawDisable.className = drawDisable.getAttribute( "data-drawtool");
 			}

 			this.className += " active";

 			drawing = this.getAttribute( "data-drawtool" );
			alert(drawing);
 	    });
 	};
	 
    this.context = canvas.getContext("2d");
    this.typeDraw = 'freehand';
    draw = this[this.typeDraw]();
    var mouseEvt = function(event) {
        if (event.offsetX || event.offsetX == 0) {
            event._x = event.offsetX;
            event._y = event.offsetY;
        }
    
        var func =  draw[event.type];
        if (func) {
            func(event);
        }
    };
    
    this.canvas.addEventListener('mousedown', mouseEvt, false);
    this.canvas.addEventListener('mousemove',  mouseEvt, false);
    this.canvas.addEventListener('mouseup',  mouseEvt, false);
}


ImgCanvas.prototype = {
    
    setBackground : function(background) {

        var self = this;

        if (!background) {
            background = this.canvas.toDataURL("image/png");
        }

        self.background = background;
        var image = new Image();
        image.src = background;
        image.onload = function() {
            self.context.drawImage(
                image, 
                0, 
                0, 
                self.canvas.getAttribute("width").replace("px", ""), 
                self.canvas.getAttribute("width").replace("px", "") * image.height / image.width
            );
        }
    },
	 
	 rect : function() {
	 	
       var self = this;
       this.start = false;

       this._mousedown = function(event) {
           this.context.beginPath();
           this.context.moveTo(event._x, event._y);
			  
			  self.startx = event._x;
			  self.starty = event._y;
			 			  
           this.start = true;
       };

       this._mouseup = function(event) {
           if (!this.start) {
               return;
           }
			  self.stopx = event._x;
			  self.stopy = event._y;

			  this.context.lineWidth="5";
			  this.context.strokeStyle="red";			  
			  this.context.rect(self.startx, self.starty, self.stopx - self.startx, self.stopy - self.starty);
			  this.context.stroke();			  
           this._mousemove(event);
           this.start = false;
       };

       return {
           mousedown : function(event) {
               self._mousedown(event);
           },
           mousemove : function(event) {
               self._mousemove(event);
           },
           mouseup : function(event) {
               self._mouseup(event);
           }
       }
		 
	 },
	 
    freehand : function() {

        var self = this;
        this.start = false;

        this._mousemove = function(event) {
            if (!this.start) {
                return;
            }
            this.context.strokeStyle = "#ff0000"; 
            this.context.lineTo(event._x, event._y);
            this.context.stroke();
        };

        this._mousedown = function(event) {
            this.context.beginPath();
            this.context.moveTo(event._x, event._y);
            this.start = true;
        };

        this._mouseup = function(event) {
            if (!this.start) {
                return;
            }
            this._mousemove(event);
            this.start = false;
        };

        return {
            mousedown : function(event) {
                self._mousedown(event);
            },
            mousemove : function(event) {
                self._mousemove(event);
            },
            mouseup : function(event) {
                self._mouseup(event);
            }
        }
    },
	 
    getImg : function() {
        var dataURL = this.canvas.toDataURL("image/png");
        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    },
	 
    getDataUrl : function() {
        return this.canvas.toDataURL("image/png");
    }
}