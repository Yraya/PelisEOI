(function () {
    'use strict';

    angular.module('PelisEOI')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', 'MoviesFactory'];
    
    function HomeController($scope, MoviesFactory) {
        $scope.getModal = getModal;
        $scope.slider = {
            minValue: 2000,
            maxValue: 2017,
            options: {
                floor: 1960,
                ceil: 2017,
                step: 1
            }
        };
        
        init();


        function init() {
            MoviesFactory.init()
                .then(function() {
                return MoviesFactory.getMoviesPreview()
            }).then(function(moviesPreview){
                $scope.movies = moviesPreview;
            }).then(function(){
               $scope.moviesFound = MoviesFactory.getMoviesFound()
            });
        }

        function getModal(movie) {
            $scope.movieTitle = movie.title;
            $scope.movieOverview = movie.overview;
            $scope.movieCover = movie.cover;
            
            //$scope.movieRuntime = MoviesFactory.getMovieDetails(movie.id);
            //$scope.movieTrailer = MoviesFactory.getMovieTrailer(movie.id);
            
            
            // Get the modal
            var modal = document.getElementById('movie-details-modal');

            // Get the buttons that opens the modal
            var btns = document.getElementsByClassName("cover-button");

            // Get the <span> element that closes the modal
            var span = document.getElementsByClassName("close")[0];

            // When the user clicks the button, open the modal 
            modal.style.display = "block";

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