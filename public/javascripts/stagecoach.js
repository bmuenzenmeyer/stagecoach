var Stagecoach;

(function($){
	'use strict';

	function StagecoachViewModel(){
		var _model, 
			saveTimer;

		function updateHtml(ele){
			var iHtmlString = $(ele).val();
			$(ele).closest('.item').find('.iOut').contents().find('body').html(iHtmlString);
		}

		function updateCss(ele){
			var iCssString = $(ele).val();
			$(ele).closest('.item').find('.iOut').contents().find('head').html('<style>' + iCssString + '</style>');
		}

		function save(ele){
			var item = ko.dataFor(ele);
			//console.log(ko.toJSON(item));
			$.ajax({
				url: '/',
				type: 'POST',
				cache: false,
				data: ko.toJSON(item),
				contentType: 'application/json',
				success: function(){
					console.log('success')
				},
				error: function(jqXHR, textStatus, errorThrown){
					console.log(errorThrown);
				}
			});
		}

		function throttleSave(ele){
			clearTimeout(saveTimer);
			saveTimer = setTimeout(function(){
				var item = ko.dataFor(ele);
				//console.log(ko.toJSON(item));
				save(ele);
			}, 2000);
		}

		function updateOutput(){
			$('.iHtml').each(function(){
				updateHtml(this);
			});

			$('.iCss').each(function(){
				updateCss(this);
			});
		}

		function sortItems(){
			if(_model.items()[0].order){ //dont know if this is adequate
				_model.items.sort(function(a, b){
					return parseInt(a.order(), 10) === parseInt(b.order()) ? 0 :
					(parseInt(a.order(), 10) < parseInt(b.order(), 10) ? -1 : 1)
				});
			updateOutput();
			}
		}

		return{
			embark: function(model){
				//console.log(model);
				_model = ko.mapping.fromJSON(model);
				ko.applyBindings(_model);
				sortItems();

				$('.name').on('keyup', function(){
					if($(this).val().length === 0){
						$('.add').addClass('disabled');
					} else{
						$('.add').removeClass('disabled');
					}
				})

				$('.add').on('click', function(){
					if($(this).hasClass('disabled')){
						return;
					}

					var newItemName = $('.name').val(),
						order = parseInt($('.sortOrder').val(), 10),
						alreadyAboard = false;

					$.each(_model.items(), function(k,v){
						if(newItemName === v.name()){
							alreadyAboard = true;
							return false;
						}
					});

					if(alreadyAboard){
						alert('This passenger is already aboard the stagecoach.');
						$('.name').focus();
						return;
					}

					var item = {
						name: newItemName,
						order: order,
						html: '',
						css: ''
					};
					_model.items.push(item);
					$('.name').val('');
				});

				$('.container')
				.on('click', '.delete', function(){
					var c = confirm('It\'s dangerous off the coach, do you really want to kick this passenger off?  Click Ok to put on your spurs.');
					if(c){
						var item = ko.dataFor(this);
						$.ajax({
							url: '/r',
							type: 'POST',
							data: ko.toJSON(item),
							contentType: 'application/json',
							success: function(){
							},
							error: function(jqXHR, textStatus, errorThrown){
								console.log(errorThrown);
							}
						});
						_model.items.remove(item);
					}
				})
				.on('keyup', '.iHtml', function(){
					var item = ko.dataFor(this);
					item.html = $(this).val(); //hax
					updateHtml(this);
					throttleSave(this);
				})
				.on('keyup', '.iCss', function(){
					var item = ko.dataFor(this);
					item.css = $(this).val(); //hax
					updateCss(this);
					throttleSave(this);
				})
				.on('change', '.iSort', function(){
					throttleSave(this);
					sortItems();
				});

				if(_model.items().length === 0){
					var item = new Item({
						name: 'embark',
						html: '<h1>Embark</h1>',
						css: 'h1{color: #C74309;}'
					});
					_model.items.push(item);
				}
				updateOutput();
			}
		};
	}
	Stagecoach = new StagecoachViewModel();
}(jQuery));