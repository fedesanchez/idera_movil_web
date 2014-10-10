/*
 * Aplicacion para visualizar datos de idera en telefonos moviles 
 * Se intenta respetar una estructura que permita compilar apk de Android con phonegap
 */

var app = {
    // Application Constructor
    initialize: function() {        
        console.log("inicializando");
        this.ocultarLoading();
        this.inicializarTemplateBootstrap();
    },
    ocultarLoading: function(){
        $(".loading").fadeOut("slow");
    },
    inicializarTemplateBootstrap: function(){
        $("#barra").fadeIn("slow");
        $("#container").fadeIn("slow");
             
      // Highlight search box text on click /
      $("#searchbox").click(function () {
        $(this).select();
      });
      
      $("#nav-btn").click(function() {
        $(".navbar-collapse").collapse("toggle");
        return false;
      });

      $("#sidebar-toggle-btn").click(function() {
        $("#sidebar").toggle();
        //map.invalidateSize();
        return false;
      });

      $("#sidebar-hide-btn").click(function() {
        $('#sidebar').hide();
      });
      
      $(".list-group-item").click(function(e) {
        console.log("click a la lista");  
        var valor=$(this).attr('id');
        var opcion=$("#opcion-consulta input[type='radio']:checked").val();
        if(opcion==="posicion"){
            console.log("posicion");
            app.buscar(valor,app.locateControl._circleMarker.getLatLng());
        }else{
            map.on("click", function(e) {
		app.buscar(valor,e.latlng);        	 
            });
        }
      });
      
    $("#opcion-consulta input[type='radio']").bootstrapSwitch();
    
    $("#opcion-consulta input[type='radio']").on('switchChange.bootstrapSwitch', function (e) {
       posicion=$("#posicion").bootstrapSwitch('state'); 
       if(posicion){
           app.locateControl.locate();
       }
    });
    

      this.inicializarMapa();
    },
    mapa:null,
    locateControl:null,
    posicion:null,
    inicializarMapa: function(){
        
      // Servicios
      var WMSmapaeducativo="http://www.mapaeducativo.edu.ar/geoserver/ogc/wms";

      // Basemap Layers /
      var mapquestOSM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
        maxZoom: 19,
        subdomains: ["otile1", "otile2", "otile3", "otile4"],
        attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
      });
      var mapquestOAM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
        maxZoom: 18,
        subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
        attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
      });
      var mapquestHYB = L.layerGroup([L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
        maxZoom: 18,
        subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"]
      }), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
        maxZoom: 19,
        subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
        attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
      })]);

      // Overlay Layers /

      var escuelas = L.tileLayer.wms(WMSmapaeducativo, {
          layers: 'escuelas',
          format: 'image/png8',
          transparent: true,
          version: '1.1.0',
          attribution: ""
      });

      var universidades = L.tileLayer.wms(WMSmapaeducativo, {
          layers: 'universidades',
          format: 'image/png8',
          transparent: true,
          version: '1.1.0',
          attribution: ""
      });

        map=  L.map("map", {
           zoom: 8,
           center: [-27, -54],
           layers: [mapquestOSM, escuelas,universidades],
           zoomControl: false,
           attributionControl: false
        });
        
        L.control.zoom({
         position: "bottomright"
        }).addTo(map);
        
        this.locateControl = L.control.locate({
        position: "bottomright",
        drawCircle: true,
        follow: true,
        setView: true,
        keepCurrentZoomLevel: true,
        markerStyle: {
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.8
        },
        circleStyle: {
          weight: 1,
          clickable: false
        },
        icon: "icon-direction",
        metric: false,
        strings: {
          title: "My location",
          popup: "You are within {distance} {unit} from this point",
          outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
        },
        locateOptions: {
          maxZoom: 18,
          watch: true,
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 10000
        }
      }).addTo(map);

      var baseLayers = {
        "Street Map": mapquestOSM,
        "Aerial Imagery": mapquestOAM,
        "Imagery with Streets": mapquestHYB
      };

     var groupedOverlays = {
      "Educación": {
      "<img src='assets/img/escuelas.png' >&nbsp;Escuelas": escuelas,
      "<img src='assets/img/universidades.png' >&nbsp;Universidades": universidades
      }
      //"Salud": {
      //"Hospitales": hospitales
      //}
      };
     
     // Larger screens get expanded layer control and visible sidebar /
      if (document.body.clientWidth <= 767) {
         var isCollapsed = true;
        } else {
          var isCollapsed = false;
      }
        
      L.control.groupedLayers(baseLayers, groupedOverlays, {
        collapsed: isCollapsed
      }).addTo(map);

      this.mapa=map;
    },
    /* Buscar: busqueda de los 10 eventos mas cercanos a un punto 
     * - categoria, objeto que se busca...escuela, comisaria hospital etc
     * - latlng, coordenadas de la busqueda
     * */
    buscar: function(categoria,latlng){
        console.log("buscando "+categoria);
        $.ajax({
			url:"buscar.php",
			data:{
			     x:latlng.lat,
			     y:latlng.lng,
			     tipo:categoria
			}
		})
       		 .done(function(e) {
                	console.log("DONE: mostrando resultados en el mapa");
                        var resultados=L.geoJson().addTo(map);
                        for(var i in e){
                            var geojsonFeature = {
                                "type": "Feature",
                                "properties": {
                                    "nombre": e[i].nombre                              
                                },
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [e[i].x,e[i].y]
                                }
                            };  
                           resultados.addData(geojsonFeature);    
                        };
                        var bounds=resultados.getBounds();
                        map.fitBounds(bounds);
        	})
        	.fail(function() {
                	alert( "ERROR: error en la busqueda, revisar log" );
        	});
    }
    
    
};

/*
var map;
var locateControl;
var posicion;

$(document).on("click", ".feature-row", function(e) {
  sidebarClick(parseInt($(this).attr('id')));
});







function sidebarClick(id) {
  map.addLayer(theaterLayer).addLayer(museumLayer);
  var layer = markerClusters.getLayer(id);
  markerClusters.zoomToShowLayer(layer, function() {
    map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
    layer.fire("click");
  });
  // Hide sidebar and go to the map on small screens 
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}


function main() {
 
      
      // Clear feature highlight when map is clicked /
	map.on("click", function(e) {
        	//console.log(e.latlng);
		var xy=e.latlng;
        	 $.ajax({
			url:"buscar.php",
			data:{
			     x:xy.lat,
			     y:xy.lng,
			     tipo:"escuela"
			}
		})
       		 .done(function(e) {
                	console.log("DONE: mostrando resultados en el mapa");
                        var resultados=L.geoJson().addTo(map);
                        for(var i in e){
                            var geojsonFeature = {
                                "type": "Feature",
                                "properties": {
                                    "nombre": e[i].nombre                              
                                },
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [e[i].x,e[i].y]
                                }
                            };  
                           resultados.addData(geojsonFeature);    
                        };
                        
                        var bounds=resultados.getBounds();
                        map.fitBounds(bounds);
                        
        	})
        	.fail(function() {
                	alert( "ERROR: error en la peticion, revisar log" );
        	})
        	.always(function() {
                	//console.log("funcion que se ejecuta siempre al terminar ajax");
        	});
      	});


      

      // Typeahead search functionality 
      $(document).one("ajaxStop", function () {
        $("#loading").hide();        
      });

      $("#loading").hide();
}

 */

  
