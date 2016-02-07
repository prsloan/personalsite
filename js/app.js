var map;
      require([
        "esri/map",
        "esri/layers/FeatureLayer",
        "esri/dijit/TimeSlider",
        "esri/TimeExtent",
        "esri/dijit/PopupTemplate",
        "esri/request",
        "esri/geometry/Point",
        "esri/graphic",
        "dojo/on",
        "dojo/_base/array",
        "dojo/domReady!",
        "esri/layers/TimeInfo"
      ], function(
        Map,
        FeatureLayer,
        TimeSlider,
        TimeInfo,
        TimeExtent,
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

        map.on("layers-add-result", initSlider);

        function initSlider() {
         var timeSlider = new TimeSlider({
           style: "width: 100%;"
         }, dom.byId("timeSliderDiv"));
         map.setTimeSlider(timeSlider);

         var timeExtent = new TimeExtent();
         timeExtent.startTime = new Date("1/1/1921 UTC");
         timeExtent.endTime = new Date("12/31/2009 UTC");
         timeSlider.setThumbCount(2);
         timeSlider.createTimeStopsByTimeInterval(timeExtent, 2, "esriTimeUnitsYears");
         timeSlider.setThumbIndexes([0,1]);
         timeSlider.setThumbMovingRate(2000);
         timeSlider.startup();

         //add labels for every other time stop
         var labels = arrayUtils.map(timeSlider.timeStops, function(timeStop, i) {
           if ( i % 2 === 0 ) {
             return timeStop.getUTCFullYear();
           } else {
             return "";
           }
         });

         timeSlider.setLabels(labels);

         timeSlider.on("time-extent-change", function(evt) {
           var startValString = evt.startTime.getUTCFullYear();
           var endValString = evt.endTime.getUTCFullYear();
           dom.byId("daterange").innerHTML = "<i>" + startValString + " and " + endValString  + "<\/i>";
         });
       }
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
          }]
        };

        //define a popup template
        var popupTemplate = new PopupTemplate({
          title: "{title}",
          description: "{description}"
        });

        //create a feature layer based on the feature collection
        featureLayer = new FeatureLayer(featureCollection, {
          id: 'flickrLayer',
          infoTemplate: popupTemplate
        });
        featureLayer.setUseMapTime(true);

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
          url: "http://api.flickr.com/services/feeds/geo?&format=json",
          callbackParamName: "jsoncallback"
        });
        requestHandle.then(requestSucceeded, requestFailed);
      }

      function requestSucceeded(response, io) {
        //loop through the items and add to the feature layer
        var features = [];
        array.forEach(response.items, function(item) {
          var attr = {};
          attr["description"] = item.description;
          attr["title"] = item.title ? item.title : "Flickr Photo";

          var geometry = new Point(item);

          var graphic = new Graphic(geometry);
          graphic.setAttributes(attr);
          features.push(graphic);
        });

        featureLayer.applyEdits(features, null, null);
      }

      function requestFailed(error) {
        console.log('failed');
      }
    });
