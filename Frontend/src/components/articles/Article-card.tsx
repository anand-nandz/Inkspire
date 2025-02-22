import React, { useCallback, useEffect } from "react"
import { useState } from "react"
import { Card, CardHeader, CardBody, Button, Avatar, Divider, Tooltip } from "@nextui-org/react"
import { Heart, ChevronDown, ChevronUp, ThumbsDown, Pencil, Trash2 } from "lucide-react"
import type { ArticleCardProps, ArticleState, IArticle } from "../../utils/interfaces/interfaces"
import { axiosInstance } from "../../config/api/axiosInstance"
import { AxiosError } from "axios"
import { handleApiError } from "../../utils/helpers/HandleApiError"

const ArticleCard = React.memo<ArticleCardProps>(({
    data,
    userId,
    showEditOptions = false,
    onEdit,
    onDelete,
    onArticleUpdate
}) => {
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [articleState, setArticleState] = useState<Record<string, ArticleState>>({});


    useEffect(() => {
        const initialState: Record<string, ArticleState> = {}; 
    
        data.forEach(article => {
            const userLiked = !!(userId && article.likes?.some(like => like.user.toString() === userId && like.isLiked));
            const userDisliked = !!(userId && article.dislikes?.some(dislike => dislike.user.toString() === userId && dislike.isDisliked));
    
            initialState[article._id] = {
                isLiked: userLiked,
                isDisliked: userDisliked,
                likeCount: article.likes?.length || 0,
                dislikeCount: article.dislikes?.length || 0,
                isLoading: false
            };
        });
    
        setArticleState(initialState);
    }, [data, userId]);
    

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleLike = async (articleId: string) => {
        
        try {
            setArticleState(prev => ({
                ...prev,
                [articleId]: {
                    ...prev[articleId],
                    isLoading: true
                }
            }));

            const response = await axiosInstance.post(`/articles/${articleId}/like`, {}, {
                withCredentials: true
            });

            console.log(response.data,'inlikeeeeee');
            

            if (response.data?.success) {
                const updatedArticle = response.data.article;

                setArticleState(prev => {
                    const currentState = prev[articleId];
                    const wasLiked = currentState.isLiked;
                    const wasDisliked = currentState.isDisliked;

                    return {
                        ...prev,
                        [articleId]: {
                            isLiked: !wasLiked,
                            isDisliked: false,
                            likeCount: wasLiked ? currentState.likeCount - 1 : currentState.likeCount + 1,
                            dislikeCount: wasDisliked ? currentState.dislikeCount - 1 : currentState.dislikeCount,
                            isLoading: false
                        }
                    };
                });

                if (onArticleUpdate) {
                    onArticleUpdate(articleId, updatedArticle);
                }
            }
        } catch (error) {
            handleApiError(error as AxiosError);
            setArticleState(prev => ({
                ...prev,
                [articleId]: {
                    ...prev[articleId],
                    isLoading: false
                }
            }));
        }
    };

    const handleDislike = useCallback(async (articleId: string) => {
        try {
            setArticleState(prev => ({
                ...prev,
                [articleId]: {
                    ...prev[articleId],
                    isLoading: true
                }
            }));

            const response = await axiosInstance.post(`/articles/${articleId}/dislike`, {}, {
                withCredentials: true
            });

            if (response.data?.success) {
                const updatedArticle = response.data.article;

                setArticleState(prev => {
                    const currentState = prev[articleId];
                    const wasLiked = currentState.isLiked;
                    const wasDisliked = currentState.isDisliked;

                    return {
                        ...prev,
                        [articleId]: {
                            isLiked: false, 
                            isDisliked: !wasDisliked,
                            likeCount: wasLiked ? currentState.likeCount - 1 : currentState.likeCount,
                            dislikeCount: wasDisliked ? currentState.dislikeCount - 1 : currentState.dislikeCount + 1,
                            isLoading: false
                        }
                    };
                });

                // Notify parent component if callback provided
                if (onArticleUpdate) {
                    onArticleUpdate(articleId, updatedArticle);
                }
            }
        } catch (error) {
            handleApiError(error as AxiosError);
            setArticleState(prev => ({
                ...prev,
                [articleId]: {
                    ...prev[articleId],
                    isLoading: false
                }
            }));
        }
    },[]);



    const isOwner = (article: IArticle) => {
        return userId && article.user._id === userId;
    };

    return (
        <div className="grid gap-4">
            {data.map((article: IArticle) => {
                const articleData = articleState[article._id] || {
                    isLiked: false,
                    isDisliked: false,
                    likeCount: article.likes?.length || 0,
                    dislikeCount: article.dislikes?.length || 0,
                    isLoading: false
                };
                return (
                    <Card key={article._id} className="border-none shadow-medium bg-background/60 backdrop-blur-lg">
                        <CardHeader className="flex items-start gap-3 p-4">
                            <Avatar
                                src={article?.user?.profileImage || "/images/about2.jpg"}
                                className="w-10 h-10"
                                isBordered
                                name={`${article.user.firstName} ${article.user.lastName}`}
                            />
                            <div className="flex flex-col flex-grow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold">
                                            {article.user.firstName} {article.user.lastName}
                                        </h3>
                                        <p className="text-xs text-default-500">{article.category}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {showEditOptions && isOwner(article) && (
                                            <>
                                                <Tooltip content="Edit article">
                                                    <Button
                                                        isIconOnly
                                                        variant="light"
                                                        size="sm"
                                                        onPress={() => onEdit && onEdit(article)}
                                                        className="h-8 w-8 min-w-0"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Delete article">
                                                    <Button
                                                        isIconOnly
                                                        variant="light"
                                                        color="danger"
                                                        size="sm"
                                                        onPress={() => onDelete && onDelete(article._id)}
                                                        className="h-8 w-8 min-w-0"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </Tooltip>
                                            </>
                                        )}
                                        <Button
                                            variant="light"
                                            size="sm"
                                            onPress={() => toggleExpand(article._id)}
                                            endContent={
                                                expandedId === article._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                            }
                                            className="h-8 px-2"
                                        >
                                            {expandedId === article._id ? "Show Less" : "Read More"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardBody className="px-4 py-0 pb-4">
                            <div className="relative space-y-3">
                                <h2 className="text-lg font-bold tracking-tight">{article.title}</h2>

                                <div className="w-full h-56">
                                    <div className="relative w-full h-full">
                                        <img
                                            src={article?.coverImage || "/images/about2.jpg"}
                                            alt={article?.title}
                                            className="object-cover w-full h-full rounded-md"
                                        />
                                    </div>
                                </div>
                                <p className="text-sm text-default-600 line-clamp-2">{article.description}</p>

                                {expandedId === article._id && (
                                    <>
                                        <Divider className="my-3" />
                                        <div className="space-y-3">
                                            <div className="prose prose-sm max-w-none text-default-600">
                                                {article.content.replace(/\\n/g, '\n').split('\n').map((paragraph, index) => (
                                                    <React.Fragment key={index}>
                                                        {paragraph}
                                                        <br />
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="flex items-center gap-2 pt-2">
                                    <Button
                                        variant="flat"
                                        size="sm"
                                        startContent={<Heart className={`w-4 h-4 ${articleData.isLiked ? "fill-current text-red-500" : ""}`} />}
                                        className={`h-8 px-3 ${articleData.isLiked ? "text-red-500" : "text-default-600"}`}
                                        onPress={() => handleLike(article._id)}
                                        isDisabled={articleData.isLoading}
                                    >
                                        {articleData.likeCount}
                                    </Button>
                                    <Button
                                        variant="flat"
                                        size="sm"
                                        startContent={<ThumbsDown className={`w-4 h-4 ${articleData.isDisliked ? "fill-current text-blue-500" : ""}`} />}
                                        className={`h-8 px-3 ${articleData.isDisliked ? "text-blue-500" : "text-default-600"}`}
                                        onPress={() => handleDislike(article._id)}
                                        isDisabled={articleData.isLoading}
                                    >
                                        {articleData.dislikeCount}
                                    </Button>

                                </div>
                            </div>

                        </CardBody>
                    </Card>
                )
            }

            )}
        </div>
    )
})

export default ArticleCard