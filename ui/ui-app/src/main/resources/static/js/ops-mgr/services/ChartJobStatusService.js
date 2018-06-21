define(["require", "exports", "angular", "../module-name"], function (require, exports, angular, module_name_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ChartJobStatusService = /** @class */ (function () {
        function ChartJobStatusService(IconService, Nvd3ChartService) {
            var _this = this;
            this.IconService = IconService;
            this.Nvd3ChartService = Nvd3ChartService;
            this.renderEndUpdated = {};
            this.toChartData = function (jobStatusCountResponse) {
                return _this.Nvd3ChartService.toLineChartData(jobStatusCountResponse, [{ label: 'status', value: 'count' }], 'date', _this.IconService.colorForJobStatus);
            };
            this.shouldManualUpdate = function (chart) {
                if (_this.renderEndUpdated[chart] == undefined) {
                    _this.renderEndUpdated[chart] = chart;
                    return true;
                }
                else {
                    return false;
                }
            };
        }
        return ChartJobStatusService;
    }());
    exports.default = ChartJobStatusService;
    angular.module(module_name_1.moduleName)
        .service('ChartJobStatusService', ["IconService", "Nvd3ChartService", ChartJobStatusService]);
});
//# sourceMappingURL=ChartJobStatusService.js.map