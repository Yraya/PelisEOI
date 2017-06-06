(function () {
    'use strict';

    angular.module('PelisEOI')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', 'MoviesFactory'];

    function HomeController($scope, MoviesFactory) {
        var YOUTUBE_BASE_PATH = "https://www.youtube.com/embed/";
        $scope.movieTrailer = YOUTUBE_BASE_PATH + "trailer-key-not-found";
        
        $scope.slider = {
            minValue: 2000,
            maxValue: 2017,
            options: {
                floor: 1960,
                ceil: 2017,
                step: 1
            }
        };
        
        $scope.getModal = getModal;
        $scope.filterByGenre = filterByGenre;

        init();


        function init() {
            $scope.posterInitalPath = MoviesFactory.getPosterInitialPath();
            MoviesFactory.getGenresList().then(function(genres){
                $scope.genresList = genres;
            });
            MoviesFactory.init()
                .then(function () {
                    return MoviesFactory.getMoviesPreview()
                }).then(function (moviesPreview) {
                    $scope.movies = moviesPreview;
                }).then(function () {
                    $scope.moviesFound = MoviesFactory.getMoviesFound()
                });
        }



        function getModal(movie) {
            $scope.movieTrailer = YOUTUBE_BASE_PATH + "trailer-key-not-found";
            $scope.aditionalTrailerInfo = "";
            $scope.movieTitle = movie.title;
            $scope.movieOverview = movie.overview;
            $scope.movieCover = movie.poster_path;
            $scope.movieYear = movie.release_year;
            $scope.movieRuntime = "-";
            $scope.movieGenres = [];
            $scope.movieVoteAverage = movie.vote_average;
            $scope.rottenTomatoes = "-";
            $scope.metacritc = "-";
            $scope.similarMoviesList = [];
            var imdbID = "none";

            MoviesFactory.getMovieDetails(movie.id).then (function(movieDetails){
                $scope.movieRuntime = processRuntime(movieDetails.runtime);
                $scope.movieGenres = movieDetails.genres;
                imdbID = movieDetails.imdb_id;
                MoviesFactory.getOmdbInfo(imdbID).then(function (data){
                    $scope.rottenTomatoes = data.Ratings[1].Value;
                    $scope.metacritc = data.Ratings[2].Value;
                });
            });
            
            MoviesFactory.getMovieTrailer(movie.id, "es").then(function (trailerKey) {
                if (trailerKey != -1) {
                    $scope.movieTrailer = YOUTUBE_BASE_PATH + trailerKey;
                } else {
                    $scope.aditionalTrailerInfo = "(No se encontraron trailers en español)";
                    MoviesFactory.getMovieTrailer(movie.id, "en-US").
                    then(function (trailerKey) {
                        if (trailerKey != -1) {
                            $scope.movieTrailer = YOUTUBE_BASE_PATH + trailerKey;
                        } else $scope.aditionalTrailerInfo = "(No se encontraron trailers en español ni inglés)";
                    });
                }
            });
            
            MoviesFactory.getSimilarMovies(movie.id).then(function (similarMovies){
                $scope.similarMoviesList = similarMovies;
            });


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
        
        function processRuntime(runtime){
            var hours = 0;
            var minutes = runtime;
            
            if (runtime > 60) {
                hours = Math.floor(runtime/60);
                minutes = runtime%60;
            }
            
            return hours+'h '+minutes+'m';
        }
        
        function filterByGenre(genreID){
            MoviesFactory.filterByGenre(genreID)
                .then(function () {
                    return MoviesFactory.getMoviesPreview()
                }).then(function (moviesPreview) {
                    $scope.movies = moviesPreview;
                }).then(function () {
                    $scope.moviesFound = MoviesFactory.getMoviesFound()
                });
        }
    }

})();