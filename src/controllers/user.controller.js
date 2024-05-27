import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadFile from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken'

const generateAccessTokenAndRefreshToken = async (id) => {
    try{

        let user = await User.findById(id)
        
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        
        return {accessToken, refreshToken}
    }
    catch(err){
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

export const registerUser = asyncHandler(async (req, res) => {

    const {fullname, email, password, username} = req.body
    console.log(fullname, email, password, username)

    if([fullname, email, password, username].some(ele => ele.trim() === "")){
        throw new ApiError(400, "All input field is required")
    }

    const existedUser = await User.findOne({$or : [{username}, {email}]})

    if(existedUser) throw new ApiError(409, "User already existing")
    
    const avatarLocalFile = req.files?.avatar[0].path
    const coverImageLocalFile = req.files?.coverImage[0].path

    if(!avatarLocalFile) throw new ApiError(400, "Avatar file is required")

    const avatar = await uploadFile(avatarLocalFile)
    const coverImage = await uploadFile(coverImageLocalFile)

    if(!avatar) throw new ApiError(400, "avatar file is required")

    const existingUser = await User.create({
        fullname,
        email,
        password,
        username : username.toLowerCase(),
        avatar : avatar.url,
        coverImage : coverImage.url || ""
    })

    const createUser = await User.findById(existingUser._id).select("-password -refreshToken")

    if(!createUser) throw new ApiError(500, "Something went wrong while registering the user")

    return res.status(201).json(
        new ApiResponse(201, createUser, "User registered successfull")
    )
})

export const loginUser = asyncHandler(async (req, res) => {
    
    const {username, email, password} = req.body
    console.log(username, email, password)

    if(!username && !email) throw new ApiError(400, "Kindly provide username or email")

    const existingUser = await User.findOne({$or : [{username}, {email}]})

    if(!existingUser) throw new ApiError(400, "User does not exist")

    const correctPassword = await existingUser.isPasswordCorrect(password)

    if(!correctPassword) throw new ApiError(401, "Password is incorrect")

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(existingUser._id)

    const user = await User.findById(existingUser._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200).cookie('accessToken', accessToken, options).cookie('refreshToken', refreshToken, options).json(
        new ApiResponse(200, {user, accessToken, refreshToken }, 'User logged in successfully')
    )
})

export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, 
        {
            $set : {
                refreshToken : undefined
            },
        },
        {
            new : true
        }

    )

    const options = {
        httpOnly : true,
        secure : true
    }
    
    return res.status(200).cookie('accessToken', "", options).cookie('refreshToken', "", options).json(
        new ApiResponse(200, "", "user logout")
    )
})

export const accessRefreshToken = asyncHandler(async(req, res) => {

    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
        if(!incomingRefreshToken) throw new ApiError(400, "Unauthorized request")
        
        let decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        if(!decodedToken) throw new ApiError(400, 'Invalid refresh token')
    
        let user = await User.findById(decodedToken._id)
    
        const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options)
    } catch (error) {
        throw new ApiError(500, "Something went wrong while refreshing access token")
    }
})