var app = angular.module('app');

app.controller('fbController', ['$scope', '$q', 'fbService', 'notifyService', 'storageService',
        function ($scope, $q, fbService, notifyService, storageService) {

            $scope.userStatus = '';
            $scope.message = '';
            $scope.link = '';
            $scope.groupId = '';
            $scope.userId = '';
            $scope.savedGroups = [];

            fbService.init()
                .then(function (response) { Materialize.toast(response, 2000); })
                .then(fbService.getStatus)
                .then(function (response) {
                    NProgress.start();
                    $scope.userId = response.id;
                    $scope.userStatus = 'Logging in as: ' + response.name + '!';
                    return response.id;
                })
                .then(storageService.getSavedGroups)
                .then(function (result) {
                    $scope.savedGroups = result;
                    notifyService.shortNotify(result.length + ' groups loaded.');
                    NProgress.done();
                });

            $scope.login = function () {
                fbService.login()
                    .then(function (response) {
                        NProgress.start();
                        $scope.userId = response.id;
                        $scope.userStatus = 'Logging in as: ' + response.name + '!';
                        return response.id;
                    })
                    .then(storageService.getSavedGroups)
                    .then(function (result) {
                        $scope.savedGroups = result;
                        notifyService.shortNotify(result.length + ' groups loaded.');
                        NProgress.done();
                });;
            };

            $scope.postMessage = function () {
                NProgress.start();

                var promises = $scope.savedGroups
                    .filter(function (gr) { return gr.checked; })
                    .map(function (gr) { return gr.id; })
                    .map(function (id) {
                        return fbService.postMessage(id, $scope.message, $scope.link).then(function (response) {
                            notifyService.shortNotify('Posted successful with id: ' + response.id + '.');
                            return response;
                        });
                    });

                $q.all(promises).then(function (values) {
                    notifyService.longNotify('Posted in ' + values.length + ' groups.');
                    $scope.message = '';
                    $scope.link = '';
                    NProgress.done();
                });
            };

            $scope.addGroup = function () {
                NProgress.start();
                fbService.getGroupInfo($scope.groupId)
                    .then(function (response) {
                        NProgress.done();
                        var foundGroup = $scope.savedGroups.filter(function (gr) {
                            return gr.id == $scope.groupId;
                        })[0];
                        if (foundGroup != null) {
                            notifyService.shortNotify('Group "' + response.name + '" is already added.');
                            return;
                        };

                        notifyService.longNotify('Group "' + response.name + '" added.');
                        $scope.groupId = '';
                        $scope.savedGroups.push(response);
                    });
            };

            $scope.deleteGroup = function (group) {
                $scope.savedGroups = $scope.savedGroups.filter(function (gr) {
                    return gr.id != group.id;
                });
            }

            $scope.saveGroups = function () {
                //localStorage.setItem("fbPost_savedGroup", JSON.stringify($scope.savedGroups));
                NProgress.start();
                storageService.saveGroups($scope.userId, $scope.savedGroups)
                    .then(function(result) {
                        NProgress.done();
                        notifyService.longNotify($scope.savedGroups.length + " groups saved.");
                    });
                
            }

        }]);