var _ = require('lodash');
var dao = require('./dao');
var facebookService = require('./facebook');
var userService = {};

userService.saveUsers = function(users) {
    dao.saveUsers(users);
};

userService.getUser = function(userId) {
    var users = dao.getUsers();

    _.forEach(users, function (value, key) {
        console.log(key, value);
        users[key] = _.filter(users[key], function (timestamp) {
            return timestamp > 0;
        });
    });

    return _.sortBy(users[userId]);
};

userService.getList = function(accessToken) {
    var users = dao.getUsers();
    var userIds = Object.keys(users);
    console.log('Users: ', userIds);
    return facebookService.getUsers(accessToken, userIds)
        .then(function(facebookUsers) {
            console.info('Something', facebookUsers);
            return _(facebookUsers)
                .map(function(user) {
                    user.count = users[user.id].length;
                    return user;
                })
                .orderBy('count', 'desc');
        });
};

module.exports = userService;
