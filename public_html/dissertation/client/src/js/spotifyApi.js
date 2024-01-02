var redirect_uri = "http://users.sussex.ac.uk/~io202/dissertation/client/public/index.html";

var client_id = "";
var client_secret = "";

var access_token = null;
var refresh_token = null;
var currentPlaylist = "";

const AUTHORIZE = "https://accounts.spotify.com/authorize"
const TOKEN = "https://accounts.spotify.com/api/token";
const PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const PLAY = "https://api.spotify.com/v1/me/player/play";
const PAUSE = "https://api.spotify.com/v1/me/player/pause";
const NEXT = "https://api.spotify.com/v1/me/player/next";
const PREVIOUS = "https://api.spotify.com/v1/me/player/previous";
const PLAYER = "https://api.spotify.com/v1/me/player";
const TRACKS = "https://api.spotify.com/v1/playlists/{{PlaylistId}}/tracks";
const CURRENTLYPLAYING = "https://api.spotify.com/v1/me/player/currently-playing";
const SHUFFLE = "https://api.spotify.com/v1/me/player/shuffle";
const profileURL = "https://api.spotify.com/v1/me";
const artistsURL = "https://api.spotify.com/v1/me/top/artists?limit=5";
const tracksURL = "https://api.spotify.com/v1/me/top/tracks?limit=10";
const genreURL = "https://api.spotify.com/v1/artists/{id}";

function onPageLoad(){
    client_id = localStorage.getItem("client_id");
    client_secret = localStorage.getItem("client_secret");
    if ( window.location.search.length > 0 ){
        handleRedirect();
    }
    else{
        access_token = localStorage.getItem("access_token");
        if ( access_token == null ){
            // we don't have an access token so present token section
            document.getElementById("deviceSection").style.display = 'none';
            document.getElementById("tokenSection").style.display = 'grid';
            document.getElementById("webgl").style.display = 'none';
            document.getElementById("topBtn").style.display = 'none';
        }
        else {
            // we have an access token so present device section
            document.getElementById("deviceSection").style.display = 'grid';
            document.getElementById("tokenSection").style.display = 'none';
            document.getElementById("webgl").style.display = 'show';
            document.getElementById("topBtn").style.display = 'show';
            
            const topArtists = fetchTopArtists();
            const topTracks = fetchTopTracks();
            const profile = fetchProfile();
            const genre = fetchGenre();
            populateUI(profile);
            populateTopArtists(topArtists);
            populateTopTracks(topArtists, topTracks);
            populateGenre(genre);
            
            fetchTracks();
            refreshDevices();
            refreshPlaylists();
            currentlyPlaying();
        }
    }
}

function handleRedirect(){
    let code = getCode();
    fetchAccessToken( code );
    window.history.pushState("", "", redirect_uri); // remove param from url
}

function getCode(){
    let code = null;
    const queryString = window.location.search;
    if ( queryString.length > 0 ){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}

function requestAuthorization(){
    client_id = document.getElementById("clientId").value;
    client_secret = document.getElementById("clientSecret").value;
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret); // In a real app you should not expose your client_secret to the user

    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private user-top-read";
    window.location.href = url; // Show Spotify's authorization screen
}

function fetchAccessToken( code ){
    let body = "grant_type=authorization_code";
    body += "&code=" + code;
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        var data = JSON.parse(this.responseText);
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);
    xhr.onload = callback;
}

function handleApiResponse(){
    if ( this.status == 200){
        console.log(this.responseText);
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 204 ){
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 401 ){
        refreshAccessToken();
    }
    else {
        console.log(this.responseText);
//        alert(this.responseText);
    }
}

function refreshDevices(){
    callApi( "GET", DEVICES, null, handleDevicesResponse );
}

function handleDevicesResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems( "devices" );
        data.devices.forEach(item => addDevice(item));
    }
    else if ( this.status == 401 ){
        refreshAccessToken();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addDevice(item){
    let node = document.createElement("option");
    node.value = item.id;
    node.innerHTML = item.name;
    document.getElementById("devices").appendChild(node);
}

function deviceId(){
    return document.getElementById("devices").value;
}

function refreshPlaylists(){
    callApi( "GET", PLAYLISTS, null, handlePlaylistsResponse );
}

function handlePlaylistsResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        
        removeAllItems( "playlists" );
        removeAllItems( "playlistArt" );
        data.items.forEach(item => addPlaylist(item));
        document.getElementById('playlists').value=currentPlaylist;
        
        data.items.forEach(item => addArt(item));
    }
    else if ( this.status == 401 ){
        refreshAccessToken();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addArt(item) {
    const playlist_art = new Image(200, 200);
    playlist_art.src = item.images[0].url;
    
    if (item.id == currentPlaylist) {
        document.getElementById("playlistArt").appendChild(playlist_art);
        document.getElementById("playlistTitle").innerText = item.name + " by ";
        document.getElementById("playlistOwner").innerText = item.owner.display_name;
    }
}

function addPlaylist(item){
    let node = document.createElement("option");
    node.value = item.id;
    node.innerHTML = item.name + " (" + item.tracks.total + ")";
    document.getElementById("playlists").appendChild(node);
}

function removeAllItems( elementId ){
    let node = document.getElementById(elementId);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function play(){
    let playlist_id = document.getElementById("playlists").value;
    let trackindex = document.getElementById("tracks").value;
    let body = {};
    
    body.context_uri = "spotify:playlist:" + playlist_id;
    body.offset = {};
    body.offset.position = trackindex.length > 0 ? Number(trackindex) : 0;
    body.offset.position_ms = 12000;
    
    callApi( "PUT", PLAY + "?device_id=" + deviceId(), JSON.stringify(body), handleApiResponse );
}

function shuffle(){
    let state = document.getElementById("shuffle").title;
    
    if (state == "false") {
        callApi( "PUT", SHUFFLE + "?state=true&device_id=" + deviceId(), null, handleApiResponse );
//        play();
    }
    
    if (state == "true") {
        callApi( "PUT", SHUFFLE + "?state=false&device_id=" + deviceId(), null, handleApiResponse );
//        play();
    }
}

function pause(){
//    currentlyPlaying();
    callApi( "PUT", PAUSE + "?device_id=" + deviceId(), null, handleApiResponse );
}

function next(){
    callApi( "POST", NEXT + "?device_id=" + deviceId(), null, handleApiResponse );
}

function previous(){
    callApi( "POST", PREVIOUS + "?device_id=" + deviceId(), null, handleApiResponse );
}

function transfer(){
    let body = {};
    body.device_ids = [];
    body.device_ids.push(deviceId())
    callApi( "PUT", PLAYER, JSON.stringify(body), handleApiResponse );
}

function fetchTracks(){
    let playlist_id = document.getElementById("playlists").value;
    if ( playlist_id.length > 0 ){
        url = TRACKS.replace("{{PlaylistId}}", playlist_id);
        callApi( "GET", url, null, handleTracksResponse );
    }
}

function handleTracksResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        let i = 0;
        let ms  = 0;
        
        console.log(data);

        removeAllItems( "tracks" );
        data.items.forEach( (item, index) => addTrack(item, index));
        
        document.getElementById("trackTotal").innerText = data.items.length + " songs";
        
        while (data.items[i] != null){
            ms += data.items[i].track.duration_ms;
            i++;
        }
        
        let min = (ms / 1000) / 60;
        let sec = (ms / 1000) % 60;
                   
        document.getElementById("duration_ms").innerHTML = ", " + Math.round(min) + " min " + Math.round(sec) + " sec";
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addTrack(item, index){
    let node = document.createElement("option");
    node.value = index;
    node.innerHTML = item.track.name + " (" + item.track.artists[0].name + ")";
    document.getElementById("tracks").appendChild(node);
}

function currentlyPlaying(){
    callApi( "GET", PLAYER + "?market=US", null, handleCurrentlyPlayingResponse );
}

function handleCurrentlyPlayingResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems( "albumImage" );
        
        if ( data.item != null ){
            const album_art = new Image(200, 200);
            album_art.src = data.item.album.images[0].url;
            
            document.getElementById("albumImage").appendChild(album_art);
            document.getElementById("trackTitle").innerHTML = data.item.name;
            document.getElementById("trackArtist").innerHTML = data.item.artists[0].name;
            
            let artist_id = data.item.artists[0].id;
            document.getElementById("current_id").value = artist_id;
            document.getElementById("current_id").innerHTML = data.item.artists[0].name + ": " + artist_id;
            
            document.getElementById("shuffle").title = data.shuffle_state;
            
//            refreshDevices();
            refreshPlaylists();
//            fetchTracks();
            fetchGenre();
            
            let playlist_id = document.getElementById("playlists").value;
            
            if (playlist_id == null) {
                refreshPlaylists();
                currentlyPlaying();
            }
            
            if (data.is_playing == true){
                document.getElementById("playerStatus").innerText = " listening to ";
            }
            if (data.is_playing == false){
                document.getElementById("playerStatus").innerText = " paused ";
            }
        }


        if ( data.device != null ){
            // select device
            currentDevice = data.device.id;
            document.getElementById('devices').value=currentDevice;
        }

        if ( data.context != null ){
            // select playlist
            currentPlaylist = data.context.uri;
            currentPlaylist = currentPlaylist.substring( currentPlaylist.lastIndexOf(":") + 1,  currentPlaylist.length );
            document.getElementById('playlists').value=currentPlaylist;
        }
    }
    else if ( this.status == 204 ){
        const album_art = new Image(200, 200);
        album_art.src = "../public/spotify.png";
        document.getElementById("albumImage").appendChild(album_art);
        document.getElementById("playerStatus").innerText = " not listening to anything. x";
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
//        alert(this.responseText);
    }
}

function fetchProfile() {
    callApi( "GET", profileURL, null, populateUI );
}

function populateUI(profile) {
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        const profileTag = data;
        if ( profileTag != null ){
            document.getElementById("displayName").innerText = profileTag.display_name;
            document.getElementById("profileName").innerText = profileTag.display_name;
            const profileImage = new Image(200, 200);
            if (profileTag.images.length == 0){
                profileImage.src = "../public/spotify.png";
                profileImage.title = "No avatar uploaded.";
                profileImage.alt = "No avatar uploaded.";
                profileImage.id = "userPFP";
            }
            if (profileTag.images.length != 0){
                profileImage.src = profileTag.images[1].url;
                profileImage.title = "User avatar.";
                profileImage.alt = "User avatar.";
                profileImage.id = "userPFP";
            }
            document.getElementById("userAvi").appendChild(profileImage);
            document.getElementById("id").innerText = "@" + profileTag.id;
            document.getElementById("followers").innerText = "Followers: " + profileTag.followers.total;
            document.getElementById("country").innerText = profileTag.country;
            document.getElementById("userAvi").setAttribute("href", profileTag.external_urls.spotify);
        }
    }
    else if ( this.status == 204 ){

    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
//        console.log(this.responseText);
//        alert(this.responseText);
    }
}

function fetchTopArtists() {
    let timeRange = document.getElementById("artistRange").value;
    if ( timeRange == "short" ){
        callApi( "GET", artistsURL + "&time_range=short_term", null, populateTopArtists );
    }
    else if ( timeRange == "medium" ){
        callApi( "GET", artistsURL + "&time_range=medium_term", null, populateTopArtists );
    }
    else if ( timeRange == "long" ){
        callApi( "GET", artistsURL + "&time_range=long_term", null, populateTopArtists );
    }
}

function populateTopArtists() {
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems( "artistAvi" );
        removeAllItems( "artistName" );
        
        for (let i = 0; i < 5; i++) {
            const artistAvi = new Image(200, 200);
            
            if (data.items[i].images.length == 0){
                artistAvi.src = "../public/spotify.png";
            }
            if (data.items[i].images.length != 0){
                artistAvi.src = data.items[i].images[0].url;
            }
            
            document.getElementById("artistAvi").appendChild(artistAvi);
        }
        
        for (let j = 0; j < 5; j++) {
            let node = document.createElement("h3");
            
            node.innerHTML = data.items[j].name;
            node.id = "artist";
            
            document.getElementById("artistName").appendChild(node);
        }
        
    }
    else if ( this.status == 204 ){

    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
//        console.log(this.responseText);
//        alert(this.responseText);
    }
}

function fetchTopTracks() {
    let timeRange = document.getElementById("trackRange").value;
    if ( timeRange == "short" ){
        callApi( "GET", tracksURL + "&time_range=short_term", null, populateTopTracks );
    }
    else if ( timeRange == "medium" ){
        callApi( "GET", tracksURL + "&time_range=medium_term", null, populateTopTracks );
    }
    else if ( timeRange == "long" ){
        callApi( "GET", tracksURL + "&time_range=long_term", null, populateTopTracks );
    }
}

function populateTopTracks() {
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems( "toptrack" );
        const top10Tag = data;

        for (let i = 0; i < 10; i++) {
            let node = document.createElement("li");
            let arrLength = top10Tag.items[i].artists.length;
            if (arrLength > 1) {
                node.innerHTML = top10Tag.items[i].name + " by ";
                for (let j = 0; j <= arrLength-1; j++) {
                    if (j == arrLength-1) {
                        node.innerHTML += " & " + top10Tag.items[i].artists[j].name + " (⭐️ " + top10Tag.items[i].popularity + ") ";
                    }
                    else if (j > 0 && j < arrLength-1) {
                        node.innerHTML += top10Tag.items[i].artists[j].name + ", ";
                    }
                    //3+ artists
                    else if (j == 0 && 2 <= arrLength-1) {
                        node.innerHTML += top10Tag.items[i].artists[j].name + ", ";
                    }
                    else {
                        node.innerHTML += top10Tag.items[i].artists[j].name;
                    }
                }
            }
            else if (arrLength == 1){
                node.innerHTML = top10Tag.items[i].name + " by " + top10Tag.items[i].artists[0].name + " (⭐️ " + top10Tag.items[i].popularity + ") ";
            }
            document.getElementById("toptrack").appendChild(node);
        }
    }
    else if ( this.status == 204 ){

    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
//        console.log(this.responseText);
//        alert(this.responseText);
    }
}

function fetchGenre(){
    let artist_id = document.getElementById("current_id").value;
    if ( artist_id.length > 0 ){
        url = genreURL.replace("{id}", artist_id);
        callApi( "GET", url, null, populateGenre );
    }
}

function populateGenre(){
   if ( this.status == 200 ){
       var data = JSON.parse(this.responseText);
       console.log(data);
       
       removeAllItems( "genre" );
       
       for (let i = 0; i != data.genres.length; i++) {
           let node = document.createElement("h3");
           
           node.innerHTML = data.genres[i];
           node.id = "genre";
           
           document.getElementById("genre").appendChild(node);
       }
   }
   else if ( this.status == 401 ){
       refreshAccessToken()
   }
   else {
       console.log(this.responseText);
       alert(this.responseText);
   }
}
