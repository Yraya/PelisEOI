angular.module('PelisEOI').factory('MoviesFactory', MoviesFactory);

function MoviesFactory($http) {
    var moviesArray = [];
    var totalResults = 0;
    var favoritesArray = [];
    var seeLaterArray = [];
    
    var language = "es";
    var API_KEY = "e5ca57166b93c4a814295f2034a2b0e8";

    return {
        init: init,
        getMoviesPreview: getMoviesPreview,
        getMoviesFound: getMoviesFound
    }

    function init() {
        return $http({  //Return para el siguiente then en el HomeController
            method: 'GET',
            url: "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&language="+language+"&api_key="+API_KEY
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
            moviePreview.cover = "https://image.tmdb.org/t/p/w342/"+
                moviesArray[i].poster_path;
            moviePreview.vote_average = moviesArray[i].vote_average;
            moviePreview.overview = moviesArray[i].overview;
            moviePreview.title = moviesArray[i].title;
            moviePreview.release_date = moviesArray[i].release_date;
            
            moviePreview.favorite = isFavorite(moviePreview.id);
            moviePreview.later = seeLater(moviePreview.id);
            moviesPreview.push(moviePreview);
        }
        return moviesPreview;
        
        /*
        Another way
         moviesArray.map((movie) => moviePreview.id = movie.id);
        moviesArray.map( function (movie){ 
        moviePreview.id = movie.id
        });
        */
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

}