import { ArticleStatus } from "./types";

export interface UserState {
    userData: UserData | null;
    isUserSignedIn: boolean,
}

export interface UserData {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?:string;
    isActive?: boolean;
    isGoogleUser?: boolean;
    dob: string;
    role: string;
    interests: string[];
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}

export interface AccountInfo {
    firstName: string
    lastName: string
    profileImage: string
    image?: File
    dob: string
    role: string
    interests: string[];
  }
  

export interface DynamicBackgroundProps {
    filepath: string;
    type?: 'video' | 'image';
    height?: string;
    width?: string;
    imageData?: string | null;
    className?: string;
}

export interface LoginFormValues {
    email: string;
    password: string;
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
        user: string;
        isLiked: boolean;
    }[];
    dislikes?: {  
        user: string;
        isDisliked: boolean;
    }[];
    totalLikes?: number;
    totalDislikes?: number; 
    articleStatus: ArticleStatus;
    createdAt?: string;
    updatedAt?:string;
}

export interface CropArea {
    x: number
    y: number
    width: number
    height: number
}



export interface FormValues {
    title: string;
    description: string;
    content: string;
    category: string;
    status: string;
    coverImage: string
}

export interface EditArticleModalProps {
    isOpen: boolean;
    onClose: () => void;
    article: IArticle | null;
    onSave: (article: IArticle) => void;
}


export interface SidebarProps {
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    userInfo: {
        interests: string[];
        _id: string;
    } | null;
    articles: IArticle[];
}


export interface CategoryScrollProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export interface ArticleCardProps {
    data: IArticle[]
    userId?: string
    showEditOptions?: boolean
    onEdit?: (article: IArticle) => void
    onDelete?: (articleId: string) => void
    onArticleUpdate?: (articleId: string, updatedArticle: IArticle) => void;
}



export interface ArticleState {
    isLiked: boolean;
    isDisliked: boolean;
    likeCount: number;
    dislikeCount: number;
    isLoading: boolean;
}