import userModel from '../models/userModel';
import { Request, Response } from 'express';
import { CustomError } from '../utils/customError';
import { OTP_EXPIRY_TIME, RESEND_COOLDOWN } from '../utils/enums';
import generateOTP from '../utils/generateOtp';
import { handleError } from '../utils/handleError';
import { hashPassword } from '../utils/hashPassword';
import HTTP_statusCode from '../utils/httpStatusCode';
import { Messages } from '../utils/messages';
import bcrypt from 'bcryptjs';
import { s3Service } from '../utils/s3Service';
import { createAccessToken, createRefreshToken } from '../config/jwt.config';
import { AuthenticatedRequest } from '../types/authReq';
import articleModel from '../models/articleModel';
import { ArticleStatus } from '../types/articleTypes';
import mongoose from 'mongoose';


export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email: email })

        if (!user) {
            throw new CustomError(Messages.Auth.USER_NOT_FOUND, HTTP_statusCode.NotFound)
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new CustomError(Messages.Auth.INCORRECT_PASSWORD, HTTP_statusCode.Unauthorized)
        }
        if (user.isActive === false) {
            throw new CustomError(Messages.Auth.BLOCKED_BY_ADMIN, HTTP_statusCode.NoAccess)
        }

        let userWithSignedUrl = user.toObject();

        if (user?.profileImage && user?.profileImage !== '') {
            try {
                const signedUrl = await s3Service.getFile('ink-spire/profile/', user?.profileImage);

                userWithSignedUrl = {
                    ...userWithSignedUrl,
                    profileImage: signedUrl
                }
            } catch (error) {
                console.error('Error generating signed URL during login:', error);
            }
        }
        const token = createAccessToken(user._id.toString());
        const refreshToken = createRefreshToken(user._id.toString());

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(HTTP_statusCode.OK).json({
            token: token,
            user: userWithSignedUrl,
            message: 'Succesfully Logged In'
        })

    } catch (error) {
        handleError(res, error, 'loginUser')
    }
}

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        })
        res.status(HTTP_statusCode.OK).json({ message: Messages.Auth.LOGOUT_SUCCESS })
    } catch (error) {
        handleError(res, error, 'UserLogout')
    }
}

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            firstName,
            lastName,
            email,
            dob,
            password,
            role,
            interests,
            profileImage,
        } = req.body;


        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            res.status(HTTP_statusCode.BadRequest).json({ message: Messages.Auth.EMAIL_ALREADY_EXISTS });
            return
        }
        const otpCode = await generateOTP(email);
        if (!otpCode) {
            throw new CustomError(Messages.Auth.FAIL_GENERATE_OTP, HTTP_statusCode.InternalServerError);
        }
        const hashedPassword = await hashPassword(password)

        const otpSetTimestamp = Date.now();
        const otpExpiry = otpSetTimestamp + OTP_EXPIRY_TIME;
        const resendAvailableAt = otpSetTimestamp + RESEND_COOLDOWN;

        const userData = {
            firstName,
            lastName,
            email,
            dob,
            password: hashedPassword,
            role,
            profileImage,
            interests,
            otpCode,
            otpSetTimestamp,
            otpExpiry,
            resendTimer: resendAvailableAt,
        };


        res.cookie('userSignUp', userData, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: OTP_EXPIRY_TIME,
            sameSite: 'strict'
        });

        res.status(HTTP_statusCode.OK).json({
            message: Messages.Auth.OTP_SENT,
            email,
            otpExpiry,
            resendAvailableAt
        })


    } catch (error) {
        handleError(res, error, 'registerUser')
    }
}

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { otp } = req.body;
        const userData = req.cookies.userSignUp;

        if (!otp || typeof otp !== 'string' || otp.length !== 4 || !/^\d+$/.test(otp)) {
            throw new CustomError(Messages.Auth.INVALID_OTP, HTTP_statusCode.BadRequest);
        }

        if (!userData) {
            throw new CustomError(Messages.Auth.SESSION_EXPIRED, HTTP_statusCode.BadRequest)
        }

        const currentTime = Date.now();
        if (currentTime > userData.otpExpiry) {
            throw new CustomError(Messages.Auth.OTP_EXPIRED, HTTP_statusCode.BadRequest);
        }

        if (otp !== userData.otpCode) {
            throw new CustomError(Messages.Auth.INVALID_OTP, HTTP_statusCode.BadRequest);
        }
        const existingUser = await userModel.findOne({ email: userData.email })

        if (existingUser) {
            throw new CustomError(Messages.Auth.EMAIL_ALREADY_EXISTS, HTTP_statusCode.NotFound);
        };

        const newUser = new userModel({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            dob: userData.dob,
            password: userData.password,
            role: userData.role,
            interests: userData.interests,
            isActive: true,
            profileImage: userData.profileImage || ""
        });

        if (!newUser) {
            throw new CustomError(Messages.Auth.USER_REG_FAILED, HTTP_statusCode.InternalServerError);
        }
        await newUser.save();

        if (newUser) {
            res.clearCookie('userSignUp');
            res.status(HTTP_statusCode.CREATED).json({
                user: newUser,
                message: Messages.Auth.ACCOUNT_CREATED,
            });
        }
    } catch (error) {
        handleError(res, error, 'erifyOtp')
    }
}

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(HTTP_statusCode.BadRequest).json({ message: Messages.Warning.USER_ID_MISSING });
            return;
        }
        const existingUser = await userModel.findOne({ _id: userId });
        if (!existingUser) {
            throw new CustomError(Messages.Auth.USER_NOT_FOUND, HTTP_statusCode.BadRequest);
        }

        let userWithSignedUrl = existingUser.toObject();
        if (existingUser?.profileImage && existingUser?.profileImage !== '') {
            try {
                const signedUrl = await s3Service.getFile('ink-spire/profile/', existingUser?.profileImage);
                userWithSignedUrl = {
                    ...userWithSignedUrl,
                    profileImage: signedUrl
                };
            } catch (error) {
                console.error('Error generating signed URL during login:', error);
            }
        }
        res.status(HTTP_statusCode.OK).json({
            message: 'Profile fetched successfully',
            user: userWithSignedUrl
        });
    } catch (error) {
        handleError(res, error, 'getProfile');
    }
}

export const editProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        const { firstName, lastName, profileImage, interests, role } = req.body;
        const files = req.file;

        if (!userId) {
            res.status(HTTP_statusCode.BadRequest).json({ message: Messages.Warning.USER_ID_MISSING });
            return;
        }

        if (!firstName && !lastName && !profileImage && !role && (!interests || interests.length === 0) && !req.file) {
            res.status(HTTP_statusCode.BadRequest).json({
                message: 'At least one field (first name, last name, profile image, or interests) is required'
            });
            return;
        }

        const existingUser = await userModel.findOne({ _id: userId });
        if (!existingUser) {
            throw new CustomError(Messages.Auth.USER_NOT_FOUND, HTTP_statusCode.BadRequest);
        }

        const updateData: {
            firstName?: string,
            lastName?: string,
            profileImage?: string,
            interests?: string[],
            role?: string
        } = {};

        if (firstName && firstName !== existingUser.firstName) {
            updateData.firstName = firstName;
        }
        if (lastName && lastName !== existingUser.lastName) {
            updateData.lastName = lastName;
        }
        if (role && role !== existingUser.role) {
            updateData.role = role;
        }
        if (interests) {
            updateData.interests = interests
        }


        if (files) {
            try {
                const imageFileName = await s3Service.uploadToS3(
                    'ink-spire/profile/',
                    files
                );
                updateData.profileImage = imageFileName;
            } catch (error) {
                console.error('Error uploading to S3:', error);
                throw new CustomError('Failed to upload image to S3', HTTP_statusCode.InternalServerError);
            }
        }

        if (Object.keys(updateData).length === 0) {
            throw new CustomError('No changes to update', HTTP_statusCode.InternalServerError);
        }

        await userModel.updateOne({ _id: userId }, { $set: updateData });
        const updatedUser = await userModel.findOne({ _id: userId });

        if (!updatedUser) {
            throw new CustomError('Failed to fetch updated user details', HTTP_statusCode.InternalServerError);
        }

        let userWithSignedUrl = updatedUser.toObject();
        if (updatedUser?.profileImage && updatedUser?.profileImage !== '') {
            try {
                const signedUrl = await s3Service.getFile('ink-spire/profile/', updatedUser?.profileImage);
                userWithSignedUrl = {
                    ...userWithSignedUrl,
                    profileImage: signedUrl
                };
            } catch (error) {
                console.error('Error generating signed URL during login:', error);
            }
        }

        res.status(HTTP_statusCode.OK).json({
            message: 'Profile updated successfully',
            user: userWithSignedUrl
        });
    } catch (error) {
        handleError(res, error, 'editProfile');
    }
};

export const createArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        const { title, description, category, content, status } = req.body;
        const files = req.file

        if (!userId) {
            res.status(HTTP_statusCode.BadRequest).json({ message: Messages.Warning.USER_ID_MISSING });
            return;
        }

        const existingUser = await userModel.findOne({ _id: userId })

        if (!existingUser) {
            throw new CustomError(Messages.Auth.EMAIL_ALREADY_EXISTS, HTTP_statusCode.NotFound);
        };
        let coverImage;
        if (files) {
            try {
                coverImage = await s3Service.uploadToS3(
                    'ink-spire/article/',
                    files
                );
            } catch (error) {
                console.error('Error uploading to S3:', error);
                throw new CustomError('Failed to upload image to S3', HTTP_statusCode.InternalServerError);
            }
        }

        const newArticle = new articleModel({
            user: userId,
            title,
            description,
            category,
            content,
            coverImage: coverImage || '',
            articleStatus: status
        });

        await newArticle.save()

        res.status(HTTP_statusCode.OK).json({
            success: true,
            message: 'Article created successfully',
            article: newArticle
        });

    } catch (error) {
        handleError(res, error, 'createArticle')
    }
}


export const updateArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        const articleId = req.params.articleId;
        const { title, description, category, content, status } = req.body;
        const files = req.file

        if (!userId) {
            res.status(HTTP_statusCode.BadRequest).json({ message: Messages.Warning.USER_ID_MISSING });
            return;
        }

        const article = await articleModel.findOne({ _id: articleId, user: userId });

        if (!article) {
            res.status(HTTP_statusCode.NotFound).json({ message: 'Article not found or unauthorized' });
            return;
        }

        let coverImage = article.coverImage;

        if (files) {
            try {
                coverImage = await s3Service.uploadToS3('ink-spire/article/', files);
            } catch (error) {
                console.error('Error uploading to S3:', error);
                throw new CustomError('Failed to upload image to S3', HTTP_statusCode.InternalServerError);
            }
        }

        article.title = title || article.title;
        article.description = description || article.description;
        article.category = category || article.category;
        article.content = content || article.content;
        article.articleStatus = status || article.articleStatus;
        article.coverImage = coverImage;

        await article.save();

        res.status(HTTP_statusCode.OK).json({
            success: true,
            message: 'Article updated successfully',
            article,
        });


    } catch (error) {
        handleError(res, error, 'updateArticle')
    }
}


export const getArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id
        if (!userId) {
            res.status(HTTP_statusCode.BadRequest).json({ message: Messages.Warning.USER_ID_MISSING });
            return;
        }

        const existingUser = await userModel.findOne({ _id: userId })

        if (!existingUser) {
            throw new CustomError(Messages.Auth.EMAIL_ALREADY_EXISTS, HTTP_statusCode.NotFound);
        };

        const articles = await articleModel.find({ user: userId })
            .populate({
                path: 'user',
                select: '_id firstName lastName profileImage'
            })
            .sort({ createdAt: -1 });

        const processedArticles = await Promise.all(articles.map(async (article) => {
            const articleObj = article.toObject();

            if (articleObj.coverImage) {
                articleObj.coverImage = await s3Service.getFile('ink-spire/article/', articleObj.coverImage);
            }


            if (articleObj.user?.profileImage) {
                articleObj.user.profileImage = await s3Service.getFile('ink-spire/profile/', articleObj.user.profileImage);
            }

            return {
                ...articleObj,
                totalLikes: articleObj.likes?.length || 0,
                isLiked: articleObj.likes?.some(like => like.user.toString() === userId.toString()) || false
            };
        }))

        res.status(HTTP_statusCode.OK).json({
            success: true,
            data: processedArticles
        });
    } catch (error) {
        handleError(res, error, 'getArticles')
    }
}

export const deleteArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        const articleId = req.params.id;

        if (!userId) {
            res.status(HTTP_statusCode.BadRequest).json({ message: Messages.Warning.USER_ID_MISSING });
            return;
        }

        const existingUser = await userModel.findOne({ _id: userId })
        if (!existingUser) {
            throw new CustomError(Messages.Auth.EMAIL_ALREADY_EXISTS, HTTP_statusCode.NotFound);
        };

        const updatedArticle = await articleModel.findOneAndUpdate(
            { _id: articleId, user: userId },
            { articleStatus: ArticleStatus.Delete },
            { new: true }
        );

        if (!updatedArticle) {
            res.status(HTTP_statusCode.NotFound).json({ message: "Article not found or already deleted" });
            return;
        }


        const updatedArticles = await articleModel.find({ user: userId, articleStatus: { $ne: ArticleStatus.Delete } })
            .populate({
                path: 'user',
                select: '_id firstName lastName profileImage'
            })
            .sort({ createdAt: -1 });

        const processedArticles = await Promise.all(updatedArticles.map(async (article) => {
            const articleObj = article.toObject();

            if (articleObj.coverImage) {
                articleObj.coverImage = await s3Service.getFile('ink-spire/article/', articleObj.coverImage);
            }


            if (articleObj.user?.profileImage) {
                articleObj.user.profileImage = await s3Service.getFile('ink-spire/profile/', articleObj.user.profileImage);
            }

            return {
                ...articleObj,
                totalLikes: articleObj.likes?.length || 0,
                isLiked: articleObj.likes?.some(like => like.user.toString() === userId.toString()) || false
            };
        }));

        res.status(HTTP_statusCode.OK).json({
            success: true,
            message: "Article deleted successfully",
            data: processedArticles
        });
    } catch (error) {
        handleError(res, error, 'deleteArticle')
    }
}

export const getAllArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id
        if (!userId) {
            res.status(HTTP_statusCode.BadRequest).json({ message: Messages.Warning.USER_ID_MISSING });
            return;
        }

        const articles = await articleModel.find()
            .populate({
                path: 'user',
                select: '_id firstName lastName profileImage'
            })
            .sort({ createdAt: -1 });

        const processedArticles = await Promise.all(articles.map(async (article) => {
            const articleObj = article.toObject();

            if (articleObj.coverImage) {
                articleObj.coverImage = await s3Service.getFile('ink-spire/article/', articleObj.coverImage);
            }

            if (articleObj.user?.profileImage) {
                articleObj.user.profileImage = await s3Service.getFile('ink-spire/profile/', articleObj.user.profileImage);
            }

            return {
                ...articleObj,
                totalLikes: articleObj.likes?.length || 0,
                isLiked: articleObj.likes?.some(like => like.user.toString() === userId.toString()) || false
            };
        }));

        res.status(HTTP_statusCode.OK).json({
            success: true,
            data: processedArticles
        });
    } catch (error) {
        handleError(res, error, 'getArticles')
    }
}

export const likeArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { articleId } = req.params;
        const userId = req.user?._id.toString();

        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const article = await articleModel.findById(articleId);

        if (!article) {
            res.status(404).json({ message: "Article not found" });
            return;
        }

        console.log(article, 'article in likeeee');

        article.likes = article.likes ?? [];
        article.dislikes = article.dislikes ?? [];

        // Check if user already liked this article
        const alreadyLikedIndex = article.likes.findIndex(
            (like) => like.user.toString() === userId.toString() && like.isLiked
        );

        // Check if user already disliked this article
        const alreadyDislikedIndex = article.dislikes.findIndex(
            (dislike) => dislike.user.toString() === userId.toString() && dislike.isDisliked
        );

        // Remove dislike if present
        if (alreadyDislikedIndex !== -1) {
            article.dislikes.splice(alreadyDislikedIndex, 1);
            article.totalDislikes = Math.max(0, (article.totalDislikes ?? 0) - 1);
        }

        // Toggle like status
        if (alreadyLikedIndex !== -1) {
            // User already liked, so remove the like
            article.likes.splice(alreadyLikedIndex, 1);
            article.totalLikes = Math.max(0, (article.totalLikes ?? 0) - 1);
        } else {
            // Add new like
            article.likes.push({ user: new mongoose.Types.ObjectId(userId), isLiked: true });
            article.totalLikes = (article.totalLikes ?? 0) + 1;
        }

        await article.save();
        const populatedArticle = await articleModel.findById(articleId)
            .populate({
                path: 'user',
                select: '_id firstName lastName profileImage'
            })
            .sort({ createdAt: -1 });

        if (populatedArticle) {
            const articleObj = populatedArticle.toObject();

            // Generate signed URL for cover image
            if (articleObj.coverImage) {
                articleObj.coverImage = await s3Service.getFile('ink-spire/article/', articleObj.coverImage);
            }

            // Generate signed URL for user's profile image
            if (articleObj.user?.profileImage) {
                articleObj.user.profileImage = await s3Service.getFile('ink-spire/profile/', articleObj.user.profileImage);
            }

            const processedArticle = {
                ...articleObj,
                totalLikes: articleObj.likes?.length || 0,
                isLiked: articleObj.likes?.some(like => like.user.toString() === userId.toString()) || false
            };

            res.status(200).json({
                success: true,
                message: "Article like updated successfully",
                article: processedArticle,
            });
        } else {
            res.status(404).json({ success: false, message: "Article not found after update" });
        }


    } catch (error) {
        console.error("Error in likeArticle:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// Dislike an article
export const dislikeArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { articleId } = req.params;
        const userId = req.user?._id.toString();
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        const article = await articleModel.findById(articleId);

        if (!article) {
            res.status(404).json({ message: "Article not found" });
            return;
        }

        article.likes = article.likes ?? [];
        article.dislikes = article.dislikes ?? [];

        // Check if user already disliked this article
        const alreadyDislikedIndex = article.dislikes.findIndex(
            dislike => dislike.user.toString() === userId.toString() && dislike.isDisliked
        );

        // Check if user already liked this article
        const alreadyLikedIndex = article.likes.findIndex(
            like => like.user.toString() === userId.toString() && like.isLiked
        );

        // Remove like if present
        if (alreadyLikedIndex !== -1) {
            article.likes.splice(alreadyLikedIndex, 1);
            article.totalLikes = Math.max(0, article.totalLikes - 1);
        }

        // Toggle dislike status
        if (alreadyDislikedIndex !== -1) {
            // User already disliked, so remove the dislike
            article.dislikes.splice(alreadyDislikedIndex, 1);
            article.totalDislikes = Math.max(0, article.totalDislikes - 1);
        } else {
            // Add new dislike
            article.dislikes.push({ user: new mongoose.Types.ObjectId(userId), isDisliked: true });
            article.totalDislikes = (article.totalDislikes ?? 0) + 1;
        }

        await article.save();

        // Populate user data before sending response
        const populatedArticle = await articleModel.findById(articleId)
            .populate({
                path: 'user',
                select: '_id firstName lastName profileImage'
            })
            .sort({ createdAt: -1 });

        if (populatedArticle) {
            const articleObj = populatedArticle.toObject();

            // Generate signed URL for cover image
            if (articleObj.coverImage) {
                articleObj.coverImage = await s3Service.getFile('ink-spire/article/', articleObj.coverImage);
            }

            // Generate signed URL for user's profile image
            if (articleObj.user?.profileImage) {
                articleObj.user.profileImage = await s3Service.getFile('ink-spire/profile/', articleObj.user.profileImage);
            }

            const processedArticle = {
                ...articleObj,
                totalLikes: articleObj.likes?.length || 0,
                isLiked: articleObj.likes?.some(like => like.user.toString() === userId.toString()) || false
            };

            res.status(200).json({
                success: true,
                message: "Article like updated successfully",
                article: processedArticle,
            });
        } else {
            res.status(404).json({ success: false, message: "Article not found after update" });
        }


    } catch (error) {
        handleError(res, error, 'deleteArticle')

    }
};