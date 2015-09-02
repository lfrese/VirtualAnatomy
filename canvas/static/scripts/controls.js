////// *** Handle edit functions **** //
$(document).ready(function() {		
     
     //****** left tools: upload image, draw tools, etc *****//
     //Clear selected image & rest of data from uploadimageform
    $("#btnImgClear").on("click", function(){
        $('#uploadimageform').trigger("reset");
        $("#partimage").val('');
        $("#imgpart").val('');
        $("#hfImgorder").val('');
        $("#hfImgName").val('');
        $("#chosenfilename").html('');
        $("#fileUpload").show();
        $("#imghandlerButtons").hide();
    });
    
    //upload the new image
    $("#btnImgUpload").on("click", function(){
        //get form data
        var data = new FormData($('form#uploadimageform').get(0));
        //post 
        var fn = postImage(data)
        //show New Image button again
        $("#fileUpload").show();
        $("#imghandlerButtons").hide();
        //show tools & layer stuff
    });
    
    //when the user selects an image to upload, hide the upload box and show more controls
	$("#partimage").on('change', function(){
        //verify user has uploaded img
        if (!$('#partimage').hasExtension(['.jpg', '.JPG','.PNG', '.png', 'GIF', '.gif'])) {
            alert("Please upload an image. filetype jpg, png, or gif")
        }
        else{
            //get the file name from the path
            var fn = getUploadedName(this);
            $("#hfImgName").val(fn);           
            $("#fileUpload").hide();
            $("#imghandlerButtons").show();
            //put file name in div (cant be too long)
            if(fn.length > 15){
                fn = fn.substring(0,14) + "...";
            }
            $("#chosenfilename").html(fn);
        }          
	});
	
    
     //handle details overlay
	$(".overlay-trigger").on("click", function(){
		$("#layerdetails").fadeIn(300);
	});
	$("#closedetails").on("click", function(){
		$("#layerdetails").fadeOut(300);
	});    
     
     //save new layer -  Located in draw.js
    //$("#addlayer").on("click",function(){   
    //});
     
     //****** Right tools: layers, sort images ******* //
    //fix issue where last item in sort list doesnt fully show - TOTO make this better - calculate height if need to
    //maybe need to get last image in django iteration and assign class to it?
    $("#sortercontainer").css('min-height',$(window).height());
    var lastimgheight = 0;
    $("#sortercontainer .layer:last").css('height',$("#sortercontainer .layer:last").height()+80);
    
    //make images sortable
    var container = document.getElementById('sortable-list');
    var sort = Sortable.create(container, {
      animation: 150, // ms, animation speed moving items when sorting, `0` — without animation
      draggable: ".layer", // Specifies which items inside the element should be sortable
      onUpdate: function (evt/**Event*/){
         var item = evt.item; // the current dragged HTMLElement
      }
    });
		//slider for Image sorter
	$("#puller").on( "click", function() {
		if($("#layermanager").css('right') == "0px"){
			closeLayer("#layermanager","#layerpuller","-175px");
		}
		if($("#sorter").css('right') == "-175px"){
			openLayer("#sorter","#puller");
		}
		else{
			closeLayer("#sorter","#puller","-175px");
		}
	});	
    
	//we only want to show the layers that are associated with the image currently on the canvas
	//slider for layer manager
	$("#layerpuller").on( "click", function() {	
		if($("#sorter").css('right') == "0px"){
			closeLayer("#sorter","#puller", "-175px");
		}	
		if($("#layermanager").css('right') == "-175px"){
			openLayer("#layermanager","#layerpuller");
		}
		else{
			closeLayer("#layermanager","#layerpuller","-175px");
		}
	});	
	//the layer manager is too long, lets hide it when we click on nav
	$("#menu-bars").on("click", function(){
		if($("#layermanager").css('right') == "0px"){
			closeLayer("#layermanager","#layerpuller","-175px");
		}
	});
	
	//Open or close the layers
	//param layer: the whole div to slide
	//param handle: the part that is clicked to open or close the div
	//param position: the hidden position to slide the div back to
	function openLayer(layer, handle){
		$(handle+" .fa-arrow-left").hide();
		$(handle+" .fa-arrow-right").show();
		$(layer).css('right', 0).css({'transition':'right 300ms ease','-webkit-transition':'right 300ms ease'});
	}
	function closeLayer(layer, handle, position){
		$(handle+" .fa-arrow-right").hide();
		$(handle+" .fa-arrow-left").show();
		$(layer).css('right', position).css({'transition':'right 300ms ease','-webkit-transition':'right 300ms ease'});
	}
    
    //Get order of layers
	//TODO: Order Onchange - we will send this info back to server via ajax
	function getorder(){
		var i = 0;
		var layerarray = [];
		$(".layer").each(function(){
			layerarray[i] = $(this).find('img').attr('src');
			i++;
		});
		
		var lst = "";
		for(j=0; j< layerarray.length; j++){
			lst += j + ": " + layerarray[j] + " ; ";
		}
		alert(lst);
	}
    
     //get layer data when the layer in the layermanager is clicked on
     $("#layermanager").on('click', '.image_layer', function(){
        var layer_id = this.id;
        var showing = false;
        if(!$(this).hasClass("showing")){
             $(this).addClass("showing");             
        }else{
            showing = true; //layer is already showing
        }       
        getLayerData(layer_id, showing);        
        inEditMode = false;
        $("#penicon").addClass("desaturate");
        tool = "";
        $("#canvas").css("cursor","pointer");
    });
    //click on view layer
    $("#layermanager").on('click', '.image_layer .viewLayer', function(){
        $(this).parent().click();
    });
    //click on edit layer - to be implemented @ later stage
    //$("#layermanager").on('click', '.image_layer .editLayer', function(){
    //    inEditMode = true;
    //    layerid = $(this).parent().attr("id");
    //    tool = "pen";
    //    $("#canvas").css("cursor","crosshair");
    //});
    
    //Delete layer
    $("#layermanager").on('click', '.image_layer .deleteLayer', function(){
        var imsure = false;
        imsure = confirm("are you sure you want to delete the layer named "+$(this).parent().find(".layername").text()+" FOREVER?");
        if(imsure){
            deleteLayer($(this).parent().attr("id"));     
            inEditMode = false;
            layerid = 0;
        }
    });
    
    //Hide all layers
    $("#layermanager").on("click",".clear_all_layers", function(){
        $('#clearCanvas').click();
        $(".image_layer").each(function(){
            $(this).removeClass("showing");
        });
    });
    
    //delete image
    $("#sortable-list").on("click", ".delete_image", function(){
        var imsure = false;
        imsure = confirm("are you sure you want to delete the image "+$(this).parent().find("img").attr("src")+" and ALL of its layers?");
        if(imsure){
            deleteImage($(this).parent().attr("id"));
            layerid = 0;
        }
    });
    
    //***** Main canvas tools ****//
   
    
});


// ********* Common functions to be called from anywhere *******//


//gets the file name of the selected file from an img element
function getUploadedName(elm){
    var path = "";
        if($(elm).val().indexOf("\\") >= 0){
            path = $(elm).val().split("\\");
        }		
        if($(elm).val().indexOf('/') >= 0){
        
            path = $(elm).val().split("/");
        }
        var fn = path[path.length -1];
        return fn;
}

//Adds the newly uploaded image to the image div & canvas seamlessly
function addNewImageToImagesDiv(json_data){
    var data = JSON.parse(json_data);
    $(".layer.last").removeAttr('style');
    $(".layer.last").removeClass('last');
    var codeblock = '<li class="layer last" id="'+data.id+'"><img src="/canvas/media/'+data.name+' "><br /><div class="delete_image">Delete Image</div></li>';
    $("#sortable-list").append(codeblock);
    $("#sortercontainer .layer:last").css('height',$("#sortercontainer .layer:last").height()+50);
    setBackground('/canvas/media/'+data.name);
    $(".image_layers").remove();
    $("#layertools").show();
}
	

    

     
 //check to ensure all of the required fields are entered
 function layerverified(){
    var isvalid = true;  
    var errorstr =  "";         
    if($("#inLayerName").val().trim() == "" || $("#inLayerType").val().trim() == "" || $("#tbDetails").val().trim() == ""){
        alert("Please ensure the name, description, and type for the form have been entered");
        isvalid = false;
    }  
    if($("#hfCoords").val().trim() == ""){
        isvalid = false;
        alert("You have to draw a layer in order to save it");
    }    
    return isvalid;        
 }	
	
//Get layers associated with image by image_id



//Get layer data by layer_id

  
//clear all showing layers
function clearShowing(){
    $("#layermanager").find(".image_layer").each(function(){
        $(this).removeClass("showing");
    });
}
  
//needed to get the CSRF token otherwise
//django wont let us upload 	
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

$.fn.hasExtension = function(exts) {
    return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test($(this).val());
} 

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
function getCSRF(){
    var csrftoken = getCookie('csrftoken');             
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
}