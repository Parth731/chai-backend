import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const registerUser = asyncHandler(async (req, res) => {
  // console.log(res);
  // res.status(200).json({
  //   message: "OK",
  // });
  /*
  get user details from frontend
  validation - not empty
  check if user already exists username, email
  check of image, check for avatar
  upload them to cloudiary, avatar 
  create user object - create entry in db
  remove password and refresh token field from reponse 
  check for user creation
  return reponse
*/

  const { fullName, email, username, password } = req.body;
  // console.log(email);

  // if (fullName === "") {
  //   throw new ApiError(400, "fullName is required");
  // }

  console.log(fullName);

  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields is required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user with email or username already exists");
  }

  console.log("req.files", req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req?.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }
  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage file is required");
  }

  console.log("avatarLocalPath", avatarLocalPath);
  console.log("coverImageLocalPath", coverImageLocalPath);

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImg = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  if (!coverImg) {
    throw new ApiError(400, "coverImg file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImg?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  console.log("user ->", user);

  const createdUser = await User.findById(user.id).select(
    "-password -refreshToken"
  );

  console.log("createdUser", createdUser);

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user register successfully"));
  // ApiResponse();
});
