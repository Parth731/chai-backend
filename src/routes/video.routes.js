// import { Router } from "express";
// import {
//   deleteVideo,
//   getAllVideos,
//   getVideoById,
//   publishAVideo,
//   togglePublishStatus,
//   updateVideo,
// } from "../controllers/video.controller.js";
// import { verifyJWT } from "../middlewares/auth.middleware.js";
// import { upload } from "../middlewares/multer.middleware.js";

import {
  getVideoById,
  getAllVideos,
  handleVideoView,
  publishAVideo,
  updateVideo,
  togglePublishStatus,
  deleteVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

// const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// router
//   .route("/api/v1/videos")
//   .get(getAllVideos)
//   .post(
//     upload.fields([
//       {
//         name: "videoFile",
//         maxCount: 1,
//       },
//       {
//         name: "thumbnail",
//         maxCount: 1,
//       },
//     ]),
//     publishAVideo
//   );

// router
//   .route("/api/v1/videos/:videoId")
//   .get(getVideoById)
//   .delete(deleteVideo)
//   .patch(upload.single("thumbnail"), updateVideo);

// router
//   .route("/api/v1/videos/toggle/publish/:videoId")
//   .patch(togglePublishStatus);

// export default router;

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

  app.get("/api/v1/videos", verifyJWT, getAllVideos);
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
