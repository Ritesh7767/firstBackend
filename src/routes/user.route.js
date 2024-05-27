import { Router } from "express";
import {accessRefreshToken, loginUser, logoutUser, registerUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import isAuth from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser)

router.route('/logout').post(
    isAuth,
    logoutUser
)

router.route('/accessRefreshToken').post(accessRefreshToken)


export default router