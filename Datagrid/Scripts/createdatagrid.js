define(function (require) {
    var $ = require('jquery');
    var _ = require('underscore');
    var options;
    var data;
    var dataGrid;

    this.init = function(_options, _data) {
        options = _options;
        data = _data;
    }

    this.destroy = function () {
        if (options.gridID !== '') {
            dataGrid.repeater('destroy');
        } else {
            alert("Grid not initialized");
        }
    }

    this.load = function () {
        var columns = options.columns;
        var dataSource, filtering;

        require('bootstrap');
        require('fuelux/combobox');
        require('fuelux/infinite-scroll');
        require('fuelux/selectlist');
        require('fuelux/repeater');
        require('fuelux/repeater-list');
        require('moment');

        dataSource = function (options, callback) {
            var items = filtering(options);
            var resp = {
                count: items.length,
                items: [],
                page: options.pageIndex,
                pages: Math.ceil(items.length / (options.pageSize || 50))
            };
            var i, items, l;

            i = options.pageIndex * (options.pageSize || 50);
            l = i + (options.pageSize || 50);
            l = (l <= resp.count) ? l : resp.count;
            resp.start = i + 1;
            resp.end = l;

            if (options.view === 'list') {
                if (options.view === 'list') {
                    resp.columns = columns;
                    for (i; i < l; i++) {
                        resp.items.push(items[i]);
                    }
                } 

                setTimeout(function () {
                    callback(resp);
                });
            }
        };

        filtering = function (options) {
            var items = $.extend([], data);
            var search;

            if (options.search) {
                search = options.search.toLowerCase();
                items = _.filter(items, function (item) {
                    var result = false;
                    for (var key in item) {
                        if (item[key] !== null) {
                            var val = ""+ item[key] +"";

                            if (val.toLowerCase().search(options.search) >= 0) {
                                result = true;
                            }
                        }
                    }

                    return  result;
                });
            }
            if (options.sortProperty) {
                items = _.sortBy(items, function (item) {
                    var value = item[options.sortProperty];

                    if (Date.parse(value)) {
                        return new Date(value);
                    } else if (isIntOrFloat(value)) {
                        if (!isFloat(value)) {
                            return parseInt(value);
                        } else {
                            return parseFloat(value);
                        }
                    } else {
                        return value;
                    }
                });
                if (options.sortDirection === 'desc') {
                    items.reverse();
                }
            }

            function isIntOrFloat(n) {
                return !isNaN(parseFloat(n)) && isFinite(n);
            }

            function isFloat(value) {
                return (!isNaN(value) && value.toString().indexOf('.') != -1);
            }

            return items;
        };

        dataGrid = $("#" + options.gridID);

        dataGrid.repeater({
            dataSource: dataSource
        });
    }

    return {
        Init: function (_options,_data) {
            init(_options, _data);
        },
        Load: function() {
            load();
        }
    };
 });