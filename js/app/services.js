var app = angular.module('app');

app.factory('notifyService', [function () {
            return {
                shortNotify: function (message) {
                    Materialize.toast(message, 3000);
                },
                longNotify: function (message) {
                    Materialize.toast(message, 6000);
                },
                customNotify: function (message, time) {
                    Materialize.toast(message, time);
                }
            };
        }
        ]);

        //Store save group in mongo lab
        app.factory('storageService', ['$http', '$q', function ($http, $q) {
            var apiKey = 'Rds2DpkLY7_VqsMfmgfSo_EdzafbQvOs';
            var apiLink = 'https://api.mongolab.com/api/1/databases/fb_group_post/collections/users';

            return {
                getSavedGroups: function (userId) {
                    var df = $q.defer();
                    var requestLink = apiLink + '?apiKey=' + apiKey + '&q={"id":"' + userId + '"}';
                    $http.get(requestLink).success(function (result) {
                        if (result.length == 0) {
                            df.resolve([]);
                        }
                        df.resolve(result[0].groups);
                    });

                    return df.promise;
                },
                saveGroups: function (userId, groups) {
                    //var df = $q.defer();
                    var requestLink = apiLink + '?apiKey=' + apiKey + '&q={"id":"' + userId + '"}';
                    var data = { "$set": { "groups": groups }};

                    return $http.put(requestLink, data);

                    //return df.promise;
                },
            };
        }
        ]);

        //Initialize Facebook service
        app.factory('fbService', ['$window', '$q', function ($window, $q) {
            return {
                init: function () {
                    var df = $q.defer();
                    $window.fbAsyncInit = function () {
                        FB.init({
                            appId: '1427665520889672',
                            cookie: true,
                            xfbml: false,
                            version: 'v2.2'
                        });
                        df.resolve("Facebook SDK Loaded.");
                    };
                    return df.promise;
                },
                getStatus: function () {
                    var df = $q.defer();
                    FB.getLoginStatus(function (response) {
                        if (response.status === 'connected') {
                            FB.api('/me', function (apiResponse) {
                                df.resolve(apiResponse);
                            });
                        } else if (response.status === 'not_authorized') {
                            df.reject('Please log into this app.');
                        } else {
                            df.reject('Please log into facebook');
                        };
                    });
                    return df.promise;
                },
                login: function () {
                    var df = $q.defer();
                    FB.login(function (response) {
                        if (response.status === 'connected') {
                            FB.api('/me', function (apiResponse) {
                                df.resolve(apiResponse);
                            });
                        } else if (response.status === 'not_authorized') {
                            df.reject('Please log into this app.');
                        } else {
                            df.reject('Please log into facebook');
                        };
                    }, { scope: 'public_profile,email,publish_actions,publish_stream' });
                    return df.promise;
                },

                postMessage: function (groupId, message, link) {
                    var df = $q.defer();
                    FB.api("/" + groupId + "/feed", "POST", { "message": message, "link": link },
                        function (response) {
                            if (response && !response.error) {
                                df.resolve(response);
                            } else {
                                df.reject(response);
                            }
                        }
                    );
                    return df.promise;
                },

                getGroupInfo: function (groupId) {
                    var df = $q.defer();

                    FB.api("/" + groupId,
                        { fields: 'id,name,description,cover' },
                            function (response) {
                                if (response && !response.error) {
                                    df.resolve(response);
                                }
                            }
                    );
                    return df.promise;
                }
            };
        }
        ]);
