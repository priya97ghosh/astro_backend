const express = require('express');
const router = express.Router();

const followController = require('../controllers/follow_controller');

// send follow request route
router.post('/send-follow-request', followController.sendFollowRequest);
// get all follow lists route
router.get('/get-all-follow-list', followController.getAllFollowList);
// remove follow by id route
router.delete('/remove-follow/:followingId', followController.removeFollow);
// get follow list by follower id
router.get('/get-follow-astro-list/:followerId', followController.getFollowListByUserId);

// get follow list by following id
router.get('/get-follow-user-list/:followingId', followController.getFollowListByAstroId);

module.exports = router;
