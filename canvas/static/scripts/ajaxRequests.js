//Ajax Requests

//Edit

//Image
//async post image to server
function postImage(data){
    //post form
    getCSRF();
    
    $.ajax({ 
        type: "POST",
        url: "/canvas/save/image/",
        enctype: 'multipart/form-data',
        data: data,
        processData: false,
        contentType: false,
        success: function(returned){
           addNewImageToImagesDiv(returned);
        },
        error: function(returned){
            console.log(returned);
        }
    });
}

function deleteImage(image_id){
    getCSRF();
    $.ajax({ 
        type: "POST",
        url: "/canvas/delete/image/"+image_id,
        processData: false,
        contentType: false,
        success: function(returned){
            alert("Image successfully removed");
            $(".clear_all_layers").click();
            $(".image_layers").remove();    
            $("#sortable-list .layer#"+image_id).remove(); 
            context.clearRect(0, 0, canvas.width, canvas.height);  
            backgroundImage.src = '';
        },
        error: function(returned){
            console.log(returned);
        }
    });
}

//Layer

//post layer
function addLayer(layer_id){
    getCSRF();
    var data = new FormData($('form#layerform').get(0));
    if(layerverified()){
        $.ajax({ 
            type: "POST",
            url: "/canvas/save/layer/"+layer_id,
            enctype: 'multipart/form-data',
            data: data,
            processData: false,
            contentType: false,
            success: function(returned){
               alert("Layer successfully saved");
               if(layer_id == 0){ // 0 means new layer
                   var html = "";
                   if(!$(".image_layers").length){
                        $("#layercontainer").append("<div class='image_layers'></div>");
                   }               
                   html += "<div class='image_layer' id='"+returned+"'>"+$('form#layerform #layername input').val();
                   html += "<br />(<span class='viewLayer control'>View</span> | <span class='deleteLayer control'>Delete</span>)";
                   html += "</div>"
                   $("#layercontainer .image_layers").append(html);
               }
               //clear layer
               $('#clearCanvas').trigger('click'); 
               $("#closedetails").click();
            },
            error: function(returned){
                console.log(returned);
            }
        });
    }
}
      
function deleteLayer(layer_id){
    getCSRF();
    $.ajax({ 
        type: "POST",
        url: "/canvas/delete/layer/"+layer_id,
        processData: false,
        contentType: false,
        success: function(returned){
            alert("Layer successfully removed");
            $(".image_layer#"+layer_id).remove();    
            $(".clear_all_layers").click();
            clearShowing();
        },
        error: function(returned){
            console.log(returned);
        }
    });
}

function getLayers(image_id){
    getCSRF();
    $.ajax({ 
        type: "GET",
        url: "/canvas/getlayers/image/"+image_id,
        processData: false,
        contentType: false,
        success: function(returned){
            var html = "<div class='image_layers'>";
            for(var i=0;i<returned.length;i++){
                html += "<div class='image_layer' id='"+returned[i].id+"'>";
                html += "<span class='layername'>"+returned[i].name+"</span>";
                html += "<br />(<span class='viewLayer control'>View</span> | <span class='deleteLayer control'>Delete</span>)";
                html += "</div>";
            }
            html += "</div>";
            $("#layercontainer .image_layers").remove();
            $("#layercontainer").append(html);
        },
        error: function(returned){
            console.log(returned);
        }
    });    
}

function getLayerData(layer_id, showing){
    getCSRF();
    $.ajax({ 
        type: "GET",
        url: "/canvas/getlayerdata/layer/"+layer_id,
        processData: false,
        contentType: false,
        success: function(returned){
            var data = JSON.parse(returned);
            $("#layerform #layername input").val(data.name);
            $("#layerform #layertype input").val(data.type);
            $("#layerform #uploadaudio input").val(data.audio_src);
            $("#layerform #layerinfo textarea").val(data.description);
            //If the layer isnt currently showing on the drawing
            if(!showing){
                buildEvent(JSON.parse(data.layerdata).layers[0]);
            }
        },
        error: function(returned){
            console.log(returned);
        }
    });    
}

//View

 function viewLayerData(layerid){
     getCSRF();
     $.ajax({ 
         type: "POST",
         url: "/canvas/getlayerdata/layer/"+layerid,
         success: function(returned){
            clearCanvas();
            redraw(true);
            console.log(returned);
            var data = JSON.parse(returned);
            $("#detailname").text(data.name);
            $("#detaildetails").text(data.description);
            buildEvent(JSON.parse(data.layerdata).layers[0]);
         },
         error: function(returned){
             console.log(returned);
         }
     });
 }