/*
 * Aplicacion para visualizar datos de idera en telefonos moviles 
 * Se intenta respetar una estructura que permita compilar apk de Android con phonegap
 */

var app = {
    // Application Constructor
    inicializar: function() {        
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
      
      $("#categorias .list-group-item").click(function(e) {
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
      var WMSgobierno ="http://sig.gobierno.gba.gov.ar:8080/geoserver/wms";

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
      
      var comisarias=L.tileLayer.wms(WMSgobierno, {
          layers: 'comisarias',
          format: 'image/png8',
          transparent: true,
          version: '1.1.0',
          attribution: ""
      });
      
       var salud=L.tileLayer.wms(WMSgobierno, {
          layers: 'salud2012_publicos',
          format: 'image/png8',
          transparent: true,
          version: '1.1.0',
          attribution: ""
      });

        map=  L.map("map", {
           zoom: 8,
           center: [-27, -54],
           layers: [mapquestOSM, escuelas,universidades,comisarias,salud],
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
      "<img src='assets/img/universidades.png' >&nbsp;Universidades": universidades,
      "<img src='assets/img/comisarias.png' >&nbsp;Comisarias": comisarias,
      "<img src='assets/img/salud.png' >&nbsp;Salud Pública": salud
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
                        app.mostrarResultados(e);
                            
        	})
        	 .fail(function() {
                	alert( "ERROR: error en la busqueda, revisar log" );
        	});
    },
    formatearaGeojson:function(f){
        var g = {
                 "type":"Feature",
                 "properties":{
                               "nombre": f.nombre                              
                              },
                 "geometry": {
                              "type": "Point",
                              "coordinates": [f.x,f.y]
                             }
                };   
        return g;                    
    },
    mostrarResultados: function(r){
        $("#categorias").fadeOut("slow");
        
        var items = [];
        $.each( r, function( key, val ) {
                items.push( "<a href='#' class='list-group-item' id='" + key + "'>" + val.nombre + "</a>" );
        });
        $("#resultados").fadeOut();
        $("#resultados").html(items.join("")); 
        $("#resultados").fadeIn("slow");
        $("#resultados .list-group-item").click(function(e){
            var feature=app.formatearaGeojson(r[$(this).attr('id')]);
            var icono = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
                };
            var layer=L.geoJson(feature,{
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, icono);
                }
            }).addTo(map);

            var bounds=layer.getBounds();
            map.fitBounds(bounds);
        });
    
    }
    
    
};


  
