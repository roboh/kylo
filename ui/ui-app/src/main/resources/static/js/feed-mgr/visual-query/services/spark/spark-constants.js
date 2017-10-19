define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Constants for the Spark query engine.
     */
    var SparkConstants = (function () {
        function SparkConstants() {
        }
        return SparkConstants;
    }());
    /**
     * Name of the variable containing the DataFrame.
     */
    SparkConstants.DATA_FRAME_VARIABLE = "df";
    /**
     * Identifier for the native Hive data source.
     */
    SparkConstants.HIVE_DATASOURCE = "HIVE";
    exports.SparkConstants = SparkConstants;
});
//# sourceMappingURL=spark-constants.js.map