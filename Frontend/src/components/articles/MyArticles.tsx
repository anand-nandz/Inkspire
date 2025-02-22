import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Input, Button, Pagination } from "@nextui-org/react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector } from 'react-redux';
import UserRootState from '../../redux/rootstate/UserState';
import { ArticleStatus, writingInterests } from '../../utils/interfaces/types';
import ArticleCard from './Article-card';
import { handleApiError } from '../../utils/helpers/HandleApiError';
import { AxiosError } from 'axios';
import Swal from 'sweetalert2';
import { axiosInstance } from '../../config/api/axiosInstance';
import { IArticle } from '../../utils/interfaces/interfaces';
import EditArticleModal from './EditArticleModal';

const MyArticles = () => {
    const userInfo = useSelector((state: UserRootState) => state.user.userData);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [articles, setArticles] = useState<IArticle[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<IArticle | null>(null);

    const ITEMS_PER_PAGE = 3;

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/articles', {
                withCredentials: true
            });
            console.log(response.data.data, 'getarticlesss');

            if (response.data?.success) {
                setArticles(response.data.data);
            }
        } catch (error) {
            handleApiError(error as AxiosError);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleEditArticle = useCallback((article: IArticle) => {
        console.log(article, 'article for edit');

        setSelectedArticle(article);
        setIsEditModalOpen(true);
    }, []);

    useEffect(() => {
        console.log('Component mounted once');
    }, []);



    const handleSave = (updatedArticle: IArticle) => {
        setArticles(prevArticles =>
            prevArticles.map(article =>
                article._id === updatedArticle._id ? updatedArticle : article
            )
        );
    };

    const handleDeleteArticle = async (articleId: string) => {
        alert(articleId)
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {

                const response = await axiosInstance.patch(`/articles/${articleId}`, {
                    withCredentials: true
                });
                console.log(response.data, 'delete handle');


                if (response.data?.success) {
                    setArticles(prevArticles =>
                        prevArticles.filter(article => article._id !== articleId)
                    );
                    Swal.fire(
                        'Deleted!',
                        'Your article has been deleted.',
                        'success'
                    );
                }
            } catch (error) {
                Swal.fire(
                    'Error!',
                    'There was a problem deleting your article.',
                    'error'
                );
                handleApiError(error as AxiosError);
            }
        }
    };


    const filteredArticles = useMemo(() => {
        return articles.filter(article => {
            const isPublished = article.articleStatus === ArticleStatus.Published;
            const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
            return isPublished && matchesSearch && matchesCategory;
        });
    }, [articles, searchTerm, selectedCategory]);

    const paginatedArticles = useMemo(() => {
        return filteredArticles.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );
    }, [filteredArticles, currentPage]);

    return (
        <>
            <main className="max-w-screen-2xl mx-auto px-4 md:px-6 relative z-10 mt-14">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Left Side */}
                    <div className="hidden md:block lg:w-72">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-4">Categories</h2>
                            <div className="flex flex-col gap-2">
                                <Button
                                    key="All"
                                    variant={selectedCategory === "All" ? "solid" : "light"}
                                    onPress={() => setSelectedCategory("All")}
                                    className="w-full justify-start"
                                    size="sm"
                                >
                                    All
                                </Button>
                                {userInfo?.interests.map((category) => (
                                    <Button
                                        key={category}
                                        variant={selectedCategory === category ? "solid" : "light"}
                                        onPress={() => setSelectedCategory(category)}
                                        className="w-full justify-start"
                                        size="sm"
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            {/* Title and Search Section */}
                            <div className="max-w-2xl mx-auto mb-8">
                                <h1 className="text-3xl font-bold text-center mb-6">My Articles</h1>
                                <Input
                                    placeholder="Search articles..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    startContent={<Search className="text-default-400" size={20} />}
                                    classNames={{
                                        inputWrapper: "h-12 rounded-full"
                                    }}
                                />
                            </div>

                            {/* Mobile Categories Scroll */}
                            <div className="lg:hidden relative mb-6">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 shadow-sm"
                                    onPress={() => scroll('left')}
                                >
                                    <ChevronLeft size={20} />
                                </Button>

                                <div
                                    ref={scrollContainerRef}
                                    className="flex space-x-2 overflow-x-auto scrollbar-hide scroll-smooth px-4 max-w-full"
                                >
                                    <Button
                                        key="All"
                                        variant={selectedCategory === "All" ? "solid" : "light"}
                                        onPress={() => setSelectedCategory("All")}
                                        className="whitespace-nowrap"
                                        size="sm"
                                    >
                                        All
                                    </Button>
                                    {writingInterests.map((category) => (
                                        <Button
                                            key={category}
                                            variant={selectedCategory === category ? "solid" : "light"}
                                            onPress={() => setSelectedCategory(category)}
                                            className="whitespace-nowrap"
                                            size="sm"
                                        >
                                            {category}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    isIconOnly
                                    variant="light"
                                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 shadow-sm"
                                    onPress={() => scroll('right')}
                                >
                                    <ChevronRight size={20} />
                                </Button>
                            </div>

                            <div className="grid gap-6">
                                {loading ? (
                                    <div className="text-center py-8">Loading articles...</div>
                                ) : paginatedArticles.length > 0 ? (
                                    <ArticleCard
                                        data={paginatedArticles}
                                        userId={userInfo?._id || ""}
                                        showEditOptions={true}
                                        onEdit={(article) => handleEditArticle(article)}
                                        onDelete={handleDeleteArticle}
                                    />
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No articles found
                                    </div>
                                )}
                            </div>

                            {filteredArticles.length > 0 && (
                                <div className="flex justify-center mt-8">
                                    <Pagination
                                        total={Math.ceil(filteredArticles.length / ITEMS_PER_PAGE)}
                                        initialPage={1}
                                        page={currentPage}
                                        onChange={setCurrentPage}
                                        showControls
                                        color="primary"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            {isEditModalOpen && selectedArticle && (
                <EditArticleModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    article={selectedArticle}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default MyArticles;