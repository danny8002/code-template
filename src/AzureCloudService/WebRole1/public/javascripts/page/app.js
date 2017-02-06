/**
 * @namespace SP.Directive
*/
(function (exports) {

    exports.spIframe = function () {

        function link(scope, element) {
            var iframe = document.createElement('iframe');
            var e0 = element[0];
            e0.appendChild(iframe);

            var body = iframe.contentDocument.body;

            scope.$watch('content', function () {
                body.innerHTML = scope.content;
            });
        }

        return {
            link: link,
            restrict: 'E',
            scope: {
                content: '='
            }
        }
    }

    exports.spEnter = function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.spEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    }

})(SP.Directive || (SP.Directive = {}));

/**
 * @namespace SP.Dataset
 * depends on SP.String
 * lazy depends on jQuery SignalR
*/
(function (exports) {

    exports.getSharedApp = function() {
        var app = angular.module('SatoriPortal', ['ngCookies', 'ui.bootstrap'])
            .config(['$cookiesProvider', function($cookiesProvider) {
                $cookiesProvider.defaults.path = '/';
                $cookiesProvider.defaults.secure = false;
            }]);
        //app.controller('headerCtrl', SP.Header.HeaderCtrl);

        app.directive('spIframe', SP.Directive.spIframe);
        app.directive('spEnter', SP.Directive.spEnter);

        return app;
    }

})(SP.App || (SP.App = {}));