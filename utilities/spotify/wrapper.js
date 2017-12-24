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
    play(itemID,offset,device) {
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
                        console.log('Error pausing song');
                        console.log(error);
                        reject(Error(error));
                    }
                    else {
                        resolve(true);
                    }
                });
            }
            catch (exception) {
                console.log('Exception occurred in play(): ' + exception.toString());
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