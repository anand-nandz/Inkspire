import { Button } from "@nextui-org/react";
import { SidebarProps } from "../../utils/interfaces/interfaces";

const Sidebar: React.FC<SidebarProps> = ({
    selectedCategory,
    setSelectedCategory,
    userInfo,
    articles
}) => {

    const topPosts = [...articles]
        .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
        .slice(0, 5);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 lg:w-72">
            {/* Categories Card */}
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

            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Top Posts</h2>
                <div className="flex flex-col gap-4">
                    {topPosts.map((post, index) => (
                        <div key={post._id} className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-sm line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {post.likes?.length || 0} likes
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;