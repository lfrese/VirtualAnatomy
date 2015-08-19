var canvas;
var context;
var canvasWidth;
var canvasHeight;

var backgroundImage = new Image();
var zoom = 1;
var translateX = 0;
var translateY = 0;
var translateXTemp = 0;
var translateYTemp = 0;
var cx=0;
var cy=0;
var penlist= new Array();
var eventHistory = new Array();
var eventIndex = -1;
var drawflag = false;

var fillopacity = '0.25';
var strokecolor = 'rgba(0,0,0,1)';
var fillcolor = strokecolor.replace(/[^,]+(?=\))/, fillopacity);
var pensize = 2;
var tool = "pen";
var fill = true;

$(document).ready(function() {
    prepareCanvas();
    setupPalette();
    //handle cursor
    $("#penicon").click(function(){
       tool = "pen";
    });
    $("#panicon").click(function(){
        tool = "moveimage";
    });

    //handle zoom
    $("#zoomin").click(function(e){
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;

        translateX-=(x-cx)/self.zoom;
        translateY-=(y-cy)/self.zoom;
        zoom*=2;	
        cx=x;
        cy=y;
        zooming();
    });

    $("#zoomout").click(function(e){
        if(zoom >1){
            var pos = findPos(this);
            var x = e.pageX - pos.x;
            var y = e.pageY - pos.y;
            translateX-=(x-cx)/self.zoom;
            translateY-=(y-cy)/self.zoom;
            zoom/=2;
            cx=x;
            cy=y;
            zooming();
        }
    });
    
    //Handle fill
    $("#cbFill").click(function(){
        if(fill){
            fill = false;
        }
        else{
            fill = true;
        }
    });
    
    //handle undo redo
    $("#undo").click(function(){
        if(eventIndex>=0)self.eventIndex-=1;zooming();
    });
    $("#redo").click(function(){
        if(eventIndex<eventHistory.length-1)eventIndex+=1;zooming();
    });
    
    //-----------------------------------------------------------------------------
    $(".layer").dblclick(function(){
        checkBackground(this);    
    });

    //-----------------------------------------------------------------------------
    $("#canvas").mouseover(function(){
        if(tool == "moveimage"){
            $("#canvas").css("cursor","move");
        }
        if(tool == "pen"){
            $("#canvas").css("cursor","pointer");
        }
    }); 
        
    //-----------------------------------------------------------------------------
    $('#canvas').mousedown(function (e) {
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        eventstart(x/zoom-translateX, y/zoom-translateY);
        
    });

    $('#canvas').mousemove(function (e) {
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        eventmove(x/zoom-translateX, y/zoom-translateY);
    });

    $('#canvas').mouseup(function (e) {
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        eventend(x/zoom-translateX, y/zoom-translateY);
    });

    $('#canvas').mouseleave(function (e) {
        
    });    
    
    $('#canvas').bind('mousewheel', function(e){
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;

        translateX-=(x-cx)/self.zoom;
        translateY-=(y-cy)/self.zoom;
        if(e.originalEvent.wheelDelta > 0) {
            zoom*=2;	
        }
        else{
            if(zoom >1){
                zoom/=2;
            }
        }
        cx=x;
        cy=y;

        zooming();
});
    
    $('#clearCanvas').click(function (e) {
        penlist = new Array();   
        translateX = 0;
        translateY = 0;
        translateXTemp = 0;
        translateYTemp = 0;
        cx=0;
        cy=0;
        eventIndex=-1;
        eventHistory=new Array();
        clearCanvas();
        redraw(false);
    });
    
    //Get the X, Y coords associated with the data
    $("#addlayer").on("click",function(){      
        
        if(eventIndex > -1){
            console.log(eventIndex);
        console.log(eventHistory);
            var coorddata = '{"layers":[';
            for(var i = 0; i<eventIndex+1; i++){
                coorddata += '{"fill":'+eventHistory[i].fill;
                coorddata += ',"fillcolor":"'+eventHistory[i].fillcolor;
                coorddata += '","linewidth":"'+eventHistory[i].linewidth;
                coorddata += '","strokecolor":"'+eventHistory[i].strokecolor;
                coorddata += '","coords":[';
                for(var j = 0; j<eventHistory[i].list.length; j++){
                    coorddata += '{"x":'+eventHistory[i].list[j][0]+',"y":'+eventHistory[i].list[j][1]+'},';
                }
                coorddata = coorddata.substring(0, coorddata.length - 1) + "]},";
            }
            coorddata = coorddata.substring(0, coorddata.length - 1) + "]}";
            ////post new layer
            var ismage_name = backgroundImage.src.split('/');
            $("#hfCoords").val(coorddata);
            $("#hfIsmage").val(ismage_name[ismage_name.length -2]+'/'+ismage_name[ismage_name.length -1]);            
            addLayer();
            //var rrr = JSON.parse(coorddata);
            //console.log(rrr);
        }
    });
});

//-----------------------------------------------------------------------------
function prepareCanvas() {
    var canvasDiv = document.getElementById('maincanvas');
    canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'canvas');
    canvasDiv.appendChild(canvas);    
    context = canvas.getContext("2d");	
    context.save();     
}



//------------------------------------------------------------------------------
//WHen changing the background we need to see if there are any unsaved layers
function checkBackground(elem){
    var isSameBg = false;
    var newbgsrc = $(elem).find('img').attr('src');
    var image_id = elem.id;
    if(backgroundImage.src != ''){
        if(splitBgName(backgroundImage.src) == splitBgName(newbgsrc)){
            isSameBg = true;
        }
    }
    if(!isSameBg){
        //If changing the image but have unsaved layer
        var erase = true;
        if(eventHistory.length !=0){
            erase = confirm("Danger Will Robinson! This will erase your current layer!");
            if(erase){
                erase = confirm("Are you sure you want the layer you are working on erased forever?");
            }
            
        }
        //if Ok
        if(erase){
            penlist = new Array();
            clearCanvas();
            setBackground(newbgsrc, image_id);
        }
    }
}   
function splitBgName(name){
    var sp = name.split('/');
    return sp[sp.length-1].trim();
}   
function setBackground(newbgsrc, image_id){
    zoom = 1;
    backgroundImage.src = null;		
    backgroundImage.onload = function(){
        canvasWidth = backgroundImage.width;
        canvasHeight = backgroundImage.height;
        canvas.setAttribute('width', canvasWidth);
        canvas.setAttribute('height', canvasHeight);
        redraw(true);
        var imgpath = $(backgroundImage).attr('src').split("/");
        $("#chosenfilename").html(imgpath[imgpath.length-1]);	
    }            
    backgroundImage.src = newbgsrc;
    $("#layertools").show();	
    
    //Load the layers associated with this image
    getLayers(image_id);
}

function redraw(newimg){
    context.restore();
    context.save();
    if(newimg){
        eventIndex=-1;
        eventHistory=new Array();
        zoom=1;
    }
    clearCanvas();    
    context.drawImage(backgroundImage,0,0);
}
    
//------------------------------------------------------------------------------    
function clearCanvas() {    
    context.clearRect(0, 0, canvasWidth, canvasHeight);
}

//------------------------------------------------------------------------------
function findPos(obj) 
{	
	var curleft = 0, curtop = 0;
    do
    {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
    }while (obj = obj.offsetParent);
    return { x: curleft, y: curtop };
}
//------------------------------------------------------------------------------

//make color palette

function CanvasPalette(canvasid)
{
	this.canvas = canvasid;
	this.context = this.canvas.getContext("2d");
	this.canvas.width = 100;
	this.canvas.height = 180;
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

function setupPalette(){
    var palettediv = document.createElement('canvas');
    var palette = new CanvasPalette(palettediv)
        palettediv.onmousedown=function(e){
            tool = "pen";
            var pos = findPos(this);
            var x = e.pageX - pos.x;
            var y = e.pageY - pos.y;
            strokecolor=palette.getColor(x,y);
            fillcolor=strokecolor.replace(/[^,]+(?=\))/, '0.25');
            };
    $("#colorpalette").html(palettediv);	 
}

//------------------------------------------------------------------------------
function eventstart(x,y)
{
	if(tool=="pen")
	{	
		drawflag=true;
		context.lineCap = 'round';
		context.beginPath();
		context.moveTo(x, y);		
		penlist.push([x-cx/zoom,y-cy/zoom]);
		
	}
	if(tool=="moveimage")
	{

		drawflag=true;
		penlist.push([x,y]);
		translateXTemp = 0;
		translateYTemp = 0;
	}
}

//------------------------------------------------------------------------------
function eventmove(x,y)
{
	if(drawflag && tool=="pen")
	{
		context.strokeStyle = strokecolor;
		context.fillStyle = fillcolor;
	    context.lineWidth = pensize;

		context.lineTo(x,y);
		context.stroke();
		oldx = x;
		oldy = y;
		drawflag=true;
		penlist.push([x-cx/zoom,y-cy/zoom]);
	}  
	if(drawflag && tool=="moveimage") 
	{
		translateXTemp=(x-penlist[0][0]);
		translateYTemp=(y-penlist[0][1]);

		zooming();
	}  	

};
//------------------------------------------------------------------------------
function eventend(x,y)
{
	if(drawflag)
	{
		if(tool=="pen")
		{
			if(fill)
			{
				context.closePath();
			}
			var event = {list:penlist.slice(), fillcolor:fillcolor, strokecolor:strokecolor, fill:fill, linewidth:pensize};
			drawLine(event);	
			eventHistory=eventHistory.splice(0,eventIndex+1);
			eventHistory.push(event);
			eventIndex++;
			penlist=new Array();
		}
		if(tool=="moveimage")
		{
			penlist=[];
			translateX+=translateXTemp;
			translateY+=translateYTemp;
			translateXTemp = 0;
			translateYTemp = 0;
			zooming();
		}
		drawflag=false;	
		
	}	
	
}
//------------------------------------------------------------------------------
function drawLine(event)
{
	context.save();
	context.lineCap = 'round';
	context.strokeStyle = event.strokecolor;
	context.fillStyle = event.fillcolor;
	context.lineWidth = event.linewidth;
	context.beginPath();
	context.moveTo(event.list[0][0]+cx/zoom,event.list[0][1]+cy/zoom);
	for(var i=1; i<event.list.length; i++)
	{
		context.lineTo(event.list[i][0]+cx/zoom,event.list[i][1]+cy/zoom);
	}
	if(event.fill){
		context.closePath();
		context.fill();
	}
	context.stroke();
	context.restore();
}
//------------------------------------------------------------------------------
function zooming()
{
	context.restore();
	context.save();	
	clearCanvas();
	context.scale(zoom,zoom);
	context.translate(translateX+translateXTemp,translateY+translateYTemp);
	context.drawImage(backgroundImage, cx/zoom, cy/zoom);
	for(i=0; i<=eventIndex; i++)
	{
		drawLine(eventHistory[i]);
	}
};
//------------------------------------------------------------------------------

//Draws the layer on the canvas based on the layerdata
//when the layer name is clicked   
function buildEvent(event){
    //var canvas = document.getElementById('canvas'); 
    //context = canvas.getContext("2d");	
    context.save();
	context.lineCap = 'round';
	context.strokeStyle = event.strokecolor;
	context.fillStyle = event.fillcolor;
	context.lineWidth = event.linewidth;
	context.beginPath();
	context.moveTo(event.coords[0].x+cx/zoom,parseInt(event.coords[0].y)+cy/zoom);
	for(var i=1; i<event.coords.length; i++)
	{
		context.lineTo(event.coords[i].x+cx/zoom,parseInt(event.coords[i].y)+cy/zoom);
        context.stroke();
	}
	if(event.fill){
		context.closePath();
		context.fill();
	}
	
	context.restore();
}