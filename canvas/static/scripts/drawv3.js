//------------------------------------------------------------------------------
function findPos(obj) 
{	
	var curleft = 0, curtop = 0;
	if (obj.offsetParent)
	{
		do
		{
		    curleft += obj.offsetLeft;
		    curtop += obj.offsetTop;
		}while (obj = obj.offsetParent);
		return { x: curleft, y: curtop };
	}
	return undefined;
};
//------------------------------------------------------------------------------
function CanvasPalette(canvasid, width)
{
	this.canvas = canvasid;
	this.context = this.canvas.getContext("2d");
	this.canvas.width = width;
	this.canvas.height = 64;
	this.buildColorPalette();
}
//------------------------------------------------------------------------------
CanvasPalette.prototype.buildColorPalette = function ()
{     
	var gradient = this.context.createLinearGradient(0, 0, this.canvas.width, 0);
	gradient.addColorStop(0, "rgb(255, 0, 0)");
	gradient.addColorStop(0.15, "rgb(255, 0, 255)");
	gradient.addColorStop(0.33, "rgb(0, 0, 255)");
	gradient.addColorStop(0.49, "rgb(0, 255, 255)");
	gradient.addColorStop(0.67, "rgb(0, 255, 0)");
	gradient.addColorStop(0.84, "rgb(255, 255, 0)");
	gradient.addColorStop(1, "rgb(255, 0, 0)");
	this.context.fillStyle = gradient;
	this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	gradient = this.context.createLinearGradient(0, 0, 0, this.canvas.height);
	gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
	gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
	gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
	gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
	this.context.fillStyle = gradient;
	this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

}
//------------------------------------------------------------------------------
CanvasPalette.prototype.getColor = function(x,y)
{	
	var imageData = this.context.getImageData(x, y, 1, 1);
	return 'rgba(' + imageData.data[0] + ', ' + imageData.data[1] + ', ' + imageData.data[2] + ',1)';
}
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
function DrawingCanvas(id)
{   	
	var div = document.getElementById(id);
	
	this.toolOptionsDiv = document.createElement('div');
	this.toolOptionsDiv.id = "toolOptionsDiv";
	div.appendChild(this.toolOptionsDiv);
	
	var div1 = document.createElement('div');
	div1.id = "mainDrawingDiv";
	div.appendChild(div1);
	
	this.canvas = document.createElement('canvas');
	this.canvas.id = "drawingArea";
	this.canvas.parent = this;
	this.context = this.canvas.getContext("2d");
       	this.context.save();
	this.canvas.height= 600;
	this.canvas.width = 800;
	div1.appendChild(this.canvas);
	
	this.toolDiv = document.createElement('div');
	this.toolDiv.id = "toolDiv";
	div1.appendChild(this.toolDiv);
	
	this.penlist= new Array();
//	this.undohistory = []; 
//	this.redohistory = new Array();
	this.eventHistory = new Array();
	this.eventIndex = -1;
	
	this.strokecolor = 'rgba(0,0,0,1)';
	this.fillcolor = "black";
	this.pensize = 10;
	this.tool = "pen";	
	this.fill = false;
	
	this.canvas.onmousedown = this.canvasOnMouseDown;
	this.canvas.onmousemove = this.canvasOnMouseMove;
	this.canvas.onmouseup = this.canvasOnMouseUp;
        this.canvas.addEventListener('mouseout', this.canvasOnMouseOut, false);
        this.canvas.addEventListener("mousewheel", this.canvasOnMouseWheel, false);

        this.img=null;
        this.zoom = 1,
        this.translateX = 0;
        this.translateY = 0;
        this.translateXTemp = 0;
        this.translateYTemp = 0;
        this.cx=0;
       	this.cy=0;
        this.buildToolMenu();
}
//------------------------------------------------------------------------------
DrawingCanvas.prototype.buildToolMenu = function()
{
	var self = this;
	var div = document.createElement('div');
		div.id = "loadImage";
		div.className = "icon";
		div.onclick=function(){self.tool = "loadImage"; self.buildToolOptions();};
		this.toolDiv.appendChild(div);
	
	div = document.createElement('div');
		div.id = "pen";
		div.className = "icon";
		div.onclick=function(){self.tool = "pen"; self.buildToolOptions();};
		this.toolDiv.appendChild(div);
	
	div = document.createElement('div');
		div.id = "moveimage";
		div.className = "icon";
		div.onclick=function(){self.tool = "moveimage"; self.buildToolOptions();};
		this.toolDiv.appendChild(div);
	div = document.createElement('div');
		div.id = "undo";
		div.className = "icon";
		div.onclick=function(){if(self.eventIndex>=0)self.eventIndex-=1;self.zooming();};
		this.toolDiv.appendChild(div);
	div = document.createElement('div');
		div.id = "redo";
		div.className = "icon";
		div.onclick=function(){if(self.eventIndex<self.eventHistory.length-1)self.eventIndex+=1;self.zooming();};
		this.toolDiv.appendChild(div);
	div = document.createElement('div');
		div.id = "coordinate";
		div.className = "icon";
		div.onclick=function(){
			console.log(self.eventHistory[self.eventIndex]);
			var data = self.eventHistory[self.eventIndex].list;
			var coorddata = '{"coords":[';
			for(var i=0;i<data.length;i++)
			{
				coorddata += '{"x":'+data[i][0]+',"y":'+data[i][1]+'},';
			}
			coorddata = coorddata.substring(0, coorddata.length - 1) + "]}";
			var json = JSON.parse(coorddata);

			console.log(json);

		};
		this.toolDiv.appendChild(div);
	this.xPos = document.createElement('div');
		this.xPos .id = "xPos";
		this.xPos .className = "icon";
		this.toolDiv.appendChild(this.xPos);
	this.yPos = document.createElement('div');
		this.yPos.id = "yPos";
		this.yPos.className = "icon";
		this.toolDiv.appendChild(this.yPos);
}
//------------------------------------------------------------------------------
DrawingCanvas.prototype.buildToolOptions = function()
{
	var self=this;
	while (this.toolOptionsDiv.lastChild) {
	    this.toolOptionsDiv.removeChild(this.toolOptionsDiv.lastChild);
	}
	if(this.tool=="loadImage")
	{
		var div = document.createElement('input');
		div.type="file";
		this.toolOptionsDiv.appendChild(div);
		function readImage() {console.log("read");
					self.context.restore();
					self.context.save();
					self.zoom=1;
					self.clearCanvas();
					self.eventIndex=-1;
					self.eventHistory=new Array();
					if ( this.files && this.files[0] )
					{
						var FR= new FileReader();
						FR.onload = function(e) {
								self.img = new Image();
								self.img.onload = function() {self.context.drawImage(self.img, 0, 0);};
								self.img.src = e.target.result;
						};
						FR.readAsDataURL( this.files[0] );
					}
				}
		div.addEventListener("change", readImage, false);
	}
	if(this.tool=="pen")
	{
		var div = document.createElement('canvas');
		var palete = new CanvasPalette(div, 256)
		div.onmousedown=function(e){
				var pos = findPos(this);
				var x = e.pageX - pos.x;
				var y = e.pageY - pos.y;
				self.strokecolor=palete.getColor(x,y);
				self.fillcolor=self.strokecolor.replace(/[^,]+(?=\))/, '0.25');
				};
		var div2 = document.createElement('input');
		div2.type="number";
		div2.id="strokeSize";
		div2.value=self.pensize;
		div2.onchange=function(){self.pensize = this.value;};
		
		var div3 = document.createElement('input');
		div3.type="checkbox";
		div3.id="fillarea";
		div3.checked=self.fill;
		div3.onchange=function(){self.fill = this.checked;};
		
		this.toolOptionsDiv.appendChild(div2);
		this.toolOptionsDiv.appendChild(div3);
		this.toolOptionsDiv.appendChild(div);

	}
}
//------------------------------------------------------------------------------
DrawingCanvas.prototype.canvasOnMouseDown = function(e)
{
	var pos = findPos(this);
	var x = e.pageX - pos.x;
	var y = e.pageY - pos.y;
//	this.parent.eventstart(x/this.parent.zoom, y/this.parent.zoom);
	this.parent.eventstart(x/this.parent.zoom-this.parent.translateX, y/this.parent.zoom-this.parent.translateY);
};
//------------------------------------------------------------------------------
DrawingCanvas.prototype.canvasOnMouseMove = function(e)
{
	var pos = findPos(this);
	var x = e.pageX - pos.x;
	var y = e.pageY - pos.y;
	this.parent.eventmove(x/this.parent.zoom-this.parent.translateX, y/this.parent.zoom-this.parent.translateY);
};
//------------------------------------------------------------------------------
DrawingCanvas.prototype.canvasOnMouseUp = function(e)
{
	var pos = findPos(this);
	var x = e.pageX - pos.x;
	var y = e.pageY - pos.y;
	this.parent.eventend(x/this.parent.zoom-this.parent.translateX, y/this.parent.zoom-this.parent.translateY);
};
//------------------------------------------------------------------------------
DrawingCanvas.prototype.canvasOnMouseOut = function(e)
{
	if(this.parent.tool=="text" || (this.parent.tool=="picture" && this.parent.drawPic) )
		this.parent.undo();
	this.parent.eventend();
};
//------------------------------------------------------------------------------
DrawingCanvas.prototype.canvasOnMouseWheel = function(e)
{
	self=this.parent;
	var pos = findPos(this);
	var x = e.pageX - pos.x;
	var y = e.pageY - pos.y;

	self.translateX-=(x-self.cx)/self.zoom;
	self.translateY-=(y-self.cy)/self.zoom;
	
	if(e.wheelDelta>0)
	{
		self.zoom*=2;		
	}
	if(e.wheelDelta<0 && self.zoom>1)
	{
		self.zoom/=2;
	}


	self.cx=x;
	self.cy=y;

	self.zooming();

};
//------------------------------------------------------------------------------
DrawingCanvas.prototype.zooming = function()
{
	this.context.restore();
	this.context.save();	
	this.clearCanvas();
	this.context.scale(this.zoom,this.zoom);
	this.context.translate(this.translateX+this.translateXTemp,this.translateY+this.translateYTemp);


	this.context.drawImage(this.img, this.cx/this.zoom, this.cy/this.zoom);
	for(i=0; i<=this.eventIndex; i++)
	{
		this.drawLine(this.eventHistory[i]);
	}
};
//------------------------------------------------------------------------------
DrawingCanvas.prototype.clearCanvas = function()
{


	this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
};
//------------------------------------------------------------------------------
DrawingCanvas.prototype.eventmove = function (x,y)
{
	this.xPos.innerHTML="X: "+(x-this.cx/this.zoom);
	this.yPos.innerHTML="Y: "+(y-this.cy/this.zoom);

	if(this.drawflag && this.tool=="pen")
	{
		this.context.strokeStyle = this.strokecolor;
		this.context.fillStyle = this.fillcolor;
	      	this.context.lineWidth = this.pensize;

		this.context.lineTo(x,y);
		this.context.stroke();
		this.oldx = x;
		this.oldy = y;
		this.drawflag=true;
		this.penlist.push([x-this.cx/this.zoom,y-this.cy/this.zoom]);
	}  
	if(this.drawflag && this.tool=="moveimage") 
	{
		this.translateXTemp=(x-this.penlist[0][0]);
		this.translateYTemp=(y-this.penlist[0][1]);
//		this.penlist[0][0]=x;
//		this.penlist[0][1]=y;
		this.zooming();
	}  	

};
//------------------------------------------------------------------------------
DrawingCanvas.prototype.eventstart = function(x,y)
{
	//e.preventDefault();  

	if(this.tool=="pen")
	{	
		//this.imgtmp = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		//this.undohistory.push(this.imgtmp);
		this.drawflag=true;
		this.context.lineCap = 'round';
		this.context.beginPath();
		this.context.moveTo(x, y);		
		this.penlist.push([x-this.cx/this.zoom,y-this.cy/this.zoom]);
		
	}
	if(this.tool=="moveimage")
	{

		this.drawflag=true;
		this.penlist.push([x,y]);
		this.translateXTemp = 0;
		this.translateYTemp = 0;
	}
};
//------------------------------------------------------------------------------
DrawingCanvas.prototype.eventend = function (x,y)
{

	if(this.drawflag)
	{
		if(this.tool=="pen")
		{
			if(this.fill)
			{
				this.context.closePath();
			}
			var event = {list:this.penlist.slice(), fillcolor:this.fillcolor, strokecolor:this.strokecolor, fill:this.fill, linewidth:this.pensize};
			this.drawLine(event);	
			this.eventHistory=this.eventHistory.splice(0,this.eventIndex+1);
			this.eventHistory.push(event);
			this.eventIndex++;
			this.penlist=new Array();
		}
		if(this.tool=="moveimage")
		{
			this.penlist=[];
			this.translateX+=this.translateXTemp;
			this.translateY+=this.translateYTemp;
			this.translateXTemp = 0;
			this.translateYTemp = 0;
			this.zooming();
		}
		this.drawflag=false;	
		
	}	
	
};
//------------------------------------------------------------------------------
DrawingCanvas.prototype.drawLine = function(event)
{
		//	var event = {list:this.penlist, fillcolor:this.fillcolor, strokecolor:this.strokecolor, fill:this.fill, linewidth:this.pensize};
	//list = this.smoothpath(list);
	this.context.save();
	this.context.lineCap = 'round';
	this.context.strokeStyle = event.strokecolor;
	this.context.fillStyle = event.fillcolor;
	this.context.lineWidth = event.linewidth;
	this.context.beginPath();
	this.context.moveTo(event.list[0][0]+this.cx/this.zoom,event.list[0][1]+this.cy/this.zoom);
	for(var i=1; i<event.list.length; i++)
	{
		this.context.lineTo(event.list[i][0]+this.cx/this.zoom,event.list[i][1]+this.cy/this.zoom);
	}
	if(event.fill)
	{	//this.fillStyle=this.strokecolor;
		this.context.closePath();
		this.context.fill();
	}
	this.context.stroke();
	//this.parent.eventmove(x/this.parent.zoom-this.parent.translateX, y/this.parent.zoom-this.parent.translateY);
	this.context.restore();
}
//------------------------------------------------------------------------------

