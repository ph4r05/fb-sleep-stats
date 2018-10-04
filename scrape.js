var _ = require('lodash');
var config = require('config');
var fbCookie = config.get('fbCookie');
// var fbSleep = require('fb-sleep');
var fbSleep = require('./src/fb-sleep');
var userService = require('./src/server/services/user');
var TEN_MINUTES = 1000 * 60 * 10;
var pollingInterval = (config.pollingInterval * 1000) || TEN_MINUTES;
var last_since = 0;

function getRandomDelay() {
    return _.random(pollingInterval * 0.9, pollingInterval);
}

function getFormattedUsers(users) {
    return _(users)
        .map(function(timestamp, userId) {
            return {
                userId: userId,
                timestamp: timestamp * 1000
            };
        })
        .value();
}

function getRecentlyActiveUsers(users, since) {
    users = getFormattedUsers(users);
    var timestampDiff = getTimestampDiff(users);

    return users.filter(function(user) {
        return user.timestamp >= (since - timestampDiff);
    });
}

function getTimestampDiff(users) {
    var mostRecentTimestamp = _(users)
        .orderBy('timestamp')
        .map('timestamp')
        .last();

    return Date.now() - mostRecentTimestamp;
}

function getAndSaveActiveUsers(config, since) {
    fbSleep.getUsers(config)
        .then(function(users) {
            console.log(users);
            var activeUsers = getRecentlyActiveUsers(users, since);

            console.log(new Date().toLocaleString(), ' - Active users: ', activeUsers.length, '/', _.size(users));
            userService.saveUsers(activeUsers);
            console.log(new Date().toLocaleString(), ' DB updated');
            last_since = Date.now();
        })
        .catch(function(err) {
            console.error(new Date().toLocaleString(), 'An error occurred while scraping. Please check to make sure your development.json config is correct', err);
        })
        .then(function() {
            // var since = Date.now();
            // setTimeout(getAndSaveActiveUsers, getRandomDelay(), config, since);
            setTimeout(getAndSaveActiveUsers, getRandomDelay(), config, last_since);
        })
        .done();
}

console.log('Polling every', pollingInterval/1000, 'seconds');
getAndSaveActiveUsers(fbCookie, last_since);

// On the first load, load all
// getAndSaveActiveUsers(fbCookie, Date.now() - pollingInterval);

