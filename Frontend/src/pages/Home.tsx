import { useEffect, useState } from 'react';
import { Input, Pagination } from "@nextui-org/react";
import { Search } from "lucide-react";
import DynamicBackground from '../components/common/DynamicBackground';
import ArticleCard from '../components/articles/Article-card';
import { writingInterests } from '../utils/interfaces/types';
import { useSelector } from 'react-redux';
import UserRootState from '../redux/rootstate/UserState';
import { axiosInstance } from '../config/api/axiosInstance';
import { handleApiError } from '../utils/helpers/HandleApiError';
import { AxiosError } from 'axios';
import { IArticle } from '../utils/interfaces/interfaces';
import CategoryScroll from '../components/articles/CategoryScroll';
import Sidebar from '../components/articles/Sidebar';

const Home = () => {
    const userInfo = useSelector((state: UserRootState) => state?.user?.userData)
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [articles, setArticles] = useState<IArticle[]>([]);
    const [loading, setLoading] = useState(false);
    const ITEMS_PER_PAGE = 3;

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/home', {
                withCredentials: true
            });
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

    const handleArticleUpdate = (articleId: string, updatedArticle: IArticle) => {
        setArticles(prevArticles =>
            prevArticles.map(article =>
                article._id === articleId ? updatedArticle : article
            )
        );
    };

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All"
            ? userInfo?.interests.includes(article.category) || userInfo?.interests.length === 0
            : article.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const paginatedArticles = filteredArticles.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <DynamicBackground
                filepath="/images/about2.jpg"
                height="h-60"
                type="image"
                className="w-full"
            />

            <main className="max-w-screen-2xl mx-auto px-4 md:px-6 relative z-10 -mt-20">
                <div className="flex flex-col lg:flex-row gap-8">
                   
                    <div className="hidden md:block">
                        <Sidebar
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            userInfo={userInfo}
                            articles={articles}
                        />
                    </div>


                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="max-w-2xl mx-auto mb-8">
                                <h1 className="text-3xl font-bold text-center mb-6">All Articles</h1>
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

                            <div className="lg:hidden mb-6">
                                <CategoryScroll
                                    categories={writingInterests}
                                    selectedCategory={selectedCategory}
                                    onCategorySelect={setSelectedCategory}
                                />
                            </div>

                            <div className="grid gap-6">
                                {loading ? (
                                    <div className="text-center py-8">Loading articles...</div>
                                ) : paginatedArticles.length > 0 ? (
                                    <ArticleCard
                                        data={paginatedArticles}
                                        userId={userInfo?._id || ""}
                                        onArticleUpdate={handleArticleUpdate}
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
        </div>
    );
};

export default Home;