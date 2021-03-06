"use strict";
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var settings = require('./settings.json');

var client_id = settings.spotifyApplicationID; // Your client id
var client_secret = settings.spotifyClientSecret; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cookieParser())
   .use(bodyParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  var scope = 'user-read-private user-read-email user-modify-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.put('/play', function(req, res) {
    console.log(req.body);
    let spotify = getSpotifyWrapper(req.body.access_token);
    let result = spotify.play(req.body.itemID,req.body.offset,req.body.device);
    result.then(function(result) {
        res.statusCode = 200;
        res.send();
    }, function(err) {
        res.statusCode = 500;
        res.statusMessage = err.message;
        res.send();
    });
});

app.put('/pause', function(req, res) {
    let spotify = getSpotifyWrapper(req.headers.access_token);
    let result = spotify.pause();
    result.then(function(result) {
        res.statusCode = 200;
        res.send();
    }, function(err) {
        res.statusCode = 500;
        res.statusMessage = err.message;
        res.send();
    });
});

app.get('/search', function(req, res) {
    let spotify = getSpotifyWrapper(req.headers.access_token);
    let result = spotify.search(req.query.query, req.query.queryType);
    console.log(req.query.query);
    result.then(function(result) {
        console.log(result);
        res.statusCode = 200;
        res.send();
    }, function(err) {
        res.statusCode = 500;
        res.statusMessage = err.message;
        res.send();
    });
});

console.log('Listening on 8888');
app.listen(8888);

/*
    Helper functions
*/
function getSpotifyWrapper(access_token) {
    var spotify = require('./utilities/spotify/wrapper.js').spotifyWrapper;
    spotify.init(access_token);
    return spotify;
}