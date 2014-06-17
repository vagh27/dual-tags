angular.module('matchstagram',['ngAnimate','ngRoute'])
	.config(function($routeProvider){
		$routeProvider.when('/:term1/:term2', {
			templateUrl : 'content.html',
			controller : 'main',
			resolve : {
				terms : function($route,$location){
					var terms = [$route.current.params.term1,$route.current.params.term2];
					return terms
				}
			}
		});
	})
	.factory('getFeed',function ($http){
		return function(tag) { 
			var url = "https://api.instagram.com/v1/tags/"+tag+"/media/recent",
				request = {
		            callback: "JSON_CALLBACK",
		            client_id: "6443c51264a64a38b40827873ba8c6e3"
		        };
			return $http({method: 'JSONP', url: url, params: request })
		}
	})
	.controller('main',function ($rootScope,$scope,$http,$timeout,$q,$sce,terms,$route,getFeed){
		$scope.results = {};
		$scope.count = 1;

		$scope.trustSrc = function(src) { return $sce.trustAsResourceUrl(src); };

		function wait() {
			var defer = $q.defer();
			$timeout(function() {
				defer.resolve();
			}, 2000);
			return defer.promise;
		} 

	    function shuffleArray(array) {
		  var m = array.length, t, i;

		  	// While there remain elements to shuffle
		  	while (m) {
			    // Pick a remaining element…
			    i = Math.floor(Math.random() * m--);

			    // And swap it with the current element.
			    t = array[m];
			    array[m] = array[i];
			    array[i] = t;
		  	}

		  return array;
		}

		var shuffleNew = function() {

	        var randomnumber = Math.floor(Math.random() * 19 ),
	        	randomnumber2 = Math.floor(Math.random() * $scope.results.length ),
	        	item1 = $scope.results[randomnumber],
	        	item2 = $scope.results[randomnumber2],
	        	type = item2.type + "s";

	        	$scope.results[randomnumber].type = item2.type;

	        	//if item wasnt a video to begin with, it wont have the 'videos' object
	        	if(!item1.videos){
		        	item1.videos = {
		        		standard_resolution : {}
		        	};
		        }
	        	
	        	if( item1.class == '') {
	        		item1[type].standard_resolution.url = item2[type].standard_resolution.url;
	        		item1.class = 'itemShow';
	        		item1.tag = item2.tag;
	        	}
	        	else {
	        		item1[type].standard_resolution.url2 = item2[type].standard_resolution.url;
	        		item1.class = '';
	        		item1.tag = item2.tag;
	        	}
	        	$scope.count++

	        $timeout(shuffleNew, 2500);
	    }

	    function getOther(insta1){
	    	getFeed(terms[1])
				.success(function(data) { 
					var insta2 = data.data; 
					$scope.results = insta2.concat(insta1);
					shuffleArray($scope.results);
				})
				.error(function() { 
					alert('error3'); 
				})
				.then(wait)
				.then(function(){ 
					for (var i = 0; i < $scope.results.length; i++) {
						var that = $scope.results[i];
						if (that.tags.indexOf(terms[0]) > -1) that.tag = terms[0]
						else that.tag = terms[1]
						that.class = 'itemShow';
					};
				})
				.then(wait)
				.then(function(){
					$timeout(shuffleNew, 1500);
				})
				.then(function(){
					$timeout(function(){
						$route.reload();
					}, 300000);
				});
	    }

		$scope.submit = function(){

			getFeed(terms[0])
				.success(function(data) { 
					var insta1 = data.data; 
					getOther(insta1);
				})
				.error(function() { alert('error'); });
		};

		$scope.submit()
		
	});