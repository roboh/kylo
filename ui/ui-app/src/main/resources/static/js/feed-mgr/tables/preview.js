define(["require", "exports", "angular", "./module-name"], function (require, exports, angular, module_name_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var directive = function () {
        return {
            restrict: "EA",
            bindToController: {
                defaultSchemaName: '@',
                defaultTableName: '@',
                datasourceId: '@'
            },
            controllerAs: 'vm',
            scope: {},
            templateUrl: 'js/feed-mgr/tables/preview.html',
            controller: "PreviewController",
            link: function ($scope, element, attrs, controller) {
            }
        };
    };
    var PreviewController = /** @class */ (function () {
        function PreviewController($scope, $http, FeedService, RestUrlService, HiveService, FattableService, DatasourcesService) {
            this.$scope = $scope;
            this.$http = $http;
            this.FeedService = FeedService;
            this.RestUrlService = RestUrlService;
            this.HiveService = HiveService;
            this.FattableService = FattableService;
            this.DatasourcesService = DatasourcesService;
            var self = this;
            this.model = {};
            this.loading = false;
            this.limitOptions = [10, 50, 100, 500, 1000];
            this.limit = this.limitOptions[1];
            this.loading = false;
            //noinspection JSUnusedGlobalSymbols
            this.onLimitChange = function (item) {
                self.query();
            };
            this.query = function () {
                // console.log('query');
                self.loading = true;
                var successFn = function (tableData) {
                    // console.log('got response', tableData);
                    var result = self.queryResults = HiveService.transformQueryResultsToUiGridModel(tableData);
                    FattableService.setupTable({
                        tableContainerId: "preview-table",
                        headers: result.columns,
                        rows: result.rows
                    });
                    self.loading = false;
                };
                var errorFn = function (err) {
                    self.loading = false;
                };
                if (self.defaultSchemaName != null && self.defaultTableName != null) {
                    if (self.rowsPerPage == null) {
                        self.rowsPerPage = 50;
                    }
                    var promise;
                    if (self.datasource.isHive) {
                        promise = HiveService.queryResult('SELECT * FROM ' + self.defaultSchemaName + "." + self.defaultTableName + " LIMIT " + self.limit);
                    }
                    else {
                        promise = DatasourcesService.preview(self.datasourceId, self.defaultSchemaName, self.defaultTableName, self.limit);
                    }
                }
                promise.then(successFn, errorFn);
            };
            function getDatasource(datasourceId) {
                self.loading = true;
                var successFn = function (response) {
                    self.datasource = response;
                    self.loading = false;
                };
                var errorFn = function (err) {
                    self.loading = false;
                };
                return DatasourcesService.findById(datasourceId).then(successFn, errorFn);
            }
            getDatasource(self.datasourceId).then(self.query);
        }
        ;
        return PreviewController;
    }());
    exports.PreviewController = PreviewController;
    angular.module(module_name_1.moduleName).controller('PreviewController', ["$scope", "$http", "FeedService", "RestUrlService", "HiveService", "FattableService", "DatasourcesService", PreviewController]);
    angular.module(module_name_1.moduleName)
        .directive('thinkbigPreview', directive);
});
//# sourceMappingURL=preview.js.map