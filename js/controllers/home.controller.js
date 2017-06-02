(function () {
    'use strict';

    angular.module('PelisEOI')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope'];
    
    function HomeController($scope) {
        $scope.getModal = getModal;
        $scope.slider = {
            minValue: 1958,
            maxValue: 2017,
            options: {
                floor: 1878,
                ceil: 2017,
                step: 1
            }
        };
        
        init();


        function init() {

        }

        function getModal() {

            // Get the modal
            var modal = document.getElementById('movie-details-modal');

            // Get the buttons that opens the modal
            var btns = document.getElementsByClassName("cover-button");

            // Get the <span> element that closes the modal
            var span = document.getElementsByClassName("close")[0];

            // When the user clicks the button, open the modal 
            for (var i=0; i < btns.length; i++){
                btns[i].onclick = function () {
                    modal.style.display = "block";
                }
            }

            // When the user clicks on <span> (x), close the modal
            span.onclick = function () {
                modal.style.display = "none";
            }

            // When the user clicks anywhere outside of the modal, close it
            window.onclick = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
        }
    }

})();