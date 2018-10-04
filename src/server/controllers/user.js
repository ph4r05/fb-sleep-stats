var userService = require('../services/user');

var userController = {};
userController.listUsers = function(req, res) {
    var accessToken = req.cookies.fbAccessToken;
    console.log('access token: ', accessToken);
    return userService.getList(accessToken)
        .then(function(response) {
            console.log('List loaded: ', response);
            res.json(response);
        })
        .catch(function(err) {
            console.error('Could not get list', err);
            var isNotAuthenticated = err.type === 'OAuthException';
            if (isNotAuthenticated) {
                res.sendStatus(401);
            }
            res.sendStatus(500);
        });
};

userController.viewUser = function(req, res) {
    var userId = req.params.userId;
    var user = userService.getUser(userId);
    res.json(user);
};

module.exports = userController;
