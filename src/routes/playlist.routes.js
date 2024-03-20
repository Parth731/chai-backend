import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

export default function (app) {
  app.post("/api/v1/playlist", verifyJWT, createPlaylist);
  app.get("/api/v1/playlist/user/:userId", verifyJWT, getUserPlaylists);
  app.patch(
    "/api/v1/playlist/video/add/:videoId/:playlistId",
    verifyJWT,
    addVideoToPlaylist
  );
  app.patch(
    "/api/v1/playlist/video/remove/:videoId/:playlistId",
    verifyJWT,
    removeVideoFromPlaylist
  );
  app.patch("/api/v1/playlist/update/:playlistId", verifyJWT, updatePlaylist);
  app.delete("/api/v1/playlist/:playlistId", verifyJWT, deletePlaylist);
}
