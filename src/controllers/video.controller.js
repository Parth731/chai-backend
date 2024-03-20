import { ObjectId } from "mongodb";
import { Video } from "../models/videos.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
  //   const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  try {
    // /videos?userId=65f8dbeee51d01d76423e35a&page=1&limit=2&searchQuery=mera&sortBy=description&sortType=asc
    const {
      page = 1,
      limit = 10,
      searchQuery,
      sortBy,
      sortType,
      userId,
    } = req.query;

    // if(!searchQuery){
    //     throw new ApiError(400, "Search query is required");
    // }

    if (!sortBy && !sortType) {
      throw new ApiError(400, "Sorting parameters are required");
    }

    if (!page && !limit) {
      throw new ApiError(400, "Pagination parameters are required");
    }

    // console.log(searchQuery);
    const skip = (page - 1) * limit;
    const result = await Video.aggregate([
      //   { $match: { ownerId: userId } },
      {
        $match: {
          title: { $regex: searchQuery, $options: "i" },
        },
      },
      {
        $sort: { [sortBy]: sortType === "desc" ? -1 : 1 },
      },
      {
        $skip: skip,
      },
      { $limit: parseInt(limit) },
    ]);
    // console.log(result);
    res
      .status(200)
      .json(new ApiResponse(200, result, "fetch videos successfully"));
  } catch (error) {
    throw new ApiError(500, "internal server error");
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userDetails = req.user;
  // TODO: get video, upload to cloudinary, create video title, description, tumbail, duration

  if (!title || !description) {
    throw new ApiError(400, "title and description are required");
  }

  // Assuming you have a 'file' field in your request containing the video file
  if (!req.files?.thumbnail[0]?.path) {
    throw new ApiError(400, "thumbnail is required");
  }
  //   console.log(req.files);
  if (!req.files?.videoFile[0]?.path) {
    throw new ApiError(400, "videoFile is required");
  }

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  const videoLocalPath = req.files?.videoFile[0]?.path;
  //   console.log("videoLocalPath -> ", videoLocalPath);
  //   console.log("thumbnailLocalPath -> ", thumbnailLocalPath);

  // TODO: upload video to cloudinary
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  const videoFile = await uploadOnCloudinary(videoLocalPath);

  //   console.log("thumbnail => ", thumbnail);
  //   console.log("videoFile => ", videoFile);

  const videoDuration = videoFile?.duration; // Specify the duration of the video

  // Convert the duration to hh:mm:ss format
  const hours = Math.floor(videoDuration / 3600);
  const minutes = Math.floor((videoDuration % 3600) / 60);
  const seconds = Math.floor(videoDuration % 60);

  const durationString = `${hours}:${minutes}:${seconds}`;

  //   console.log(parseInt(durationString));

  let video = {
    title,
    description,
    thumbnail: thumbnail.url,
    videoFile: videoFile.url,
    duration: durationString,
    owner: userDetails,
  };

  const createdVideo = await Video.create(video);

  //   console.log("createdVideo -> ", createdVideo);

  if (!createdVideo) {
    throw new ApiError(500, "Something went wrong while publishing the video");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdVideo, "PublishAVideo successfully"));

  //   console.log("req.file => ", req.files?.thumbnail[0]?.path);
});

const handleVideoView = asyncHandler(async (req, res) => {
  //TODO: get video by id
  try {
    const { videoId } = req.params;
    if (!videoId) {
      throw new ApiError(400, "Video id is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    video.views += 1;
    await video.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, video, "Video view count updated successfully")
      );
  } catch (error) {
    throw new ApiError(500, `Error video view count: ${error}`);
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by id

  try {
    const { videoId } = req.params;
    if (!videoId) {
      throw new ApiError(400, "Video id is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    res.json(new ApiResponse(200, video, "Video fetched successfully"));
  } catch (error) {
    // throw new ApiError(500, "Internal Server Error");
    throw new ApiError(500, `Error fetching video by id: ${error}`);
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  try {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnailLocalPath = req.file?.path;
    console.log(videoId);
    if (!videoId) {
      throw new ApiError(400, "Video id is required");
    }

    if (!title && !description) {
      throw new ApiError(400, "Title, description or thumbnail is required");
    }

    if (!thumbnailLocalPath) {
      throw new ApiError(400, "Thumbnail file is missing");
    }

    console.log(thumbnailLocalPath);

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    console.log(thumbnail);
    if (!thumbnail.url) {
      throw new ApiError(400, "Error while uploading on thumbnail");
    }

    // const updatedVideo = [];

    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          title,
          description,
          thumbnail: thumbnail?.url,
        },
      },
      { new: true }
    );

    console.log(updateVideo);

    if (!updatedVideo) {
      throw new ApiError(404, "Video not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
  } catch (error) {
    // throw new ApiError(500, "Internal Server Error");
    throw new ApiError(500, `Error updating video by id: ${error}`);
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  //TODO: delete video
  try {
    const { videoId } = req.params;

    // Check if the videoId is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new ApiError(400, "Invalid video id");
    }

    // Delete the video
    const result = await Video.deleteOne({ _id: videoId });

    // Check if the video was found and deleted
    if (!result) {
      throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, "Video deleted successfully"));
  } catch (error) {
    throw new ApiError(500, `Error deleting video: ${error}`);
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    // Check if the videoId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new ApiError(400, "Invalid video id");
    }

    // Find the video by id
    const video = await Video.findById(videoId);

    // Check if the video exists
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    // Toggle the publish status
    video.isPublished = !video.isPublished;

    // Save the updated video
    await video.save();

    res
      .status(200)
      .json(new ApiResponse(200, video, "Publish status toggled successfully"));
  } catch (error) {
    throw new ApiError(500, `Error toggling publish status: ${error}`);
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  handleVideoView,
};
