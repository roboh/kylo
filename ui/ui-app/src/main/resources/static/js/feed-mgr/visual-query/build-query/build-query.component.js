var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define(["require", "exports", "@angular/core", "angular", "underscore", "../services/query-engine"], function (require, exports, core_1, angular, _, query_engine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var moduleName = require("feed-mgr/visual-query/module-name");
    /**
     * Code for the delete key.
     */
    var DELETE_KEY_CODE = 46;
    /**
     * Code for control key.
     */
    var CTRL_KEY_CODE = 17;
    /**
     * Code for A key.
     */
    var A_KEY_CODE = 65;
    /**
     * Code for esc key.
     */
    var ESC_KEY_CODE = 27;
    /**
     * Displays the Build Query step of the Visual Query page.
     *
     * There are two modes for how the user may build their query:
     *
     * - Visual Mode - (default) A {@code QueryEngine} is used to retrieve a list of tables and the schema is displayed in a flow chart. The nodes in the flow chart can be connected to create joins
     * between tables.
     *
     * - Advanced Mode - A textarea is provided for the user to input their query.
     */
    var QueryBuilderComponent = (function () {
        /**
         * Constructs a {@code BuildQueryComponent}.
         */
        function QueryBuilderComponent($scope, $element, $mdToast, $mdDialog, $document, Utils, RestUrlService, HiveService, SideNavService, StateService, VisualQueryService, FeedService, DatasourcesService) {
            this.$scope = $scope;
            this.$mdToast = $mdToast;
            this.$mdDialog = $mdDialog;
            this.$document = $document;
            this.Utils = Utils;
            this.RestUrlService = RestUrlService;
            this.HiveService = HiveService;
            this.SideNavService = SideNavService;
            this.StateService = StateService;
            this.VisualQueryService = VisualQueryService;
            this.FeedService = FeedService;
            this.DatasourcesService = DatasourcesService;
            /**
             * Indicates if the UI is in advanced mode
             */
            this.advancedMode = false;
            /**
             * List of data sources to display.
             */
            this.availableDatasources = [];
            /**
             * Indicates that there was an error retrieving the list of tables.
             * @type {boolean} true if there was an error or false otherwise
             */
            this.databaseConnectionError = false;
            /**
             * Height offset from the top of the page.
             */
            this.heightOffset = "0";
            /**
             * Indicates if the model is valid.
             */
            this.isValid = false;
            /**
             * Indicates that the page is being loaded.
             */
            this.loadingPage = true;
            /**
             * Indicates that a table schema is being loaded.
             */
            this.loadingSchema = false;
            /**
             * Next node id.
             */
            this.nextNodeID = 10;
            /**
             * List of the data sources used in model.
             * @type {Array.<string>}
             */
            this.selectedDatasourceIds = [];
            /**
             * holds the metadata about each column and table that is used to build the SQL str in the getSQLModel() method
             */
            this.selectedColumnsAndTables = [];
            /**
             * Autocomplete for the table selector.
             */
            this.tablesAutocomplete = {
                clear: this.onAutocompleteClear.bind(this),
                searchText: "",
                selectedTable: null,
                noCache: true,
                querySearch: this.onAutocompleteQuerySearch.bind(this),
                refreshCache: this.onAutocompleteRefreshCache.bind(this)
            };
            /**
             * List of native data sources to exclude from the model.
             */
            this.nativeDataSourceIds = [];
            // Setup initializers
            this.$scope.$on("$destroy", this.ngOnDestroy.bind(this));
            this.initKeyBindings();
            // Setup environment
            this.heightOffset = $element.attr("height-offset");
            this.SideNavService.hideSideNav();
        }
        /**
         * Get or set the SQL for the advanced mode.
         */
        QueryBuilderComponent.prototype.advancedModeSql = function (sql) {
            if (sql === void 0) { sql = null; }
            if (sql !== null) {
                this.model.sql = sql;
                this.validate();
            }
            return this.model.sql;
        };
        /**
         * Indicates if the active datasource can be changed.
         */
        QueryBuilderComponent.prototype.canChangeDatasource = function () {
            return (this.error == null && (this.engine.allowMultipleDataSources || this.selectedDatasourceIds.length === 0));
        };
        /**
         * Gets the browser height offset for the element with the specified offset from the top of this component.
         */
        QueryBuilderComponent.prototype.getBrowserHeightOffset = function (elementOffset) {
            return parseInt(this.heightOffset) + elementOffset;
        };
        /**
         * Adds the table to the flowchart.
         */
        QueryBuilderComponent.prototype.onAddTable = function () {
            this.SideNavService.hideSideNav();
            this.onTableClick(this.tablesAutocomplete.selectedTable);
            this.tablesAutocomplete.clear();
        };
        /**
         * Initialize state from services.
         */
        QueryBuilderComponent.prototype.init = function () {
            var self = this;
            // Get the list of data sources
            Promise.all([self.engine.getNativeDataSources(), this.DatasourcesService.findAll()])
                .then(function (resultList) {
                self.nativeDataSourceIds = resultList[0].map(function (dataSource) { return dataSource.id; });
                var supportedDatasources = resultList[0].concat(resultList[1]).filter(self.engine.supportsDataSource);
                if (supportedDatasources.length > 0) {
                    return supportedDatasources;
                }
                else {
                    var supportedNames = (function (supportedNameList) {
                        if (supportedNameList.length === 0) {
                            return "";
                        }
                        else if (supportedNameList.length === 1) {
                            return "Please create a " + supportedNameList[0] + " data source and try again.";
                        }
                        else {
                            return "Please create one of the following data sources and try again: " + supportedNameList.join(", ");
                        }
                    })(self.engine.getSupportedDataSourceNames());
                    throw new Error("No supported data sources were found. " + supportedNames);
                }
            })
                .then(function (datasources) {
                self.availableDatasources = datasources;
                if (self.model.$selectedDatasourceId == null) {
                    self.model.$selectedDatasourceId = datasources[0].id;
                }
                self.validate();
            })
                .catch(function (err) {
                self.error = err;
            })
                .then(function () {
                self.loadingPage = false;
            });
        };
        /**
         * Initialize the key bindings.
         */
        QueryBuilderComponent.prototype.initKeyBindings = function () {
            var self = this;
            //
            // Set to true when the ctrl key is down.
            //
            var ctrlDown = false;
            //
            // Event handler for key-down on the flowchart.
            //
            this.$document.bind('keydown', function (evt) {
                if (evt.keyCode === CTRL_KEY_CODE) {
                    ctrlDown = true;
                    evt.stopPropagation();
                    evt.preventDefault();
                }
            });
            //
            // Event handler for key-up on the flowchart.
            //
            this.$document.bind('keyup', function (evt) {
                if (evt.keyCode === DELETE_KEY_CODE) {
                    //
                    // Delete key.
                    //
                    self.chartViewModel.deleteSelected();
                    self.validate();
                }
                if (evt.keyCode == A_KEY_CODE && ctrlDown) {
                    //
                    // Ctrl + A
                    //
                    self.chartViewModel.selectAll();
                }
                if (evt.keyCode == ESC_KEY_CODE) {
                    // Escape.
                    self.chartViewModel.deselectAll();
                }
                if (evt.keyCode === CTRL_KEY_CODE) {
                    ctrlDown = false;
                    evt.stopPropagation();
                    evt.preventDefault();
                }
            });
        };
        /**
         * Initialize the model for the flowchart.
         */
        QueryBuilderComponent.prototype.setupFlowChartModel = function () {
            var self = this;
            // Load data model
            var chartDataModel;
            if (this.model.chartViewModel != null) {
                chartDataModel = this.model.chartViewModel;
            }
            else {
                chartDataModel = { "nodes": [], "connections": [] };
            }
            // Prepare nodes
            angular.forEach(chartDataModel.nodes, function (node) {
                // Add utility functions
                self.prepareNode(node);
                // Determine next node ID
                self.nextNodeID = Math.max(node.id + 1, self.nextNodeID);
            });
            // Create view model
            this.chartViewModel = new flowchart.ChartViewModel(chartDataModel, this.onCreateConnectionCallback.bind(this), this.onEditConnectionCallback.bind(this), this.onDeleteSelectedCallback.bind(this));
        };
        /**
         * Called after a user Adds a table to fetch the Columns and datatypes.
         * @param schema - the schema name
         * @param table - the table name
         */
        QueryBuilderComponent.prototype.getTableSchema = function (schema, table) {
            var self = this;
            return this.engine.getTableSchema(schema, table, this.model.$selectedDatasourceId)
                .then(function (tableSchema) {
                self.loadingSchema = false;
                return tableSchema;
            });
        };
        /**
         * Validate the canvas.
         * If there is at least one table defined, it is valid
         * TODO enhance to check if there are any tables without connections
         */
        QueryBuilderComponent.prototype.validate = function () {
            var self = this;
            if (this.advancedMode) {
                var sql = this.advancedModeSql();
                this.isValid = (typeof (sql) !== "undefined" && sql.length > 0);
                this.model.$selectedColumnsAndTables = null;
                this.model.chartViewModel = null;
                this.model.datasourceIds = this.nativeDataSourceIds.indexOf(this.model.$selectedDatasourceId) < 0 ? [this.model.$selectedDatasourceId] : [];
                this.model.$datasources = this.DatasourcesService.filterArrayByIds(this.model.$selectedDatasourceId, this.availableDatasources);
            }
            else if (this.chartViewModel.nodes != null) {
                this.isValid = (this.chartViewModel.nodes.length > 0);
                this.model.chartViewModel = this.chartViewModel.data;
                this.model.sql = this.getSQLModel();
                this.model.$selectedColumnsAndTables = this.selectedColumnsAndTables;
                this.model.datasourceIds = this.selectedDatasourceIds.filter(function (id) { return self.nativeDataSourceIds.indexOf(id) < 0; });
                this.model.$datasources = this.DatasourcesService.filterArrayByIds(this.selectedDatasourceIds, this.availableDatasources);
            }
            else {
                this.isValid = false;
            }
        };
        QueryBuilderComponent.prototype.getNewXYCoord = function () {
            var coord = { x: 20, y: 20 };
            //attempt to align it on the top
            if (this.chartViewModel.data.nodes.length > 0) {
                //constants
                var yThreshold_1 = 150;
                var tableWidth_1 = 250;
                //reduce the set to just show those in the top row
                var tables = _.filter(this.chartViewModel.data.nodes, function (table) {
                    return table.y <= yThreshold_1;
                });
                //sort by x then y (underscore sort is reverse thinking)
                tables = _.chain(tables).sortBy('y').sortBy('x').value();
                var lastX_1 = coord.x;
                _.some(tables, function (table) {
                    //if this table is within the top row
                    //move over to find the next X position on the top row that is open
                    if (table.x < lastX_1 + tableWidth_1) {
                        lastX_1 = table.x + table.width;
                    }
                    else {
                        //break out
                        return true;
                    }
                });
                if (lastX_1 > 20) {
                    //add padding
                    lastX_1 += 20;
                }
                coord.x = lastX_1;
            }
            return coord;
        };
        /**
         * Turn on SQL mode.
         */
        QueryBuilderComponent.prototype.toggleAdvancedMode = function () {
            var self = this;
            if (this.advancedMode === false) {
                var goAdvanced = function () {
                    self.advancedMode = true;
                    self.advancedModeText = "Visual Mode";
                };
                if (this.chartViewModel.nodes.length > 0) {
                    this.$mdDialog.show(this.$mdDialog.confirm()
                        .parent($("body"))
                        .clickOutsideToClose(true)
                        .title("Switch to advanced mode")
                        .textContent("If you switch to the advanced SQL editor then you will no longer be able to return to this visual editor. Are you sure you want to continue?")
                        .ariaLabel("Switch to advanced mode or stay in visual editor?")
                        .ok("Continue")
                        .cancel("Cancel")).then(goAdvanced);
                }
                else {
                    goAdvanced();
                }
            }
            else {
                this.advancedMode = false;
                this.model.sql = "";
                this.advancedModeText = "Advanced Mode";
            }
        };
        ;
        /**
         * Adds utility functions to a node data model.
         *
         * @param node - the node data model
         */
        QueryBuilderComponent.prototype.prepareNode = function (node) {
            var self = this;
            /**
             * Indicates if all of the attributes are selected.
             *
             * @returns {@code true} if all attributes are selected, or {@code false} otherwise
             */
            node.nodeAttributes.hasAllSelected = function () {
                return _.every(this.attributes, function (attr) {
                    return attr.selected;
                });
            };
            /**
             * Selects the specified attribute.
             *
             * @param attr - the attribute to be selected
             */
            node.nodeAttributes.select = function (attr) {
                attr.selected = true;
                this.selected.push(attr);
                self.validate();
            };
            /**
             * Selects all attributes.
             */
            node.nodeAttributes.selectAll = function () {
                var selected = [];
                angular.forEach(this.attributes, function (attr) {
                    attr.selected = true;
                    selected.push(attr);
                });
                this.selected = selected;
                self.validate();
            };
            /**
             * Deselects the specified attribute.
             *
             * @param attr - the attribute to be deselected
             */
            node.nodeAttributes.deselect = function (attr) {
                attr.selected = false;
                var idx = this.selected.indexOf(attr);
                if (idx > -1) {
                    this.selected.splice(idx, 1);
                }
                self.validate();
            };
            /**
             * Deselects all attributes.
             */
            node.nodeAttributes.deselectAll = function () {
                angular.forEach(this.attributes, function (attr) {
                    attr.selected = false;
                });
                this.selected = [];
                self.validate();
            };
        };
        ;
        //
        // Add a new node to the chart.
        //
        QueryBuilderComponent.prototype.onTableClick = function (table) {
            var self = this;
            //get attributes for table
            var datasourceId = this.model.$selectedDatasourceId;
            var nodeName = table.schema + "." + table.tableName;
            this.getTableSchema(table.schema, table.tableName).then(function (schemaData) {
                //
                // Template for a new node.
                //
                var coord = self.getNewXYCoord();
                angular.forEach(schemaData.fields, function (attr) {
                    attr.selected = true;
                    if (self.engine.useNativeDataType) {
                        attr.dataTypeWithPrecisionAndScale = attr.nativeDataType.toLowerCase();
                    }
                });
                var newNodeDataModel = {
                    name: nodeName,
                    id: self.nextNodeID++,
                    datasourceId: datasourceId,
                    x: coord.x,
                    y: coord.y,
                    nodeAttributes: {
                        attributes: schemaData.fields,
                        reference: [table.schema, table.tableName],
                        selected: []
                    },
                    connectors: {
                        top: {},
                        bottom: {},
                        left: {},
                        right: {}
                    },
                    inputConnectors: [
                        {
                            name: ""
                        }
                    ],
                    outputConnectors: [
                        {
                            name: ""
                        }
                    ]
                };
                self.prepareNode(newNodeDataModel);
                self.chartViewModel.addNode(newNodeDataModel);
                self.validate();
            });
        };
        ;
        /**
         * Parses the tables on the canvas and returns a SQL string, along with populating the self.selectedColumnsAndTables array of objects.
         *
         * @returns the SQL string or null if multiple data sources are used
         */
        QueryBuilderComponent.prototype.getSQLModel = function () {
            var builder = this.VisualQueryService.sqlBuilder(this.chartViewModel.data, this.engine.sqlDialect);
            var sql = builder.build();
            this.selectedColumnsAndTables = builder.getSelectedColumnsAndTables();
            this.selectedDatasourceIds = builder.getDatasourceIds();
            return sql;
        };
        /**
         * When a connection is edited
         */
        QueryBuilderComponent.prototype.onEditConnectionCallback = function (connectionViewModel, connectionDataModel, dest, source) {
            this.showConnectionDialog(false, connectionViewModel, connectionDataModel, source, dest);
        };
        ;
        /**
         * When a connection is created
         */
        QueryBuilderComponent.prototype.onCreateConnectionCallback = function (connectionViewModel, connectionDataModel, dest, source, inputConnection, outputConnection) {
            // Ensure connection is unique
            var newDestID = dest.data.id;
            var newSourceID = source.data.id;
            for (var i = 0; i < this.chartViewModel.data.connections.length - 1; ++i) {
                var oldDestID = this.chartViewModel.data.connections[i].dest.nodeID;
                var oldSourceID = this.chartViewModel.data.connections[i].source.nodeID;
                if ((oldDestID === newDestID && oldSourceID === newSourceID) || (oldDestID === newSourceID && oldSourceID === newDestID)) {
                    // Delete connection
                    this.chartViewModel.deselectAll();
                    connectionViewModel.select();
                    this.chartViewModel.deleteSelected();
                    // Display error message
                    var alert_1 = this.$mdDialog.alert()
                        .parent($('body'))
                        .clickOutsideToClose(true)
                        .title("Duplicate join")
                        .textContent("There is already a join between those two tables. Please edit the existing join or switch to advanced mode.")
                        .ariaLabel("joins must be unique")
                        .ok("Got it!");
                    this.$mdDialog.show(alert_1);
                    return;
                }
            }
            // Add connection
            this.showConnectionDialog(true, connectionViewModel, connectionDataModel, source, dest);
            this.validate();
        };
        ;
        /**
         * Called when the current selection is deleted.
         */
        QueryBuilderComponent.prototype.onDeleteSelectedCallback = function () {
            this.validate();
        };
        ;
        QueryBuilderComponent.prototype.showConnectionDialog = function (isNew, connectionViewModel, connectionDataModel, source, dest) {
            var self = this;
            this.chartViewModel.deselectAll();
            this.$mdDialog.show({
                controller: 'ConnectionDialog',
                templateUrl: 'js/feed-mgr/visual-query/build-query/connection-dialog/connection-dialog.component.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                fullscreen: true,
                locals: {
                    isNew: isNew,
                    connectionDataModel: connectionDataModel,
                    source: source,
                    dest: dest
                }
            })
                .then(function (msg) {
                if (msg === "delete" || (isNew && msg === "cancel")) {
                    connectionViewModel.select();
                    self.chartViewModel.deleteSelected();
                }
                self.validate();
            });
        };
        ;
        // -----------------
        // Angular Callbacks
        // -----------------
        /**
         * Cleanup environment when this directive is destroyed.
         */
        QueryBuilderComponent.prototype.ngOnDestroy = function () {
            this.SideNavService.showSideNav();
            this.$document.unbind("keydown");
            this.$document.unbind("keypress");
            this.$document.unbind("keyup");
        };
        /**
         * Finish initializing after data-bound properties are initialized.
         */
        QueryBuilderComponent.prototype.ngOnInit = function () {
            var _this = this;
            // Initialize properties dependent on data-bound properties
            this.stepNumber = this.stepIndex + 1;
            if (this.model.$selectedDatasourceId == null && this.model.datasourceIds && this.model.datasourceIds.length > 0) {
                this.model.$selectedDatasourceId = this.model.datasourceIds[0];
            }
            // Allow for SQL editing
            if (this.model.chartViewModel == null && typeof this.model.sql !== "undefined" && this.model.sql !== null) {
                this.advancedMode = true;
                this.advancedModeText = "Visual Mode";
            }
            else {
                this.advancedMode = false;
                this.advancedModeText = "Advanced Mode";
            }
            // Wait for query engine to load
            var onLoad = function () {
                // Initialize state
                _this.init();
                // Setup the flowchart Model
                _this.setupFlowChartModel();
                // Validate when the page loads
                _this.validate();
            };
            if (this.engine instanceof Promise) {
                this.engine.then(function (queryEngine) {
                    _this.engine = queryEngine;
                    onLoad();
                });
            }
            else {
                onLoad();
            }
        };
        /**
         * Finish initializing after data-bound properties are initialized.
         */
        QueryBuilderComponent.prototype.$onInit = function () {
            this.ngOnInit();
        };
        // ----------------------
        // Autocomplete Callbacks
        // ----------------------
        QueryBuilderComponent.prototype.onAutocompleteClear = function () {
            this.tablesAutocomplete.searchText = '';
            this.tablesAutocomplete.selectedTable = null;
        };
        /**
         * Search the list of table names.
         */
        QueryBuilderComponent.prototype.onAutocompleteQuerySearch = function (txt) {
            var self = this;
            var tables = this.engine.searchTableNames(txt, this.model.$selectedDatasourceId);
            if (tables instanceof Promise) {
                return tables.then(function (tables) {
                    self.databaseConnectionError = false;
                    return tables;
                }, function () {
                    self.databaseConnectionError = true;
                    return [];
                });
            }
            else {
                return tables;
            }
        };
        QueryBuilderComponent.prototype.onAutocompleteRefreshCache = function () {
            this.HiveService.init();
            var searchText = this.tablesAutocomplete.searchText.trim();
            angular.element('#tables-auto-complete').focus().val(searchText).trigger('change');
        };
        return QueryBuilderComponent;
    }());
    __decorate([
        core_1.Input(),
        __metadata("design:type", query_engine_1.QueryEngine)
    ], QueryBuilderComponent.prototype, "engine", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], QueryBuilderComponent.prototype, "model", void 0);
    exports.QueryBuilderComponent = QueryBuilderComponent;
    angular.module(moduleName).component("thinkbigVisualQueryBuilder", {
        bindings: {
            engine: "=",
            heightOffset: "@",
            model: "=",
            stepIndex: "@"
        },
        controller: ["$scope", "$element", "$mdToast", "$mdDialog", "$document", "Utils", "RestUrlService", "HiveService", "SideNavService", "StateService", "VisualQueryService", "FeedService",
            "DatasourcesService", QueryBuilderComponent],
        controllerAs: "$bq",
        require: {
            stepperController: "^thinkbigStepper"
        },
        templateUrl: "js/feed-mgr/visual-query/build-query/build-query.component.html"
    });
});
//# sourceMappingURL=build-query.component.js.map