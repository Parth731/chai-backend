import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

export default function (app) {
  app.post("/api/v1/tweets", verifyJWT, createTweet);
  app.get("/api/v1/tweets/user/:userId", verifyJWT, getUserTweets);
  app.patch("/api/v1/tweets/:tweetId", verifyJWT, updateTweet);
  app.delete("/api/v1/tweets/delete/:tweetId", verifyJWT, deleteTweet);
}
