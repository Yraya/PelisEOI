(function () {
    'use strict';

    angular.module('PelisEOI')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', 'MoviesFactory'];

    function HomeController($scope, MoviesFactory) {
        var YOUTUBE_BASE_PATH = "https://www.youtube.com/embed/";
        $scope.movieTrailer = YOUTUBE_BASE_PATH + "trailer-key-not-found";
        $scope.selectedGenresID = [];
        //$scope.enableAdultContent = false;
        
        $scope.yearSlider = {
            minValue: 1960,
            maxValue: 2025,
            options: {
                floor: 1960,
                ceil: 2025,
                step: 1,
                noSwitching: true
            }
        };
        
        $scope.tmdbSlider = {
            minValue: 0,
            maxValue: 10,
            options: {
                floor: 0,
                ceil: 10,
                step: 1,
                noSwitching: true
            }
        };
        
        $scope.deleteFilters = deleteFilters;
        $scope.getModal = getModal;
        $scope.filterByGenre = filterByGenre;
        $scope.searchMovies = searchMovies;
        $scope.filterMovies = filterMovies;
        
        init();


        function init() {
            $scope.posterInitalPath = MoviesFactory.getPosterInitialPath();
            MoviesFactory.getGenresList().then(function(genres){
                $scope.genresList = genres;
            });
            discover();
        }


        function discover(){
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
        
        function filterByGenre(genre){
            if(genre.selected) {
                genre.selected = false;
                var index = $scope.selectedGenresID.indexOf(genre.id);
                if (index !== -1) {
                    $scope.selectedGenresID.splice(index, 1);
                }
            }
            else {
                genre.selected = true;
                $scope.selectedGenresID.push(genre.id);
            }
            
            
            /*
            MoviesFactory.filterByGenre(genreID)
                .then(function () {
                    return MoviesFactory.getMoviesPreview()
                }).then(function (moviesPreview) {
                    $scope.movies = moviesPreview;
                }).then(function () {
                    $scope.moviesFound = MoviesFactory.getMoviesFound()
                });
                */
        }
        
        function searchMovies(searchKey){
            MoviesFactory.getMoviesByKey(searchKey)
                .then(function () {
                    return MoviesFactory.getMoviesPreview()
                }).then(function (moviesPreview) {
                    $scope.movies = moviesPreview;
                }).then(function () {
                    $scope.moviesFound = MoviesFactory.getMoviesFound()
                });
        }
        
        function filterMovies(){
            MoviesFactory.getFilteredMovies($scope.yearSlider.minValue, $scope.yearSlider.maxValue, $scope.tmdbSlider.minValue, $scope.tmdbSlider.maxValue, $scope.selectedGenresID)
                .then(function () {
                    return MoviesFactory.getMoviesPreview()
                }).then(function (moviesPreview) {
                    $scope.movies = moviesPreview;
                }).then(function () {
                    $scope.moviesFound = MoviesFactory.getMoviesFound()
                });
        }
        
        function deleteFilters(){
            $scope.selectedGenresID = [];
            $scope.yearSlider.minValue = 1960;
            $scope.yearSlider.maxValue = 2025;
            $scope.tmdbSlider.minValue = 0;
            $scope.tmdbSlider.maxValue = 10;
            
            for (var i = 0; i < $scope.genresList.length; i++){
                if ($scope.genresList[i].selected) $scope.genresList[i].selected = false;
            }

            discover();
        }
    }

})();