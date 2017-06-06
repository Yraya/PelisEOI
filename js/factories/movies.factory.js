angular.module('PelisEOI').factory('MoviesFactory', MoviesFactory);

function MoviesFactory($http) {
    var moviesArray = [];
    var totalResults = 0;
    var favoritesArray = [];
    var seeLaterArray = [];
    
    var language = "es";
    var API_KEY = "e5ca57166b93c4a814295f2034a2b0e8";
    var API_INITIAL_PATH = "https://api.themoviedb.org/3/";
    var POSTER_INITIAL_PATH = "https://image.tmdb.org/t/p/w342/";

    return {
        init: init,
        getMoviesPreview: getMoviesPreview,
        getMoviesFound: getMoviesFound,
        getMovieTrailer: getMovieTrailer
    }

    function init() {
        return $http({  //Return para el siguiente then en el HomeController
            method: 'GET',
            url: API_INITIAL_PATH+"discover/movie?sort_by=popularity.desc&language="+language+"&api_key="+API_KEY
        }).then(function successCallback(data) {
            console.log(data);
            moviesArray = data["data"].results;
            totalResults = data["data"].total_results;
        }, function errorCallback(data) {
            console.log(404 + "Movies not found");
        });
    }
    
    function getMoviesPreview(){
        var moviesPreview = [];
        for (var i=0; i < moviesArray.length; i++){
            var moviePreview = {};
            moviePreview.id = moviesArray[i].id;
            moviePreview.cover = POSTER_INITIAL_PATH+
                moviesArray[i].poster_path;
            moviePreview.vote_average = moviesArray[i].vote_average;
            moviePreview.overview = moviesArray[i].overview;
            moviePreview.title = moviesArray[i].title;
            var year = moviesArray[i].release_date;
            if (year.length != 0) year = year.substring(0,4);
            moviePreview.release_year = year;
            moviePreview.favorite = isFavorite(moviePreview.id);
            moviePreview.later = seeLater(moviePreview.id);
            moviesPreview.push(moviePreview);
        }
        return moviesPreview;
    }
    
    function getMoviesFound(){
        return totalResults;
    }
    
    function isFavorite(movieId){
        for (var i=0; i < favoritesArray.length; i++){
             if (favorites[i] === movieId) return true;
        }
        return false;
    }
    
    function seeLater(movieId){
        for (var i=0; i < seeLaterArray.length; i++){
             if (seeLaterArray[i] === movieId) return true;
        }
        return false;
    }
    
    function getMovieDetails(movieID){
        
    }
    
    function getMovieTrailer(movieID, trailerLanguage){
        return $http({
            method: 'GET',
            url: API_INITIAL_PATH+"movie/"+movieID+"/videos?&language="+trailerLanguage+"&api_key="+API_KEY
        }).then(function successCallback(data) {
            console.log(data);
            var trailers = data["data"].results;
            if (trailers.length === 0){
                return -1;
            }else {
                return trailers[0].key;
            }
        }, function errorCallback(data) {
            console.log(404 + "Trailer not found");
        });
    }

}