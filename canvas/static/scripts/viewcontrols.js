//Handles view controls

// function getLayerData(layerid){
    // getCSRF();
    // $.ajax({ 
            // type: "POST",
            // url: "/canvas/getlayerdata/",
            // data: {layerid:layerid},
            // success: function(returned){
               // console.log(returned);
            // },
            // error: function(returned){
                // console.log(returned);
            // }
        // });
// }


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