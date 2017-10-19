define(["require", "exports", "angular"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var moduleName = require("feed-mgr/visual-query/module-name");
    var WranglerDataService = (function () {
        function WranglerDataService() {
            /**
             * The sort direction.
             */
            this.sortDirection_ = null;
            /**
             * The index of the column being sorted.
             */
            this.sortIndex_ = null;
        }
        /**
         * Gets the value for the specified cell.
         *
         * @param {number} i the row number
         * @param {number} j the column number
         * @returns {VisualQueryTableCell|null} the cell object
         */
        WranglerDataService.prototype.getCellSync = function (i, j) {
            var column = this.columns_[j];
            if (i >= 0 && i < this.rows_.length) {
                return {
                    column: j,
                    row: i,
                    value: this.rows_[i][column.name]
                };
            }
            else {
                return null;
            }
        };
        /**
         * Gets the header of the specified column.
         *
         * @param {number} j the column number
         * @returns {VisualQueryTableHeader|null} the column header
         */
        WranglerDataService.prototype.getHeaderSync = function (j) {
            if (j >= 0 && j < this.columns_.length) {
                return angular.extend(this.columns_[j], {
                    field: this.columns_[j].name,
                    index: j,
                    sort: {
                        direction: (this.sortIndex_ === j) ? this.sortDirection_ : null
                    }
                });
            }
            else {
                return null;
            }
        };
        return WranglerDataService;
    }());
    exports.WranglerDataService = WranglerDataService;
    angular.module(moduleName).service("WranglerDataService", WranglerDataService);
});
//# sourceMappingURL=wrangler-data.service.js.map