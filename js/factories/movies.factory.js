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
    
    var query;
    var page;

    return {
        init: init,
        getPosterInitialPath: getPosterInitialPath,
        getMoviesPreview: getMoviesPreview,
        getMoviesFound: getMoviesFound,
        getMovieTrailer: getMovieTrailer,
        getGenresList: getGenresList,
        getMovieDetails: getMovieDetails,
        getOmdbInfo: getOmdbInfo,
        getSimilarMovies: getSimilarMovies,
        getMoviesByKey: getMoviesByKey,
        getFilteredMovies: getFilteredMovies,
        addToFavorites: addToFavorites,
        removeFromFavorites: removeFromFavorites,
        addToSeeLater: addToSeeLater,
        removeFromSeeLater: removeFromSeeLater,
        getFavorites: getFavorites,
        getSeeLater: getSeeLater,
        saveFavorites: saveFavorites,
        saveSeeLater: saveSeeLater,
        loadMore: loadMore,
        getLastPage: getLastPage,
        getCurrentPage: getCurrentPage
        
    }

    function init() {
        if (localStorage.getItem("favoriteMovies")) loadFavorites();
        else saveFavorites();
        if (localStorage.getItem("seeLaterMovies")) loadSeeLater();
        else saveSeeLater();
        
        return discoverMovies();
    }
    
    function discoverMovies(){
        query = API_INITIAL_PATH+"discover/movie?sort_by=popularity.desc&language="+language+"&api_key="+API_KEY;
        page = 1;
        return $http({
            method: 'GET',
            url: query
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
        loadFavorites();
        loadSeeLater();
        
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
    
    function getLastPage(){
        if (totalResults == 0) return 1;
        var fullPages = Math.floor(totalResults / 20);
        if (totalResults % 20 === 0){
            return fullPages;
        } else return ++fullPages;
    }
    
    function getCurrentPage(){
        return page;
    }
    
    function getMoviesFound(){
        return totalResults;
    }
    
    function getMovieIndex(movieId, array){
        for (var i=0; i < array.length; i++){
             if (array[i].id === movieId) return i;
        }
        return -1;
    }
    
    function isFavorite(movieId){
        if (getMovieIndex(movieId, favoritesArray) === -1) return false;
        else return true;
    }
    
    function addToFavorites(movie){
        favoritesArray.push(movie);
    }
    
    function removeFromFavorites(movieId){
        var index = getMovieIndex(movieId, favoritesArray);
        if (index !== -1) favoritesArray.splice(index,1);
    }
    
    function seeLater(movieId){
        if (getMovieIndex(movieId, seeLaterArray) === -1) return false;
        else return true;
    }
    
    function addToSeeLater(movie){
        seeLaterArray.push(movie);
    }
    
    function removeFromSeeLater(movieId){
        var index = getMovieIndex(movieId, seeLaterArray);
        if (index !== -1) seeLaterArray.splice(index,1);
    }
    
    //Currently favorite lists and watch later do not have a paging system
    //It would be interesting to return these lists in arrays of 20 elements each time to use the same system we used with the results returned by the API
    function getFavorites(){
        page = 1;
        totalResults = favoritesArray.length;
        return favoritesArray;
    }
    
    function getSeeLater(){
        page = 1;
        totalResults = seeLaterArray.length;
        return seeLaterArray;
    }
    
    function saveFavorites(){
        localStorage.setItem("favoriteMovies", JSON.stringify(favoritesArray));
    }
    
    function loadFavorites() {
        favoritesArray = JSON.parse(localStorage.getItem("favoriteMovies"));
    }

    function saveSeeLater(){
        localStorage.setItem("seeLaterMovies", JSON.stringify(seeLaterArray));
    }
    
    function loadSeeLater() {
        seeLaterArray = JSON.parse(localStorage.getItem("seeLaterMovies"));
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
            url: "https://www.omdbapi.com/?i="+imdbID+"&apikey=3370463f"
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
    
    function getMoviesByKey(searchKey){
        query = API_INITIAL_PATH+"search/movie?api_key="+API_KEY+"&language="+language+"&query="+searchKey
        page = 1;
        return $http({
            method: 'GET',
            url: query
        }).then(function successCallback(data) {
            console.log("Movies by key ("+searchKey+"):");
            console.log(data);
            moviesArray = data["data"].results;
            totalResults = data["data"].total_results;
            
        }, function errorCallback(data) {
            console.log(404 + " Movies not found");
        });
    }
    
    function  getFilteredMovies(yearMin, yearMax, tmdbMin, tmdbMax, selectedGenres){
        var genresList = selectedGenres.join([separador = ',']);
        query = API_INITIAL_PATH+"discover/movie?api_key="+API_KEY+"&language="+language+"&sort_by=popularity.desc&primary_release_date.gte="+yearMin+"&primary_release_date.lte="+yearMax+"&vote_average.gte="+tmdbMin+"&vote_average.lte="+tmdbMax+"&with_genres="+genresList;
        page = 1;
        return $http({
            method: 'GET',
            url: query
        }).then(function successCallback(data) {
            console.log("Movies between year "+yearMin+" and "+yearMax+":");
            console.log(data);
            moviesArray = data["data"].results;
            totalResults = data["data"].total_results;
            
        }, function errorCallback(data) {
            console.log(404 + " Movies not found");
        });
    }
    
    function loadMore(){
        page++;
        return $http({
            method: 'GET',
            url: query+"&page="+page
        }).then(function successCallback(data) {
            console.log(data);
            moviesArray = data["data"].results;
            totalResults = data["data"].total_results;
            
        }, function errorCallback(data) {
            console.log(404 + " Movies not found");
        });
    }
}