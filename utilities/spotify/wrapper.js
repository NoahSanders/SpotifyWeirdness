"use strict";
class SpotifyWrapper {
    constructor() {
        this.request = require('request');
        this.baseUrl = 'https://api.spotify.com/v1';
    }

    init(access_token) {
        this.access_token = access_token;
    }

    //TODO - device not used yet
    play(itemID, offset, device) {
        let access_token = this.access_token;
        let baseUrl = this.baseUrl;
        let request = this.request;

        return new Promise(function(resolve, reject) {
            try {
                var options = {
                    url: baseUrl + '/me/player/play',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                // if an itemID is passed in, specify to play that
                if (itemID) {
                    if (itemID.split(':')[1] === 'track') {
                        options.json = {
                            "uris": [itemID]
                        }
                    }
                    else {
                        options.json = {
                            context_uri: itemID,
                            offset: {
                                position: offset
                            }
                        };
                    }
                }
                console.log(options);
            
                request.put(options, function(error, response, body) {
                    if (response.error) {
                        console.log('Error playing song-' + response.error.status + ':' + response.error.message);
                        console.log(response.error);
                        reject(Error(response.error));
                    }
                    else {
                        console.log(body);
                        resolve(true);
                    }
                });
            }
            catch (exception) {
                console.log('Exception occurred in play(): ' + exception.toString());
                reject(Error(exception.toString()));
            }
        });        
    }

    pause() {
        let access_token = this.access_token;
        let baseUrl = this.baseUrl;
        let request = this.request;

        return new Promise(function(resolve, reject) {
            try {
                var options = {
                    url: baseUrl + '/me/player/pause',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };
            
                request.put(options, function(error, response, body) {
                    if (error) {
                        console.log('Error pausing song: ' + error.toString());
                        reject(Error(error));
                    }
                    else {
                        resolve(true);
                    }
                });
            }
            catch (exception) {
                console.log('Exception occurred in pause(): ' + exception.toString());
            }
        });
    }

    /*
        @param queryString (string) query to search for
        @param queryType (string) comma-delimited string of query types (options: album, artist, playlist, track)
    */
    search(queryString, queryType) {
        let access_token = this.access_token;
        let baseUrl = this.baseUrl;
        let request = this.request;
        console.log(queryString);

        return new Promise(function(resolve, reject) {
            try {
                queryString = queryString.replace(/\s/g, '%20')
                var options = {
                    url: baseUrl + '/search',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    qs: {
                        q: queryString
                    }
                };

                if (queryType) {
                    options.qs.type = queryType;
                }
                else {
                    options.qs.type = 'album,artist,playlist,track';
                }
            
                request.get(options, function(error, response, body) {
                    if (error) {
                        console.log('Error searching: ' + error.toString());
                        reject(Error(error));
                    }
                    else {
                        resolve(body);
                    }
                });
            }
            catch (exception) {
                console.log('Exception occurred in search(): ' + exception.toString());
            }
        });
    }

    getTrackInformation(trackID) {
        let access_token = this.access_token;
        let baseUrl = this.baseUrl;
        let request = this.request;

        return new Promise(function(resolve, reject) {
            try {

            }
            catch (exception) {
                console.log('Exception occurred in getTrackInformation(): ' + exception.toString());
            }
        });
    }

    getTrackContext(spotifyID) {
        //Todo
    }
}

exports.spotifyWrapper = new SpotifyWrapper();