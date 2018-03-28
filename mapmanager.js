define(
  ["dojo/_base/declare",
    "esri/map",
    "esri/geometry/Point",
    "esri/SpatialReference",
    "esri/geometry/Extent",
    "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/layers/WebTiledLayer",
    "esri/layers/FeatureLayer",
    "esri/layers/WMSLayer",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/TileInfo",
    "dojo/NodeList-dom",
    "dojo/NodeList-manipulate"
  ],
  function(
    declare,
    Map,
    Point,
    SpatialReference,
    Extent,
    ArcGISTiledMapServiceLayer,
    WebTiledLayer,
    FeatureLayer,
    WMSLayer,
    ArcGISDynamicMapServiceLayer,
    TileInfo
  ) {
    return declare("mapmanager", null, {

        constructor: function(mapDivId, config) {
          this.mapDivId = mapDivId;
          this.config = config;
          this.init();
        }, //end constructor
        init: function() {
          this.baselayers = this.config.baseLayers;
          this.mapOptions = this.config.mapOptions;
          this.initExtent = this.config.initExtent;
          this.center = this.config.center;
          this.initLevel = this.config.initLevel;
          this.showSilde = this.config.showSilde; //添加是否显示放大缩小控件配置

          this.map = new Map(this.mapDivId, this.mapOptions);
          this.map.spatialReference = new SpatialReference(this.mapOptions.spatialReference);
          this.map.lods = this.mapOptions.lods ? this.mapOptions.lods : null;

          // this.map.origin = this.mapOptions.origin;
          // this.map.rows = this.mapOptions.rows;
          // this.map.cols = this.mapOptions.cols;

          var tileInfo = new TileInfo({
            "rows": this.mapOptions.rows,
            "cols": this.mapOptions.cols,
            "origin": this.mapOptions.origin,
            "spatialReference": this.map.spatialReference,
            "lods": this.map.lods
          });

          /*地图初始范围， 没有初始范围使用中心点和初始级别*/
          this.map.on("load", (function() {
            if (this.initExtent && this.initExtent.length == 4) {
              this.map.setExtent(new Extent(this.initExtent[0], this.initExtent[1], this.initExtent[2], this.initExtent[3], this.map.spatialReference));
            } else if (this.center && this.initLevel) {
              this.map.centerAndZoom(new Point(this.center.x, this.center.y, this.mapOptions.spatialReference), this.initLevel);
            }
          }).bind(this));

          for (var i = 0, baselayer; baselayer = this.baselayers[i++];) {
            var layer;
            if (baselayer.type === 'WebTiledLayer') {
              var p_tileInfo = new TileInfo({
                "rows": this.mapOptions.rows,
                "cols": this.mapOptions.cols,
                "origin": baselayer.origin ? baselayer.origin : this.mapOptions.origin,
                "spatialReference": this.map.spatialReference,
                "lods": baselayer.lods ? baselayer.lods : this.map.lods
              });
              layer = new WebTiledLayer(baselayer.url, {
                "subDomains": baselayer.subDomains,
                "tileInfo": p_tileInfo,
                "displayLevels": baselayer.displayLevels
              });
            } else if (baselayer.type === 'ArcGISTiledMapServiceLayer') {
              layer = new ArcGISTiledMapServiceLayer(baselayer.url, {
                "displayLevels": baselayer.displayLevels
              });
              layer.spatialReference = this.mapOptions.spatialReference;
            } else if (baselayer.type === "ArcGISDynamicMapServiceLayer") {
              layer = new ArcGISDynamicMapServiceLayer(baselayer.url, {
                useMapImage: true
              });
              if (baselayer.visbleLayer && baselayer.visbleLayer.length > 0) {
                layer.setVisibleLayers(baselayer.visbleLayer);
              }
            } else if (baselayer.type === "WMSLayer") {
              layer = new WMSLayer(baselayer.url);
              if (baselayer.visbleLayer && baselayer.visbleLayer.length > 0) {
                layer.setVisibleLayers(baselayer.visbleLayer);
              }
            }
            layer.isBaseLayer = true;
            layer.layerName = baselayer.layerName;
            layer.layerGroup = baselayer.layerGroup ? baselayer.layerGroup : "";
            if (baselayer.layerName) {
              layer.id = baselayer.layerName;
            }
            if (baselayer.opacity) {
              layer.opacity = baselayer.opacity;
            }
            this.map.addLayer(layer);
          };

          if (this.showSilde) {
            if (this.showSilde == "false") {
              this.map.hideZoomSlider();
            }
          }

        }, //end init
        getMap: function() {
          return this.map;
        }
      }) // end return declare
  }); //end define
