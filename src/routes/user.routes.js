// import { Router } from "express";
// const router = Router();
// import { registerUser } from "../controllers/user.controller.js";

// // router.route("/register").get(registerUser);
// router.get("/register", async (req, res) => {
//   console.log(res);
//   res.status(200).json({
//     message: "OK",
//   });
// });

// export default Router;

import {
  changeCurrentPassword,
  getAllUsers,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
export default function (app) {
  app.post(
    "/api/v1/users/regiter",
    upload.fields([
      {
        name: "avatar",
        maxCount: 1,
      },
      {
        name: "coverImage",
        maxCount: 1,
      },
    ]),
    registerUser
  );

  app.post("/api/v1/users/login", loginUser);
  app.post("/api/v1/users/logout", verifyJWT, logoutUser);
  app.post("/api/v1/users/refresh-token", refreshAccessToken);
  app.post("/api/v1/users/change-password", verifyJWT, changeCurrentPassword);
  app.get("/api/v1/users/current-user", verifyJWT, getCurrentUser);
  app.patch("/api/v1/users/update-account", verifyJWT, updateAccountDetails);
  app.patch(
    "/api/v1/users/avatar",
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
  );
  app.patch(
    "/api/v1/users/cover-image",
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
  );
  app.get("/api/v1/users/c/:username", verifyJWT, getUserChannelProfile);
  app.get("/api/v1/users/history", verifyJWT, getWatchHistory);
  app.get("/api/v1/users/getallusers", getAllUsers);
}
