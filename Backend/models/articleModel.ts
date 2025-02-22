import { ArticleStatus, IArticle } from "../types/articleTypes";
import mongoose, { Schema} from "mongoose";


const articleSchema = new Schema<IArticle>({
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true},
    title: {type: String, required: true},
    description: { type: String, required: true },
    category: {type: String, required: true},
    coverImage: {type:String, required: true},
    content: {type: Schema.Types.Mixed, required: true},
    likes: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        isLiked: { type: Boolean, default: false }
    }],
    dislikes: [{  
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        isDisliked: { type: Boolean, default: false }
    }],
    articleStatus: { type: String, enum: Object.values(ArticleStatus), default: ArticleStatus.Draft }, 
    totalLikes: {type: Number, default: 0},
    totalDislikes: {type: Number, default: 0}
}, {
    timestamps: true
})

const articleModel = mongoose.model<IArticle>('article', articleSchema);
export default articleModel;