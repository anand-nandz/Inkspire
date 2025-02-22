import mongoose from "mongoose";

export enum ArticleStatus {
    Draft = 'Draft',
    Published = 'Published',
    Archived = 'Archived',
    Blocked = 'Blocked',
    Delete = 'Deleted'
  }
  
  export interface IArticle {
    _id: string;
    title: string;
    category: string;
    description: string;
    content: string;
    coverImage: string;
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        profileImage?:string;
    };
    likes?: {
        user: mongoose.Types.ObjectId;
        isLiked: boolean;
    }[];
    dislikes?: {  // Add this new field
        user: mongoose.Types.ObjectId;
        isDisliked: boolean;
    }[];
    totalLikes: number;
    totalDislikes: number; 
    articleStatus: ArticleStatus;
    createdAt?: string;
    updatedAt?:string;
}