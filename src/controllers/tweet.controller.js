import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  try {
    const { content } = req.body;
    const id = req.user._id;
    if (!content) {
      throw new ApiError(400, "Please provide a content for the tweet");
    }

    if (!id) {
      throw new ApiError(400, "Please provide a user id for the tweet");
    }

    const newTweet = await Tweet.create({
      content,
      owner: id, // Assuming you have authenticated user's ID in req.user
    });

    console.log(newTweet);

    res
      .status(201)
      .json(new ApiResponse(201, newTweet, "Tweet created successfully"));
  } catch (error) {
    throw new ApiError(500, `Error creating tweet: ${error.message}`);
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  try {
    const tweets = await Tweet.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(req.params.userId) } },
      { $sort: { createdAt: -1 } }, // Sort by creation time, descending
    ]);
    res
      .status(200)
      .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
  } catch (error) {
    throw new ApiError(500, `Get tweets error: ${error.message}`);
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  try {
    const tweetId = req.params.tweetId;
    const { content } = req.body;

    const updatedTweet = await Tweet.findOneAndUpdate(
      { _id: tweetId, owner: req.user._id }, // Ensure the tweet belongs to the authenticated user
      { content },
      { new: true } // Return the updated tweet
    );

    if (!updatedTweet) {
      //   return res
      //     .status(404)
      //     .json({
      //       message: "Tweet not found or you don't have permission to update it.",
      //     });
      throw new ApiError(
        404,
        "Tweet not found or you don't have permission to update it."
      );
    }

    // res.status(200).json(updatedTweet);
    res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated"));
  } catch (error) {
    new ApiError(500, `Error updating tweet: ${error.message}`);
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  try {
    const tweetId = req.params.tweetId;

    console.log(tweetId);

    // Find the tweet and ensure it belongs to the authenticated user
    const deletedTweet = await Tweet.deleteOne({
      _id: tweetId,
    });

    if (!deletedTweet) {
      throw new ApiError(
        404,
        "Tweet not found or you don't have permission to delete it."
      );
    }

    res.status(200).json(new ApiResponse(200, deletedTweet, "Tweet deleted"));
  } catch (error) {
    new ApiError(500, `Error deleting tweet: ${error.message}`);
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
