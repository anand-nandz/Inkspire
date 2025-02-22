import express  from "express";
import multer from 'multer';
import { createArticle, deleteArticle, dislikeArticle, editProfile, getAllArticle, getArticle, getProfile, likeArticle, loginUser, logoutUser, registerUser, updateArticle, verifyOtp } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authToken";

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = express.Router()

router.post('/login',loginUser)
router.post('/logout',logoutUser)
router.post('/signup',registerUser)
router.post('/verifyOtp',verifyOtp)

router.get('/profile',authenticateToken,getProfile)
router.put('/profile',authenticateToken, upload.single('profileImage'),editProfile)

router.get('/articles',authenticateToken,getArticle)
router.patch('/articles/:id',authenticateToken,deleteArticle)
router.get('/home',authenticateToken,getAllArticle)
router.post('/create-article',authenticateToken,upload.single('coverImage'),createArticle)
router.put('/update-article/:articleId', authenticateToken, upload.single('coverImage'), updateArticle);
router.post('/articles/:articleId/like', authenticateToken, likeArticle);
router.post('/articles/:articleId/dislike', authenticateToken, dislikeArticle);

export default router