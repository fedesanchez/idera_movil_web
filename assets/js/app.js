var map, featureList, boroughSearch = [], theaterSearch = [], museumSearch = [];

$(document).on("click", ".feature-row", function(e) {
  sidebarClick(parseInt($(this).attr('id')));
});

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(boroughs.getBounds());
  return false;
});


$("#login-btn").click(function() {
  $("#loginModal").modal("show");
  return false;
});

$("#list-btn").click(function() {
  $('#sidebar').toggle();
  map.invalidateSize();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  $("#sidebar").toggle();
  map.invalidateSize();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  $('#sidebar').hide();
  map.invalidateSize();
});



function sidebarClick(id) {
  map.addLayer(theaterLayer).addLayer(museumLayer);
  var layer = markerClusters.getLayer(id);
  markerClusters.zoomToShowLayer(layer, function() {
    map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
    layer.fire("click");
  });
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}


function main() {

      /* Servicios*/

      var WMSmapaeducativo="http://www.mapaeducativo.edu.ar/geoserver/ogc/wms";

      /* Basemap Layers */
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

      /* Overlay Layers */

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

      map = L.map("map", {
        zoom: 8,
        center: [-27, -54],
        layers: [mapquestOSM, escuelas,universidades],
        zoomControl: false,
        attributionControl: false
      });

      /* Layer control listeners that allow for a single markerClusters layer */


      /* Clear feature highlight when map is clicked */
	map.on("click", function(e) {
        	//console.log(e.latlng);
		var xy=e.latlng;
        	 $.getJSON(
			"buscar.php",
			{
			     x:xy.lng,
			     y:xy.lat,
			     tipo:"escuela"
			},
			function(data){
				var items = [];
				$.each( data, function( key, val ) {
					items.push( "<li id='" + key + "'>" + val.nombre + "</li>" );
				});
				$( "<ul/>", {
						"class": "my-new-list",
						html: items.join( "" )
				}).appendTo("#sidebar"); // Crear div para mostrar o acumular resultados 
			}
		)
       		 .done(function(e) {
                	alert("done");
        	})
        	.fail(function() {
                	alert( "error" );
        	})
        	.always(function() {
                	alert( "complete" );
        	});
      	});


      var zoomControl = L.control.zoom({
        position: "bottomright"
      }).addTo(map);

      /* GPS enabled geolocation control set to follow the user's location */
      var locateControl = L.control.locate({
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

      /* Larger screens get expanded layer control and visible sidebar */
      if (document.body.clientWidth <= 767) {
        var isCollapsed = true;
      } else {
        var isCollapsed = false;
      }

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
      var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
        collapsed: isCollapsed
      }).addTo(map);

      /* Highlight search box text on click */
      $("#searchbox").click(function () {
        $(this).select();
      });

      /* Typeahead search functionality */
      $(document).one("ajaxStop", function () {
        $("#loading").hide();        
      });

      $("#loading").hide();
}
  
