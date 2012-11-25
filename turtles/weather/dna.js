(function($) {
    
    var collection = Backbone.Collection.extend({
        initialize : function(models, options) {
            // prevents loss of 'this' inside methods
            _.bindAll(this, "refresh");

            // bind refresh
            this.on("born", this.refresh);
            this.on("refresh", this.refresh);

            // default error value
            options.error = false;

            // automatic collection refresh each minute, this will 
            // trigger the reset event
            refreshInterval = window.setInterval(this.refresh, 60000);
        },
        refresh : function() {
            // don't fetch if there is no location
            if (this.options.location == null || !this.options.location)
                return;
            
            var self = this;
            self.fetch({
                error : function() {
                    // will allow the view to detect errors
                    self.options.error = true;

                    // if there are no previous items to show, display error message
                    if(self.length == 0)
                        self.trigger("reset");
                }
            });
        },
        url : function() {
            var latitude = this.options.location.split(',')[0];
            var longitude = this.options.location.split(',')[1];
            
            return "https://data.flatturtle.com/Weather/Rainfall/" + encodeURIComponent(latitude) + "/" + encodeURIComponent(longitude) + ".json";
        },
        parse : function(json) {
            var data = json.Rainfall;
            
            // new array
            var results = new Array();
            var raining;
            
            for (var i in data) {
            	// first item
            	if (results.length == 0) {
            		raining = parseInt(data[i].milimeter) != 0;
            		data[i].time = "nu";
            		data[i].raining = raining;
            		
            		results.push(data[i]);
            		continue;
            	}
            	
            	if (raining && parseInt(data[i].milimeter) == 0) {
            		raining = false;
            		data[i].time = new Date(data[i].time * 1000).format("{H}:{M}");
            		data[i].raining = raining;
            		
            		results.push(data[i]);
            	}
            	else if (!raining && parseInt(data[i].milimeter) != 0) {
            		raining = true;
            		data[i].time = new Date(data[i].time * 1000).format("{H}:{M}");
            		data[i].raining = raining;
            		
            		results.push(data[i]);
            	}
            }
            
            return results.slice(0,2);
        }
    });

    var view = Backbone.View.extend({
        initialize : function() {
            // prevents loss of 'this' inside methods
            _.bindAll(this, "render");
            
            // bind render to collection reset
            this.collection.on("reset", this.render);

            // pre-fetch template file and render when ready
            var self = this;
            if (this.template == null) {
                $.get("turtles/weather/views/list.html", function(template) {
                    self.template = template;
                    self.render();
                });
            }
        },
        render : function() {
            // only render when template file is loaded
            if (this.template && this.collection.length) {
            
                var data = {
                    entries : this.collection.toJSON(),
                    error : this.options.error // have there been any errors?
                };
                
                // add html to container
                this.$el.empty();
                this.$el.html(Mustache.render(this.template, data));
            }
        }
    });

    // register turtle
    Turtles.register("weather", {
        collection : collection,
        view : view
    });

})(jQuery);