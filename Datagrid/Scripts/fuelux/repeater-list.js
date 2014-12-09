/*
 * Fuel UX Repeater - List View Plugin
 * https://github.com/ExactTarget/fuelux
 *
 * Copyright (c) 2014 ExactTarget
 * Licensed under the BSD New license.
 */

// -- BEGIN UMD WRAPPER PREFACE --

// For more information on UMD visit: 
// https://github.com/umdjs/umd/blob/master/jqueryPlugin.js

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // if AMD loader is available, register as an anonymous module.
         define(['jquery', 'fuelux/repeater'], factory);
    } else {
        // OR use browser globals if AMD is not present
        factory(jQuery);
    }
}(function ($) {
// -- END UMD WRAPPER PREFACE --

    // -- BEGIN MODULE CODE HERE --
	if($.fn.repeater){

		$.fn.repeater.Constructor.prototype.clearSelectedItems = function(){
			this.$canvas.find('.repeater-list-check').remove();
			this.$canvas.find('.repeater-list-items tr.selected').removeClass('selected');
		};

		$.fn.repeater.Constructor.prototype.getSelectedItems = function(){
			var selected = [];
			this.$canvas.find('.repeater-list-items tr.selected').each(function(){
				var $item = $(this);
				selected.push({ data: $item.data('item_data'), element: $item });
			});
			return selected;
		};

		$.fn.repeater.Constructor.prototype.setSelectedItems = function(items, force){
			var selectable = this.options.list_selectable;
			var self = this;
			var data, i, $item, l;

			var eachFunc = function(){
				$item = $(this);
				data = $item.data('item_data') || {};
				if(data[items[i].property]===items[i].value){
					selectItem($item, items[i].selected);
				}
			};

			var selectItem = function($itm, select){
				select = (select!==undefined) ? select : true;
				if(select){
					if(!force && selectable!=='multi'){
						self.clearSelectedItems();
					}
					if(!$itm.hasClass('selected')){
						$itm.addClass('selected');
						$itm.find('td:first').prepend('<div class="repeater-list-check"><span class="glyphicon glyphicon-ok"></span></div>');
					}
				}else{
					$itm.find('.repeater-list-check').remove();
					$itm.removeClass('selected');
				}
			};

			if(!$.isArray(items)){
				items = [items];
			}
			if(force===true || selectable==='multi'){
				l = items.length;
			}else if(selectable){
				l = (items.length>0) ? 1 : 0;
			}else{
				l = 0;
			}
			for(i=0; i<l; i++){
				if(items[i].index!==undefined){
					$item = this.$canvas.find('.repeater-list-items tr:nth-child(' + (items[i].index + 1) + ')');
					if($item.length>0){
						selectItem($item, items[i].selected);
					}
				}else if(items[i].property!==undefined && items[i].value!==undefined){
					//lint demanded this function not be within this loop
					this.$canvas.find('.repeater-list-items tr').each(eachFunc);
				}
			}
		};

		$.fn.repeater.defaults = $.extend({}, $.fn.repeater.defaults, {
			list_columnRendered: null,
			list_columnSizing: true,
			list_columnSyncing: true,
			list_infiniteScroll: false,
			list_noItemsHTML: '',
			list_selectable: false,
			list_sortClearing: false,
			list_rowRendered: null
		});

		$.fn.repeater.views.list = {
			dataOptions: function(opts, callback){
				if(this.list_sortDirection){
					opts.sortDirection = this.list_sortDirection;
				}
				if(this.list_sortProperty){
					opts.sortProperty = this.list_sortProperty;
				}
				callback(opts);
			},
			initialize: function(helpers, callback){
				this.list_sortDirection = null;
				this.list_sortProperty = null;
				callback();
			},
			selected: function(helpers, callback){
				var infScroll = this.options.list_infiniteScroll;
				var opts;

				this.list_firstRender = true;
				this.$loader.addClass('noHeader');

				if(infScroll){
					opts = (typeof infScroll === 'object') ? infScroll : {};
					this.infiniteScrolling(true, opts);
				}

				callback({});
			},
			renderer: {
				complete: function(helpers, callback){
					columnSyncing.call(this, helpers, callback);
				},
				nested: [
					{
						complete: function(helpers, callback){
							var auto = [];
							var self = this;
							var i, l, newWidth, taken;

							if(!this.options.list_columnSizing || this.list_columnsSame){
								callback();
							}else{
								i = 0;
								taken = 0;
								helpers.item.find('td').each(function(){
									var $col = $(this);
									var isLast = ($col.next('td').length===0) ? true : false;
									var width;
									if(self.list_columns[i].width!==undefined){
										width = self.list_columns[i].width;
										$col.outerWidth(width);
										taken +=  $col.outerWidth();
										if(!isLast){
											self.list_columns[i]._auto_width = width;
										}else{
											$col.outerWidth('');
										}
									}else{
										auto.push({ col: $col, index: i, last: isLast });
									}
									i++;
								});

								l=auto.length;
								if(l>0){
									newWidth = Math.floor((this.$canvas.width() - taken) / l);
									for(i=0; i<l; i++){
										if(!auto[i].last){
											auto[i].col.outerWidth(newWidth);
											this.list_columns[auto[i].index]._auto_width = newWidth;
										}
									}
								}
								callback();
							}
						},
						render: function(helpers, callback){
							var differentColumns = function(oldCols, newCols){
								var i, j, l;
								if(!oldCols){ return true; }
								if(!newCols){ return false; }
								for(i=0, l=newCols.length; i<l; i++){
									if(!oldCols[i]){
										return true;
									}else{
										for(j in newCols[i]){
											if(oldCols[i][j]!==newCols[i][j]){
												return true;
											}
										}
									}
								}
								return false;
							};

							if(this.list_firstRender || differentColumns(this.list_columns, helpers.data.columns)){
								this.$element.find('.repeater-list-header').remove();
								this.list_columns = helpers.data.columns;
								this.list_columnsSame = false;
								this.list_firstRender = false;
								this.$loader.removeClass('noHeader');
								callback({ action: 'prepend', item: '<table class="table repeater-list-header" data-preserve="deep" role="grid" aria-readonly="true"><tr data-container="true"></tr></table>' });
							}else{
								this.list_columnsSame = true;
								callback({ skipNested: true });
							}
						},
						nested: [
							{
								render: function(helpers, callback){
									var chev = 'glyphicon-chevron';
									var chevDown = chev + '-down';
									var chevUp = chev + '-up';
									var index = helpers.index;
									var self = this;
									var subset = helpers.subset;
									var cssClass, $item, sortable, $span;

									cssClass = subset[index].cssClass;
									$item = $('<td><span class="glyphicon"></span></td>');
									$item.addClass(((cssClass!==undefined) ? cssClass : '')).prepend(subset[index].label);
									$span = $item.find('span.glyphicon:first');

									sortable = subset[index].sortable;
									if(sortable){
										$item.addClass('sortable');
										$item.on('click.fu.repeater-list', function(){
											self.list_sortProperty = (typeof sortable === 'string') ? sortable : subset[index].property;
											if($item.hasClass('sorted')){
												if($span.hasClass(chevUp)){
													$span.removeClass(chevUp).addClass(chevDown);
													self.list_sortDirection = 'desc';
												}else{
													if(!self.options.list_sortClearing){
														$span.removeClass(chevDown).addClass(chevUp);
														self.list_sortDirection = 'asc';
													}else{
														$item.removeClass('sorted');
														$span.removeClass(chevDown);
														self.list_sortDirection = null;
														self.list_sortProperty = null;
													}
												}
											}else{
												helpers.container.find('td').removeClass('sorted');
												$span.removeClass(chevDown).addClass(chevUp);
												self.list_sortDirection = 'asc';
												$item.addClass('sorted');
											}
											self.render({ clearInfinite: true, pageIncrement: null });
										});
									}
									if(subset[index].sortDirection==='asc' || subset[index].sortDirection==='desc'){
										helpers.container.find('td').removeClass('sorted');
										$item.addClass('sortable sorted');
										if(subset[index].sortDirection==='asc'){
											$span.addClass(chevUp);
											this.list_sortDirection = 'asc';
										}else{
											$span.addClass(chevDown);
											this.list_sortDirection = 'desc';
										}
										this.list_sortProperty = (typeof sortable === 'string') ? sortable : subset[index].property;
									}

									callback({ item: $item });
								},
								repeat: 'data.columns'
							}
						]
					},
					{
						after: function(helpers, callback){
							var canvas = this.$canvas;
							var header = canvas.find('.repeater-list-header');
							if(this.staticHeight){
								helpers.item.height(canvas.height()-header.outerHeight());
							}
							callback();
						},
						render: function(helpers, callback){
							var $item = this.$canvas.find('.repeater-list-wrapper');
							var obj = {};
							var $empty;
							if($item.length>0){
								obj.action = 'none';
							}else{
								$item = $('<div class="repeater-list-wrapper" data-infinite="true"><table class="table repeater-list-items" data-container="true" role="grid" aria-readonly="true"></table></div>');
							}
							obj.item = $item;
							if(helpers.data.items.length<1){
								obj.skipNested = true;
								$empty = $('<tr class="empty"><td></td></tr>');
								$empty.find('td').append(this.options.list_noItemsHTML);
								$item.find('.repeater-list-items').append($empty);
							}else{
								$item.find('.repeater-list-items tr.empty:first').remove();
							}
							callback(obj);
						},
						nested: [
							{
								complete: function(helpers, callback){
									var obj = { container: helpers.container };
									if(helpers.item!==undefined){
										obj.item = helpers.item;
									}
									if(this.options.list_rowRendered){
										this.options.list_rowRendered(obj, function(){
											callback();
										});
									}else{
										callback();
									}
								},
								render: function(helpers, callback){
									var $item = $('<tr data-container="true"></tr>');
									var self = this;

									if(this.options.list_selectable){
										$item.addClass('selectable');
										$item.attr('tabindex', 0);	// allow items to be tabbed to / focused on
										$item.data('item_data', helpers.subset[helpers.index]);
										$item.on('click.fu.repeater-list', function() {
											var $row = $(this);
											if($row.hasClass('selected')){
												$row.removeClass('selected');
												$row.find('.repeater-list-check').remove();
												self.$element.trigger('itemDeselected.fu.repeater', $row);
											}else{
												if(self.options.list_selectable!=='multi'){
													self.$canvas.find('.repeater-list-check').remove();
													self.$canvas.find('.repeater-list-items tr.selected').each(function(){
														$(this).removeClass('selected');
														self.$element.trigger('itemDeselected.fu.repeater', $(this));
													});
												}
												$row.addClass('selected');
												$row.find('td:first').prepend('<div class="repeater-list-check"><span class="glyphicon glyphicon-ok"></span></div>');
												self.$element.trigger('itemSelected.fu.repeater', $row);
											}
										});
										// allow selection via enter key
										$item.keyup(function (e) {
											if (e.keyCode === 13) {
												$item.trigger('click.fu.repeater-list');
											}
										});
									}

									this.list_curRowIndex = helpers.index;
									callback({ item: $item });
								},
								repeat: 'data.items',
								nested: [
									{
										after: function(helpers, callback){
											var obj = { container: helpers.container };
											if(helpers.item!==undefined){
												obj.item = helpers.item;
											}
											if(this.options.list_columnRendered){
												this.options.list_columnRendered(obj, function(){
													callback();
												});
											}else{
												callback();
											}
										},
										render: function(helpers, callback){
										    var cssClass = helpers.subset[helpers.index].cssClass;
										    var html = helpers.data.columns[helpers.index].html;
										    var format = helpers.data.columns[helpers.index].format;

										    var content = helpers.data.items[this.list_curRowIndex][helpers.subset[helpers.index].property];

										    var $item = $('<td></td>');

										    if (html !== undefined) {
										        var queryArr = extractKeys(html);
										        for (var j = 0; j < queryArr.length; j++) {
										            var valToReplace = helpers.data.items[this.list_curRowIndex][queryArr[j]];

										            html = replaceAll("{" + queryArr[j] + "}", valToReplace, html);
										        }
										        content = html;
										    }

										    function replaceAll(find, replace, str) {
										        return str.replace(new RegExp(find, 'g'), replace);
										    }

										    function extractKeys(data) {
										        var oResult = [];
										        var keyValuePair = data.split("{");

										        for (var i = 1; i < keyValuePair.length; i++) {
										            var aTemp = keyValuePair[i].split("}");
										            oResult.push(unescape(aTemp[0]));
										        }
										        return oResult;
										    }

                                            //Format the data
                                            if (format !== undefined) {
                                                switch (format) {
                                                    case "b":
                                                        if (content) {
                                                            content = "Yes";
                                                        } else {
                                                            content = "No";
                                                        }
                                                        break;
                                                    case "d":
                                                        if (Date.parse(content)) {
                                                            content = moment(content).format("Do MMMM YYYY h:mm a");
                                                        }
                                                        break;
                                                    case "m":
                                                        content = "R " + content;
                                                        break;
                                                    case "email":
                                                        content = "<a href='mailto:" + content + "'>" + content + "</a>";
                                                        break;
                                                    case "a":
                                                        content = "<a href='" + content + "' target='_blank'>" + content + "</a>";
                                                        break;
                                                    case "json":
                                                        content = convertJsonObjToTable(content);
                                                        break;
                                                }
                                            }
											
											var width = helpers.subset[helpers.index]._auto_width;

											$item.addClass(((cssClass!==undefined) ? cssClass : '')).append(content);
											if(width !== undefined){
												$item.outerWidth(width);
											}
											callback({ item: $item });
										},
										repeat: 'this.list_columns'
									}
								]
							}
						]
					}
				]
			},
			resize: function(helpers, callback){
				columnSyncing.call(this, { data: { items: [''] } }, callback);
			}
		};

		function convertJsonObjToTable(objArray, enableHeader) {
		    if (enableHeader === undefined) {
		        enableHeader = true; //default enable headers
		    }

		    // If the returned data is an object do nothing, else try to parse
		    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

		    var str = '<table>';

		    // table head
		    if (enableHeader) {
		        str += '<thead><tr>';
		        for (var index in array[0]) {
		            str += '<th scope="col">' + index + '</th>';
		        }
		        str += '</tr></thead>';
		    }

		    // table body
		    str += '<tbody>';
		    for (var i = 0; i < array.length; i++) {
		        str += (i % 2 == 0) ? '<tr class="alt">' : '<tr>';
		        for (var index in array[i]) {
		            str += '<td>' + array[i][index] + '</td>';
		        }
		        str += '</tr>';
		    }
		    str += '</tbody>';
		    str += '</table>';
		    return str;
		}

		var columnSyncing = function(helpers, callback){
			var i = 0;
			var widths = [];
			var $header, $items;

			if(!this.options.list_columnSyncing || (helpers.data.items.length<1)){
				callback();
			}else{
				$header = this.$element.find('.repeater-list-header:first');
				$items = this.$element.find('.repeater-list-items:first');
				$items.find('tr:first td').each(function(){
					widths.push($(this).outerWidth());
				});
				widths.pop();
				$header.find('td').each(function(){
					if(widths[i]!==undefined){
						$(this).outerWidth(widths[i]);
					}
					i++;
				});
				callback();

			    $.event.trigger({
			        type: "repeaterRenderComplete",
			        gridID: $header.context.id
			    });
			}
		};
	}

// -- BEGIN UMD WRAPPER AFTERWORD --
}));
// -- END UMD WRAPPER AFTERWORD --