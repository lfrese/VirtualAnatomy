// JavaScript Document

var canvas;
var context;
var canvasWidth;
var canvasHeight;
var drawingAreaX = 0;
var drawingAreaY = 0;
var drawingAreaWidth = 200;
var drawingAreaHeight = 486;
var padding = 25;
var lineWidth = 8;
var colorPurple = "#cb3594";
var curColor = colorPurple;
var fillColor = colorPurple;
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
var fill = false;
var eventHistory = new Array();
var eventIndex = -1;
var zoom = 1;
var translateX = 0;
var translateY = 0;
var translateXTemp = 0;
var translateYTemp = 0;
var cx=0;
var cy=0;

 $(document).ready(function() {
    prepareCanvas();
    setupPalette();
    //handle cursor
    $("#penicon").click(function(){
       curTool = "marker";
    });
    $("#panicon").click(function(){
        curTool = "pan";
    });

    //handle zoom
    $("#zoomin").click(function(){
        zoom+=1;
        var increase = 100+ zoom*10;
        $("#canvas").css("background-size",increase+"%");
    });

    $("#zoomout").click(function(){
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
});

function prepareCanvas() {
    var canvasDiv = document.getElementById('maincanvas');
    canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'canvas');
    //canvas.setAttribute('style', 'background-image:url('+backgroundImage+');');
    canvasDiv.appendChild(canvas);
    if (typeof G_vmlCanvasManager != 'undefined') {
        canvas = G_vmlCanvasManager.initElement(canvas);
    }
    context = canvas.getContext("2d");	
    //backgroundImage.onload = function(){
        //context.drawImage(backgroundImage,0,0);   
    //}     

$("#canvas").mouseover(function(){
    if(curTool == "pan"){
        $("#canvas").css("cursor","move");
    }
    if(curTool == "marker"){
        $("#canvas").css("cursor","pointer");
    }
});    

// $('#canvas').mousedown(function (e) {
    // if(curTool == "marker"){
        // var mouseX = e.pageX - this.offsetLeft;
        // var mouseY = e.pageY - this.offsetTop;
        // paint = true;
        // addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
        // redraw();
    // }
// });

$('#canvas').mousedown(function (e) {
    if(curTool == "marker"){
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        paint = true;
        addClick(x/zoom-translateX, y/zoom-translateY);
        redraw();
    }
});

// $('#canvas').mousemove(function (e) {
    // if (paint) {
        // addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
        // redraw();
    // }
// });

$('#canvas').mousemove(function (e) {
    if (paint) {
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        addClick(x/zoom-translateX, y/zoom-translateY, true);
        redraw();
    }
});

$('#canvas').mouseup(function (e) {
    paint = false;
    context.closePath();
});

$('#canvas').mouseleave(function (e) {
    paint = false;
    context.closePath();
});

function zoomIn(){

}

function zoomOut(){

}

$('#clearCanvas').click(function (e) {
    clickX = new Array();
    clickY = new Array();
    clickDrag = new Array();
    clickColor = new Array();            
    clearCanvas();
    redraw();
    //context.drawImage(backgroundImage,0,0);
});

//Get the X, Y coords associated with the data
$("#addlayer").on("click",function(){
    var coorddata = '{"coords":[';
    for(var i=0;i<clickX.length;i++){
        coorddata += '{"x":'+clickX[i]+',"y":"'+clickY[i]+'"},';
    }
    coorddata = coorddata.substring(0, coorddata.length - 1) + "]}";
    jsonstr = JSON.stringify(coorddata);
    //post new layer
    var ismage_name = backgroundImage.src.split('/')
    $("#hfCoords").val(jsonstr);
    $("#hfIsmage").val(ismage_name[ismage_name.length -2]+'/'+ismage_name[ismage_name.length -1]);
    $("#hfFillColor").val(curColor);
    $("#hfStrokeColor").val(curColor);
    $("#hfOpacity").val('0.7');
    
    addLayer();
    //rrr = JSON.parse(coorddata);
    //console.log(rrr.coords[1].x);
});

$(".layer").dblclick(function(){
    checkBackground(this);    
});

//WHen changing the background we need to see if there are any unsaved layers
function checkBackground(elem){
    var isSameBg = false;
    var newbgsrc = $(elem).find('img').attr('src');
    if(backgroundImage.src != ''){
        if(backgroundImage.src == newbgsrc ){
            isSameBg = true;
        }
    }
    if(!isSameBg){
        //If changing the image but have unsaved layer
        var erase = true;
        if(clickX.length !=0){
            erase = confirm("Danger Will Robinson! This will erase your current layer!");
            if(erase){
                erase = confirm("Are you sure you want the layer you are working on erased forever?");
            }
            
        }
        //if Ok
        if(erase){
            clickX = new Array();
            clickY = new Array();
            clickDrag = new Array();
            clickColor = new Array();
            clearCanvas();
            setBackground(newbgsrc);
        }
    }
}      

}
    
function setBackground(newbgsrc){
        zoom = 1;
        backgroundImage.src = null;		
        backgroundImage.onload = function(){
            //TODO: modify according to future canvas 
            canvasWidth = backgroundImage.width;
            canvasHeight = backgroundImage.height;
            canvas.setAttribute('width', canvasWidth);
            canvas.setAttribute('height', canvasHeight);
            //$("#canvas").css({'background-image':"url("+newbgsrc+")",'width':backgroundImage.width, 'height': backgroundImage.height});
            redraw();
            var imgpath = $(backgroundImage).attr('src').split("/");
            $("#chosenfilename").html(imgpath[imgpath.length-1]);	
        }            
        backgroundImage.src = newbgsrc;
        $("#layertools").show();	
    }
		
function addClick(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);
    clickDrag.push(dragging);
    clickTool.push(curTool);
    clickColor.push(curColor);            
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
    context.fillStyle = fillColor;
    context.lineCap = 'round';
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
        context.strokeStyle = clickColor[i];
        context.lineWidth = radius;
        
        //if(fill){
            context.closePath();
            context.fill();            
            context.stroke();
        //}
        
    }

    //context.globalAlpha = 1;
            
            
}

function clearCanvas() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
}

//------------------------------------------------------------------------------
function findPos(obj) 
{	
	var curleft = 0, curtop = 0;
	//if (obj.offsetParent)
	//{
		do
		{
		    curleft += obj.offsetLeft;
		    curtop += obj.offsetTop;
		}while (obj = obj.offsetParent);
		return { x: curleft, y: curtop };
	//}
	//return undefined;
};
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
            var pos = findPos(this);
            var x = e.pageX - pos.x;
            var y = e.pageY - pos.y;
            curColor=palette.getColor(x,y);
            fillColor=curColor.replace(/[^,]+(?=\))/, '0.25');
            };
    $("#colorpalette").html(palettediv);	 
} 
	//put layer image in canvas if double click
	//TODO: make drag to canvas


	