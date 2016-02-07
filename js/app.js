var map;
      require([
        "esri/map",
        "esri/layers/FeatureLayer",
        "esri/dijit/PopupTemplate",
        "esri/request",
        "esri/geometry/Point",
        "esri/graphic",
        "dojo/on",
        "dojo/_base/array",
        "dojo/domReady!",
      ], function(
        Map,
        FeatureLayer,
        PopupTemplate,
        esriRequest,
        Point,
        Graphic,
        on,
        array
      ) {

        var featureLayer;

        map = new Map("mapDiv", {
          basemap: "dark-gray",
          center: [-117.820, 34.05574 ],
          zoom: 5
        });


        //hide the popup if its outside the map's extent
        map.on("mouse-drag", function(evt) {
          if (map.infoWindow.isShowing) {
            var loc = map.infoWindow.getSelectedFeature().geometry;
            if (!map.extent.contains(loc)) {
              map.infoWindow.hide();
            }
          }
        });



        //create a feature collection for the flickr photos
        var featureCollection = {
          "layerDefinition": null,
          "featureSet": {
            "features": [],
            "geometryType": "esriGeometryPoint"
          }
        };
        featureCollection.layerDefinition = {
          "geometryType": "esriGeometryPoint",
          "objectIdField": "ObjectID",
          "drawingInfo": {
            "renderer": {
              "type": "simple",
              "symbol": {
                "type": "esriPMS",
                "url": "../img/social_flickr_box.png",
                "contentType": "image/png",
                "width": 15,
                "height": 15
              }
            }
          },
          "fields": [{
            "name": "ObjectID",
            "alias": "ObjectID",
            "type": "esriFieldTypeOID"
          }, {
            "name": "description",
            "alias": "Description",
            "type": "esriFieldTypeString"
          }, {
            "name": "title",
            "alias": "Title",
            "type": "esriFieldTypeString"
          },{
            "name": "keywords",
            "alias" :"Keywords",
            "type"  :"esriFieldTypeString"
          }]
        };

        //define a popup template
        var popupTemplate = new PopupTemplate({
          title: "{title}",
          description: "{description}",
          keywords: "{keywords}"
        });

        //create a feature layer based on the feature collection
        featureLayer = new FeatureLayer(featureCollection, {
          id: 'flickrLayer',
          infoTemplate: popupTemplate
        });


        //associate the features with the popup on click
        featureLayer.on("click", function(evt) {
          map.infoWindow.setFeatures([evt.graphic]);
        });

        map.on("layers-add-result", function(results) {
          requestPhotos();
        });
        //add the feature layer that contains the flickr photos to the map
        map.addLayers([featureLayer]);

      function requestPhotos() {
        //get geotagged photos from flickr
        //tags=flower&tagmode=all
        var requestHandle = esriRequest({
          url: "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=a0167f062357d4dbc99e452427ab9bfb&min_upload_date=1449459707&max_upload_date=1423280507&has_geo=1&per_page=100&page=1&format=json&nojsoncallback=0",
          callbackParamName: "jsoncallback"
        });
        requestHandle.then(requestSucceeded, requestFailed);
      }

      var features = [];

      function requestSucceeded(response, io) {
        //loop through the items and add to the feature layer

        var pages = 1 ;
          array.forEach(response.photos.photo, function(item) {

            var attr = {};
            var id = item.id ;
            var farm = item.farm ;
            var secret = item.secret;
            var size = "_h";
            var serverID = item.server ;

            var requestHandle2 = esriRequest({
              url : "https://api.flickr.com/services/rest/?method=flickr.photos.geo.getLocation&api_key=a0167f062357d4dbc99e452427ab9bfb&photo_id="+id+"&format=json&nojsoncallback=0",
              callbackParamName : "jsoncallback"
            });

            var url = "http://farm"+farm+".staticflickr.com/"+serverID+"/"+id+"_"+secret+size+".jpg" ;

            requestHandle2.then( function(response, io){

              var geometry = new Point(response.photo.location.longitude, response.photo.location.latitude);
              console.log(JSON.stringify(geometry));
              attr["description"] = "<p><a href=\"http://www.flickr.com/photos/"+item.owner+"/"+id+"/\"><img src=\""+url+"\" \"width = \"240\" height=\"160\" /><\/a><\/p>" ;
              attr["title"] = item.title ? item.title : "Flickr Photo";
              attr["keywords"] = "TEST";
              var graphic = new Graphic(geometry);
              graphic.setAttributes(attr);
              features.push(graphic);
              if (features.length > 97){
              featureLayer.applyEdits(features, null, null);}
              }, requestFailed);






        });


      }

      function secondRequestSucceed(response, io){

      }


      function requestFailed(error) {
        console.log('failed');
      }
    });
