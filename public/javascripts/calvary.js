var Calvary;

(function($){
	'use strict';

	function CalvaryViewModel(){
		var _model;

		return{
			charge: function(model){
				_model = ko.mapping.fromJSON(model);

				ko.applyBindings(_model);

				var css = '';				$.each(_model.items(), function(k,v){
					css += '\n' + v.css();
					$('.container').append(v.html());
				})
				$('head').append($('<style>' + css + '</style>'));
			}
		};
	}
	Calvary = new CalvaryViewModel();
}(jQuery));