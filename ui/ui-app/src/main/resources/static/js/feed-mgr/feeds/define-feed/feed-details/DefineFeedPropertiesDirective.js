/*-
 * #%L
 * thinkbig-ui-feed-manager
 * %%
 * Copyright (C) 2017 ThinkBig Analytics
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * #L%
 */
define(["require", "exports", "angular"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var moduleName = require('feed-mgr/feeds/define-feed/module-name');
    var directive = function () {
        return {
            restrict: "EA",
            bindToController: {
                stepIndex: '@'
            },
            controllerAs: 'vm',
            require: ['thinkbigDefineFeedProperties', '^thinkbigStepper'],
            scope: {},
            templateUrl: 'js/feed-mgr/feeds/define-feed/feed-details/define-feed-properties.html',
            controller: "DefineFeedPropertiesController",
            link: function ($scope, element, attrs, controllers) {
                var thisController = controllers[0];
                var stepperController = controllers[1];
                thisController.stepperController = stepperController;
                thisController.totalSteps = stepperController.totalSteps;
            }
        };
    };
    var DefineFeedPropertiesController = /** @class */ (function () {
        function DefineFeedPropertiesController($scope, $http, $mdToast, RestUrlService, FeedTagService, FeedService) {
            var _this = this;
            this.$scope = $scope;
            this.$http = $http;
            this.$mdToast = $mdToast;
            this.RestUrlService = RestUrlService;
            this.FeedTagService = FeedTagService;
            this.FeedService = FeedService;
            /**
             * Sets the user fields for this feed.
             *
             * @param {Array} userProperties the user fields
             */
            this.setUserProperties = function (userProperties) {
                // Convert old user properties to map
                var oldProperties = {};
                angular.forEach(_this.model.userProperties, function (property) {
                    if (angular.isString(property.value) && property.value.length > 0) {
                        oldProperties[property.systemName] = property.value;
                    }
                });
                // Set new user properties and copy values
                _this.model.userProperties = angular.copy(userProperties);
                angular.forEach(_this.model.userProperties, function (property) {
                    if (angular.isDefined(oldProperties[property.systemName])) {
                        property.value = oldProperties[property.systemName];
                        delete oldProperties[property.systemName];
                    }
                });
                // Copy remaining old properties
                angular.forEach(oldProperties, function (value, key) {
                    _this.model.userProperties.push({ locked: false, systemName: key, value: value });
                });
            };
            this.transformChip = function (chip) {
                // If it is an object, it's already a known chip
                if (angular.isObject(chip)) {
                    return chip;
                }
                // Otherwise, create a new one
                return { name: chip };
            };
            var self = this;
            self.stepNumber = parseInt(this.stepIndex) + 1;
            self.model = FeedService.createFeedModel;
            self.feedTagService = FeedTagService;
            self.tagChips = {};
            self.tagChips.selectedItem = null;
            self.tagChips.searchText = null;
            self.isValid = true;
            if (angular.isUndefined(self.model.tags)) {
                self.model.tags = [];
            }
            // Update user fields when category changes
            $scope.$watch(function () { return self.model.category.id; }, function (categoryId) {
                if (categoryId !== null) {
                    FeedService.getUserFields(categoryId)
                        .then(self.setUserProperties);
                }
            });
        }
        ;
        return DefineFeedPropertiesController;
    }());
    exports.DefineFeedPropertiesController = DefineFeedPropertiesController;
    angular.module(moduleName).controller('DefineFeedPropertiesController', ["$scope", "$http", "$mdToast", "RestUrlService", "FeedTagService", "FeedService", DefineFeedPropertiesController]);
    angular.module(moduleName).directive('thinkbigDefineFeedProperties', directive);
});
//# sourceMappingURL=DefineFeedPropertiesDirective.js.map