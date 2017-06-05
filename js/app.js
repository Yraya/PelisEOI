angular.module('PelisEOI', ['rzModule']).config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist(['**']);
});