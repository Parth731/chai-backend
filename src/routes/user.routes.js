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

import { registerUser } from "../controllers/user.controller.js";
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
}
