import {
  getVideoById,
  handleVideoView,
  publishAVideo,
  updateVideo,
  togglePublishStatus,
  deleteVideo,
  getAllVideosWithoutSearch,
  getAllVideosWithSearch,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

export default function (app) {
  app.post(
    "/api/v1/videos",
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    verifyJWT,
    publishAVideo
  );

  app.get("/api/v1/videos", verifyJWT, getAllVideosWithSearch);
  app.get("/api/v1/videos/all", verifyJWT, getAllVideosWithoutSearch);
  app.get("/api/v1/videos/view/:videoId", verifyJWT, handleVideoView);
  app.get("/api/v1/videos/:videoId", verifyJWT, getVideoById);
  app.patch(
    "/api/v1/videos/update/:videoId",
    verifyJWT,
    upload.single("thumbnail"),
    updateVideo
  );
  app.patch(
    "/api/v1/videos/toggle/publish/:videoId",
    verifyJWT,
    togglePublishStatus
  );
  app.delete("/api/v1/videos/delete/:videoId", verifyJWT, deleteVideo);
}

// /videos/:id/view
