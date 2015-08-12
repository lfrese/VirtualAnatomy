// JavaScript Document

        var canvas;
        var context;
        var canvasWidth = 792;
        var canvasHeight = 486;
        var drawingAreaX = 0;
        var drawingAreaY = 0;
        var drawingAreaWidth = 200;
        var drawingAreaHeight = 486;
        var padding = 25;
        var lineWidth = 8;
        var colorPurple = "#cb3594";
        var colorGreen = "#659b41";
        var colorYellow = "#ffcf33";
        var colorBrown = "#986928";
        var curColor = colorPurple;
        var clickColor = new Array();
        var paint = false;
        var clickX = new Array();
        var clickY = new Array();
        var clickDrag = new Array();
        var clickSize = new Array();
        var curSize = "normal";
        var clickTool = new Array();
        var curTool = "marker";
		var backgroundImage = new Image();
        backgroundImage.src = "./Images/head.png";
		var pan = false;

        var totalLoadResources = 1;
        var curLoadResNum = 0;

        $(document).ready(function () {
            prepareCanvas();
        });

        function prepareCanvas() {
            var canvasDiv = document.getElementById('canvasDiv');
            canvas = document.createElement('canvas');
            canvas.setAttribute('width', canvasWidth);
            canvas.setAttribute('height', canvasHeight);
            canvas.setAttribute('id', 'canvas');
            //canvas.setAttribute('style', 'background-image:url('+backgroundImage+');');
            canvasDiv.appendChild(canvas);
            if (typeof G_vmlCanvasManager != 'undefined') {
                canvas = G_vmlCanvasManager.initElement(canvas);
            }
            context = canvas.getContext("2d");	
			backgroundImage.onload = function(){
				context.drawImage(backgroundImage,0,0);   
			}
            trackTransforms(context);

        /**
        * Calls the redraw function after all neccessary resources are loaded.
        */
        function resourceLoaded() {
            if (++curLoadResNum >= totalLoadResources - 1) {
                redraw();
            }
        }

        $('#canvas').mousedown(function (e) {
            var mouseX = e.pageX - this.offsetLeft;
            var mouseY = e.pageY - this.offsetTop;
            paint = true;
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
            redraw();
        });

        $('#canvas').mousemove(function (e) {
            if (paint) {
                addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
                redraw();
            }
        });

        $('#canvas').mouseup(function (e) {
            paint = false;
        });

        $('#canvas').mouseleave(function (e) {
            paint = false;
        });

        $('#choosePurple').mousedown(function (e) {
            curColor = colorPurple;
        });
        $('#chooseGreen').mousedown(function (e) {
            curColor = colorGreen;
        });
        $('#chooseYellow').mousedown(function (e) {
            curColor = colorYellow;
        });
        $('#chooseBrown').mousedown(function (e) {
            curColor = colorBrown;
        });
        $('#chooseSmall').mousedown(function (e) {
            curSize = "small";
        });
        $('#chooseNormal').mousedown(function (e) {
            curSize = "normal";
        });
        $('#choose').mousedown(function (e) {
            curSize = "large";
        });
        $('#chooseHuge').mousedown(function (e) {
            curSize = "huge";
        });
        
        $('#chooseMarker').mousedown(function (e) {
            curTool = "marker";
            redraw();
        });
        $('#chooseEraser').mousedown(function (e) {
            curTool = "eraser";
        });

        $('#clearCanvas').mousedown(function (e) {
            clickX = new Array();
            clickY = new Array();
            clickDrag = new Array();
            clickColor = new Array();
            clearCanvas();
			context.drawImage(backgroundImage,0,0);
        });
		
		//handle pan
		
		if(pan){
			var lastX=canvas.width/2, lastY=canvas.height/2;
			var dragStart,dragged;
			canvas.addEventListener('mousedown',function(evt){
				document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
				lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
				lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
				dragStart = context.transformedPoint(lastX,lastY);
				dragged = false;
			},false);
			canvas.addEventListener('mousemove',function(evt){
				lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
				lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
				dragged = true;
				if (dragStart){
					var pt = context.transformedPoint(lastX,lastY);
					context.translate(pt.x-dragStart.x,pt.y-dragStart.y);
					redraw();
				}
			},false);
			canvas.addEventListener('mouseup',function(evt){
				dragStart = null;
				if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
			},false);
		}
		
		//handle zoom
		var scaleFactor = 1.032;
		var scrollnum = 0;
		$(window).bind('mousewheel DOMMouseScroll', function(event){
		    var clicks = event.originalEvent.wheelDelta ? event.originalEvent.wheelDelta/40 : event.originalEvent.detail ? -event.originalEvent.detail : 0;
			scrollnum += event.originalEvent.wheelDelta/120;
			var backgroundsize = 100 + scrollnum*10;
			if(backgroundsize >= 100){			
				
				var pt = context.transformedPoint(lastX,lastY);
				context.translate(pt.x,pt.y);
				var factor = Math.pow(scaleFactor,clicks);		
				backgroundsize = 100 + Math.abs(((1-factor)*100))*scrollnum;
				//alert(backgroundsize);
				context.scale(factor,factor);
				context.translate(-pt.x,-pt.y);
				redraw();
				//$("canvas").css("background-size",backgroundsize+"%");
				//context.restore();
			}
			else{
				scrollnum = 0;
			}
		});

	
		
		function trackTransforms(ctx){
			var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
			var xform = svg.createSVGMatrix();
			ctx.getTransform = function(){ return xform; };
			
			var savedTransforms = [];
			var save = ctx.save;
			ctx.save = function(){
				savedTransforms.push(xform.translate(0,0));
				return save.call(ctx);
			};
			var restore = ctx.restore;
			ctx.restore = function(){
				xform = savedTransforms.pop();
				return restore.call(ctx);
			};
	
			var scale = ctx.scale;
			ctx.scale = function(sx,sy){
				xform = xform.scaleNonUniform(sx,sy);
				return scale.call(ctx,sx,sy);
			};
			var rotate = ctx.rotate;
			ctx.rotate = function(radians){
				xform = xform.rotate(radians*180/Math.PI);
				return rotate.call(ctx,radians);
			};
			var translate = ctx.translate;
			ctx.translate = function(dx,dy){
				xform = xform.translate(dx,dy);
				return translate.call(ctx,dx,dy);
			};
			var transform = ctx.transform;
			ctx.transform = function(a,b,c,d,e,f){
				var m2 = svg.createSVGMatrix();
				m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
				xform = xform.multiply(m2);
				return transform.call(ctx,a,b,c,d,e,f);
			};
			var setTransform = ctx.setTransform;
			ctx.setTransform = function(a,b,c,d,e,f){
				xform.a = a;
				xform.b = b;
				xform.c = c;
				xform.d = d;
				xform.e = e;
				xform.f = f;
				return setTransform.call(ctx,a,b,c,d,e,f);
			};
			var pt  = svg.createSVGPoint();
			ctx.transformedPoint = function(x,y){
				pt.x=x; pt.y=y;
				return pt.matrixTransform(xform.inverse());
			}
		}
		
		
    } //end
        function addClick(x, y, dragging) {
            clickX.push(x);
            clickY.push(y);
            clickDrag.push(dragging);
            clickTool.push(curTool);
            if (curTool == "eraser") {
                clickColor.push("#ffffff");
            } else {
                clickColor.push(curColor);
            }
            clickSize.push(curSize);
        }

        function redraw() {
            // Make sure required resources are loaded before redrawing
            //if (curLoadResNum < totalLoadResources) { return; }
            
            clearCanvas();
			context.drawImage(backgroundImage,0,0);   
			
            var radius;
            context.strokeStyle = "#df4b26";
            context.lineJoin = "round";

            for (var i = 0; i < clickX.length; i++) {
                if (clickSize[i] == "small") {
                    radius = 2;
                } else if (clickSize[i] == "normal") {
                    radius = 5;
                } else if (clickSize[i] == "large") {
                    radius = 10;
                } else if (clickSize[i] == "huge") {
                    radius = 20;
                }
                
                context.beginPath();
                if (clickDrag[i] && i) {
                    context.moveTo(clickX[i - 1], clickY[i - 1]);
                } else {
                    context.moveTo(clickX[i] - 1, clickY[i]);
                }
                context.lineTo(clickX[i], clickY[i]);
                context.closePath();
                context.strokeStyle = clickColor[i];
                context.lineWidth = radius;
                context.stroke();
            }

            context.globalAlpha = 1;
            
            
        }

        function clearCanvas() {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
        }