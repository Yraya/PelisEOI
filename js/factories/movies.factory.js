angular.module('PelisEOI').factory('MoviesFactory', MoviesFactory);

function MoviesFactory($http) {
    var moviesArray = [];
    var totalResults = 0;
    var favoritesArray = [];
    var seeLaterArray = [];
    
    var genres = [];
    var language = "es";
    var API_KEY = "e5ca57166b93c4a814295f2034a2b0e8";
    var API_INITIAL_PATH = "https://api.themoviedb.org/3/";
    var POSTER_INITIAL_PATH = "https://image.tmdb.org/t/p/w342/";

    return {
        init: init,
        getPosterInitialPath: getPosterInitialPath,
        getMoviesPreview: getMoviesPreview,
        getMoviesFound: getMoviesFound,
        getMovieTrailer: getMovieTrailer,
        getGenresList: getGenresList,
        filterByGenre: filterByGenre,
        getMovieDetails: getMovieDetails,
        getOmdbInfo: getOmdbInfo,
        getSimilarMovies: getSimilarMovies,
        getMoviesByKey: getMoviesByKey,
        getFilteredMovies: getFilteredMovies
    }

    function init() {
        return discoverMovies();
    }
    
    function discoverMovies(){
        return $http({  //Return para el siguiente then en el HomeController
            method: 'GET',
            url: API_INITIAL_PATH+"discover/movie?sort_by=popularity.desc&language="+language+"&api_key="+API_KEY
        }).then(function successCallback(data) {
            console.log("Movies:");
            console.log(data);
            moviesArray = data["data"].results;
            totalResults = data["data"].total_results;
        }, function errorCallback(data) {
            console.log(404 + " Movies not found");
        });
    }
    
    function getPosterInitialPath(){
        return POSTER_INITIAL_PATH;
    }
    
    function getGenresList() {
        if (genres.length === 0){
            return getGenres().then (function(){
                return genres;
            });
        } else return genres;
    }
    
    function getGenres() {
        return $http({
            method: 'GET',
            url: API_INITIAL_PATH+"genre/movie/list?language="+language+"&api_key="+API_KEY
        }).then(function successCallback(data) {
            console.log("Genres:");
            console.log(data);
            genres = data["data"].genres;
        }, function errorCallback(data) {
            console.log(404 + " No genres found");
        });
    }
    
    function getMoviesPreview(){
        var moviesPreview = [];
        for (var i=0; i < moviesArray.length; i++){
            var moviePreview = {};
            moviePreview.id = moviesArray[i].id;
            moviePreview.poster_path = moviesArray[i].poster_path;
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
            console.log("Trailer:");
            console.log(data);
            var trailers = data["data"].results;
            if (trailers.length === 0){
                return -1;
            }else {
                return trailers[0].key;
            }
        }, function errorCallback(data) {
            console.log(404 + " Trailer not found");
        });
    }

    function getMovieDetails(movieID){
        return $http({
            method: 'GET',
            url: API_INITIAL_PATH+"movie/"+movieID+"?language="+language+"&api_key="+API_KEY
        }).then(function successCallback(data) {
            console.log("Movie details:");
            console.log(data);
            return data["data"];
        }, function errorCallback(data) {
            console.log(404 + " Movie not found");
        });
    }
    
    function getOmdbInfo(imdbID){
        return $http({
            method: 'GET',
            url: "http://www.omdbapi.com/?i="+imdbID+"&apikey=3370463f"
        }).then(function successCallback(data) {
            console.log("OMBD Info:");
            console.log(data);
            return data["data"];
        }, function errorCallback(data) {
            console.log(404 + " Movie not found");
        });
    }
    
    function getSimilarMovies (movieID){
        return $http({
            method: 'GET',
            url: API_INITIAL_PATH+"movie/"+movieID+"/similar?language="+language+"&api_key="+API_KEY
        }).then(function successCallback(data) {
            console.log("Similar movies:");
            console.log(data);
            var similarMovies = data["data"].results;
            
            if (similarMovies.length > 4){
                return similarMovies.slice(0,4);
            } else return similarMovies;
            
        }, function errorCallback(data) {
            console.log(404 + " Movie not found");
        });
    }
    
    function filterByGenre(genreID){
        //https://api.themoviedb.org/3/genre/16/movies?api_key=e5ca57166b93c4a814295f2034a2b0e8&language=es&include_adult=false&sort_by=created_at.asc
        return $http({
            method: 'GET',
            url: API_INITIAL_PATH+"genre/"+genreID+"/movies?language="+language+"&api_key="+API_KEY
        }).then(function successCallback(data) {
            console.log("Movies by genre ("+genreID+"):");
            console.log(data);
            moviesArray = data["data"].results;
            totalResults = data["data"].total_results;
            
        }, function errorCallback(data) {
            console.log(404 + " Movies not found");
        });
        
    }
    
    function getMoviesByKey(searchKey){
        //https://api.themoviedb.org/3/search/movie?api_key=e5ca57166b93c4a814295f2034a2b0e8&language=es&query=leon&page=1
        return $http({
            method: 'GET',
            url: API_INITIAL_PATH+"search/movie?api_key="+API_KEY+"&language="+language+"&query="+searchKey
        }).then(function successCallback(data) {
            console.log("Movies by key ("+searchKey+"):");
            console.log(data);
            moviesArray = data["data"].results;
            totalResults = data["data"].total_results;
            
        }, function errorCallback(data) {
            console.log(404 + " Movies not found");
        });
    }
    
    function  getFilteredMovies(yearMin, yearMax, tmdbMin, tmdbMax){
        //https://api.themoviedb.org/3/discover/movie?api_key=e5ca57166b93c4a814295f2034a2b0e8&language=es&sort_by=popularity.desc&page=1&release_date.gte=2015&release_date.lte=2016&vote_average.gte=5&vote_average.lte=7
        return $http({
            method: 'GET',
            url: API_INITIAL_PATH+"discover/movie?api_key="+API_KEY+"&language="+language+"&sort_by=popularity.desc&primary_release_date.gte="+yearMin+"&primary_release_date.lte="+yearMax+"&vote_average.gte="+tmdbMin+"&vote_average.lte="+tmdbMax
        }).then(function successCallback(data) {
            console.log("Movies between year "+yearMin+" and "+yearMax+":");
            console.log(data);
            moviesArray = data["data"].results;
            totalResults = data["data"].total_results;
            
        }, function errorCallback(data) {
            console.log(404 + " Movies not found");
        });
    }
}