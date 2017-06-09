(function () {
    'use strict';

    angular.module('PelisEOI')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', 'MoviesFactory'];

    function HomeController($scope, MoviesFactory) {
        /*** Variables ***/
        var YOUTUBE_BASE_PATH = "https://www.youtube.com/embed/";
        $scope.movieTrailer = YOUTUBE_BASE_PATH + "trailer-key-not-found";
        $scope.moviesFound = 0;
        $scope.moviesFoundText = "película/s encontrada/s";
        $scope.selectedGenresID = [];
        $scope.searchKey = "";
        $scope.loadingMovies = true;
        $scope.movies = [];
        $scope.isLastPage = true;
        var currentDate = new Date();

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

        /*** Functions **/
        $scope.resetFilteredSearch = resetFilteredSearch;
        $scope.getModal = getModal;
        $scope.filterByGenre = filterByGenre;
        $scope.searchMovies = searchMovies;
        $scope.filterMovies = filterMovies;

        $scope.addToFavorites = addToFavorites;
        $scope.removeFromFavorites = removeFromFavorites;
        $scope.addToSeeLater = addToSeeLater;
        $scope.removeFromSeeLater = removeFromSeeLater;

        $scope.showFavorites = showFavorites;
        $scope.showSeeLater = showSeeLater;
        $scope.loadMore = loadMore;
        
        $scope.getComingSoon = getComingSoon;
        $scope.comingSoon = comingSoon;
        
        init();


        function init() {
            $scope.posterInitalPath = MoviesFactory.getPosterInitialPath();
            MoviesFactory.getGenresList().then(function (genres) {
                $scope.genresList = genres;
            });
            discover();
        }


        function discover() {
            startLoading();
            return MoviesFactory.init()
                .then(function () {
                    return MoviesFactory.getMoviesPreview()
                }).then(function (moviesPreview) {
                    $scope.movies = moviesPreview;
                    finishLoading();
                }).then(function () {
                    checkLastPage();
                    $scope.moviesFound = MoviesFactory.getMoviesFound();
                    $scope.moviesFoundText = "película/s encontrada/s";
                });
        }
        
        function checkLastPage(){
            var last = MoviesFactory.getLastPage();
            var current = MoviesFactory.getCurrentPage();
            if (MoviesFactory.getLastPage() == MoviesFactory.getCurrentPage()){
                $scope.isLastPage = true;
            } else $scope.isLastPage = false;
        }

        function getModal(movie) {
            $scope.movieTrailer = YOUTUBE_BASE_PATH + "trailer-key-not-found";
            $scope.aditionalTrailerInfo = "";
            $scope.movieTitle = movie.title;
            $scope.movieOverview = movie.overview;
            $scope.movieCover = movie.poster_path;
            var year = movie.release_date;
            if (year && year.length != 0) year = year.substring(0,4);
            $scope.movieYear = year;
            $scope.movieRuntime = "-";
            $scope.movieGenres = [];
            $scope.movieVoteAverage = movie.vote_average;
            $scope.rottenTomatoes = "-";
            $scope.metacritc = "-";
            $scope.similarMoviesList = [];
            var imdbID = "none";

            MoviesFactory.getMovieDetails(movie.id).then(function (movieDetails) {
                $scope.movieRuntime = processRuntime(movieDetails.runtime);
                $scope.movieGenres = movieDetails.genres;
                imdbID = movieDetails.imdb_id;
                MoviesFactory.getOmdbInfo(imdbID).then(function (data) {
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

            MoviesFactory.getSimilarMovies(movie.id).then(function (similarMovies) {
                $scope.similarMoviesList = similarMovies;
            });


            // Get the modal
            var modal = document.getElementById('movie-details-modal');

            // Get the buttons that opens the modal
            var btns = document.getElementsByClassName("cover-button");

            // Get the <span> element that closes the modal
            var span = document.getElementsByClassName("close")[0];

            // When the user clicks the movie, open the modal 
            modal.style.display = "block";
            $scope.modalActive = true;

            // When the user clicks on <span> (x), close the modal
            span.onclick = function () {
                modal.style.display = "none";
                $scope.modalActive = false;
            }

            // When the user clicks anywhere outside of the modal, close it
            window.onclick = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                    $scope.modalActive = false;
                }
            }
        }

        function processRuntime(runtime) {
            var hours = 0;
            var minutes = runtime;

            if (runtime != null) { //works for undefined as well
                if (runtime > 60) {
                    hours = Math.floor(runtime / 60);
                    minutes = runtime % 60;
                }
            } else minutes = 0;

            return hours + 'h ' + minutes + 'm';
        }

        function filterByGenre(genre) {
            if (genre.selected) {
                genre.selected = false;
                var index = $scope.selectedGenresID.indexOf(genre.id);
                if (index !== -1) {
                    $scope.selectedGenresID.splice(index, 1);
                }
            } else {
                genre.selected = true;
                $scope.selectedGenresID.push(genre.id);
            }
        }

        function searchMovies(searchKey) {
            if (searchKey != "") {
                deleteFilters();
                startLoading();
                MoviesFactory.getMoviesByKey(searchKey)
                    .then(function () {
                        return MoviesFactory.getMoviesPreview();
                    }).then(function (moviesPreview) {
                        $scope.movies = moviesPreview;
                        finishLoading();
                    }).then(function () {
                        checkLastPage();
                        $scope.moviesFound = MoviesFactory.getMoviesFound();
                        $scope.moviesFoundText = "película/s encontrada/s";
                    });
            } else {
                deleteFilters();
                discover();
            }
        }

        function filterMovies() {
            startLoading();
            MoviesFactory.getFilteredMovies($scope.yearSlider.minValue, $scope.yearSlider.maxValue, $scope.tmdbSlider.minValue, $scope.tmdbSlider.maxValue, $scope.selectedGenresID)
                .then(function () {
                    return MoviesFactory.getMoviesPreview()
                }).then(function (moviesPreview) {
                    $scope.movies = moviesPreview;
                    finishLoading();
                }).then(function () {
                    checkLastPage();
                    $scope.moviesFound = MoviesFactory.getMoviesFound();
                    $scope.moviesFoundText = "película/s encontrada/s";
                });
        }

        function deleteFilters() {
            $scope.selectedGenresID = [];
            $scope.yearSlider.minValue = 1960;
            $scope.yearSlider.maxValue = 2025;
            $scope.tmdbSlider.minValue = 0;
            $scope.tmdbSlider.maxValue = 10;

            for (var i = 0; i < $scope.genresList.length; i++) {
                if ($scope.genresList[i].selected) $scope.genresList[i].selected = false;
            }
        }

        function resetFilteredSearch() {
            deleteFilters();
            discover();
        }

        function startLoading() {
            //This works better than $scope.movies.movies = [] in order to empty the ng-repeat array
            $scope.movies.length = 0;
            $scope.moviesFound = 0;
            $scope.moviesFoundText = "película/s encontrada/s";
            $scope.loadingMovies = true;
        }

        function finishLoading() {
            $scope.loadingMovies = false;
        }

        function addToFavorites(movie) {
            movie.favorite = true;
            MoviesFactory.addToFavorites(movie);
            MoviesFactory.saveFavorites();
        }

        function removeFromFavorites(movie) {
            movie.favorite = false;
            MoviesFactory.removeFromFavorites(movie.id);
            $scope.moviesFound = $scope.movies.length;
            MoviesFactory.saveFavorites();
        }

        function addToSeeLater(movie) {
            movie.later = true;
            MoviesFactory.addToSeeLater(movie);
            MoviesFactory.saveSeeLater();
        }

        function removeFromSeeLater(movie) {
            movie.later = false;
            MoviesFactory.removeFromSeeLater(movie.id);
            $scope.moviesFound = MoviesFactory.getMoviesFound();
            MoviesFactory.saveSeeLater();
        }

        function showFavorites() {
            $scope.movies = MoviesFactory.getFavorites();
            checkLastPage();
            $scope.moviesFound = MoviesFactory.getMoviesFound();
            $scope.moviesFoundText = "película/s favorita/s";
        }

        function showSeeLater() {
            $scope.movies = MoviesFactory.getSeeLater();
            checkLastPage();
            $scope.moviesFound = $scope.movies.length;
            $scope.moviesFoundText = "película/s pospuesta/s";
        }

        function loadMore() {
            startLoading();
            MoviesFactory.loadMore()
                .then(function () {
                    return MoviesFactory.getMoviesPreview()
                }).then(function (moviesPreview) {
                    $scope.movies = moviesPreview;
                    $scope.moviesFound = MoviesFactory.getMoviesFound();
                    finishLoading();
                    window.scrollTo(0, 0);
                    checkLastPage();
                });
        }
        
        function getComingSoon(){
             MoviesFactory.getComingSoon()
                .then(function () {
                    return MoviesFactory.getMoviesPreview()
                }).then(function (moviesPreview) {
                    $scope.movies = moviesPreview;
                    $scope.moviesFound = MoviesFactory.getMoviesFound();
                    $scope.moviesFoundText = "película/s proximamente";
                    finishLoading();
                    checkLastPage();
                });
        }
        
        function comingSoon(movieReleaseDate){
            if (movieReleaseDate && movieReleaseDate.length != 0) {
                var year = parseInt(movieReleaseDate.substring(0,4));
                var month = parseInt(movieReleaseDate.substring(5,7));
                var day = parseInt(movieReleaseDate.substring(8,10));
                
                if (year > currentDate.getFullYear()) return true;
                if (year == currentDate.getFullYear()){
                    if (month > (currentDate.getMonth()+1)) return true;
                    if (month == (currentDate.getMonth()+1)){
                        if (day > (currentDate.getDate())) return true;
                    }
                }
            }
            return false;
        }
    }

})();