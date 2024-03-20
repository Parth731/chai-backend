import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/videos.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  //   const { name, description } = req.body;
  //TODO: create playlist
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      throw new ApiError(400, "Name and description are required");
    }

    const playlist = await Playlist.create({
      name,
      description,
      owner: req.user._id,
    });

    if (!playlist) {
      throw new ApiError(400, "Something went wrong while creating playlist");
    }

    res
      .status(201)
      .json(new ApiResponse(201, "Playlist created successfully", playlist));
  } catch (error) {
    throw new ApiError(500, `error while creating playlist ${error.message}`);
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  //TODO: get user playlists

  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user id");
    }
    const userPlaylists = await Playlist.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
    ]);
    if (!userPlaylists) {
      throw new ApiError(400, "No playlists found");
    }
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "fetch playlists successfully by User",
          userPlaylists
        )
      );
  } catch (error) {
    throw new ApiError(500, `Get playlists error: ${error.message}`);
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  //TODO: get playlist by id
  const { playlistId } = req.params;
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;

    if (!playlistId && !videoId) {
      throw new ApiError(400, "Playlist or video id not found");
    }

    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    console.log(video);

    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $addToSet: { videos: new mongoose.Types.ObjectId(videoId) },
      },
      { new: true }
    ).populate("videos", null, null, { sort: { title: 1 } });

    if (!playlist) {
      throw new Error("Playlist not found");
    }
    console.log(playlist);
    res
      .status(200)
      .json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
      );
  } catch (error) {
    throw new Error("Error adding video to playlist: " + error.message);
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  // TODO: remove video from playlist

  try {
    const { playlistId, videoId } = req.params;
    if (!playlistId || !videoId) {
      throw new ApiError(400, "Playlist or video id is required");
    }

    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $pull: { videos: new mongoose.Types.ObjectId(videoId) },
      },
      { new: true }
    ).populate("videos");

    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          playlist,
          "Video removed from playlist successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Error removing video from playlist: ${error.message}`
    );
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  // TODO: delete playlist
  try {
    const { playlistId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      throw new ApiError(400, "Invalid playlist ID");
    }
    const result = await Playlist.deleteOne({ _id: playlistId });
    if (result.deletedCount === 0) {
      throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(new ApiResponse(200, "Playlist deleted successfully"));
  } catch (err) {
    throw new ApiError(500, `Error deleting playlist: ${err.message}`);
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  //TODO: update playlist
  try {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
      throw new ApiError(400, "Playlist name and description is required");
    }

    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        name,
        description,
      },
      { new: true }
    ).populate("videos");

    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, "Playlist updated successfully", playlist));
  } catch (error) {
    throw new ApiError(500, `Error updating playlist: ${error.message}`);
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
