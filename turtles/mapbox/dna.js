/*
 * FlatTurtle
 * @author: Jens Segers (jens@irail.be)
 * @license: AGPLv3
 */

(function($){

	var view = Backbone.View.extend({
		// mapbox object
		map : null,

		initialize : function() {
			var self = this;

			// default zoom
			if (!this.options.zoom)
				this.options.zoom = 13;

			// mapbox layer id
			if (!this.options.layer)
				this.options.layer = 'examples.map-vyofok3q';

			// get the mapbox api if needed
			if (typeof(mapbox) == 'undefined') {
				// for some reason mapbox breaks mustache, so take a backup
				var Mustache = window.Mustache;

				$.getScript("client/js/libs/mapbox.php", function() {
					// restore backup
					window.Mustache = Mustache;

					// render map
					self.render();
				});
			} else {
				self.render();
			}
		},
		render : function() {
			var self = this;

			$.get("turtles/mapbox/views/widget.html", function(template) {
				// set window height to load
				self.$el.height("100%");

				// render html
				self.$el.empty();
				self.$el.html(Mustache.render(template));

				// change turtle padding
				self.$el.addClass("nopadding");

				// canvas element
				var canvas = self.$el.find("#canvas")[0];

				// create the mapbox object
				self.map = mapbox.map(canvas);
				self.map.addLayer(mapbox.layer().id(self.options.layer));

				var latitude = parseFloat(self.options.location.split(',')[0]);
				var longitude = parseFloat(self.options.location.split(',')[1]);

				// Create an empty markers layer
				var markerLayer = mapbox.markers.layer();

				// Add a single feature to the markers layer.
				markerLayer.add_feature({
					geometry: {
						// The order of coordinates here is lon, lat. This is because
						coordinates: [longitude, latitude]
					},
					properties: {
						'marker-color': '#333333',
						'marker-symbol': 'star-stroked'
					}
				});
				self.map.addLayer(markerLayer);

				// center and zoom
				self.map.centerzoom({ lat: latitude, lon: longitude }, self.options.zoom);
			});
		}
	});

	// register turtle
	Turtles.register("mapbox", {
		view : view
	});

})(jQuery);