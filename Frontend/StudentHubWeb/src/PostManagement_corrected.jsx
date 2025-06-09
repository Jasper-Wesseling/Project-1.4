import { useState, useEffect } from "react";
import './PostManagement.css';
const API_URL = import.meta.env.VITE_API_URL;

export default function PostManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('user');
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!searchTerm) {
            fetchAllPosts(1);
        }
    }, []);

    const fetchAllPosts = async (page = 1) => {
        setLoading(true);
        try {
            const response = await fetch(API_URL + `/api/posts/get?page=${page}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            // Backend now returns structured response with pagination metadata
            setPosts(data.posts || []);
            setTotalPages(data.totalPages || 1);
            setTotalPosts(data.totalPosts || 0);
            setCurrentPage(data.currentPage || page);
        }
        catch (error) {
            console.error('Error fetching posts:', error);
            setPosts([]);
            setTotalPages(1);
            setTotalPosts(0);
        } finally {
            setLoading(false);
        }
    }

    const fetchPostsByUser = async (email, page = 1) => {
        if (!email) {
            console.error('Email is required to fetch posts by user');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(API_URL + `/api/posts/get/user/${email}?page=${page}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            // Backend now returns structured response with pagination metadata
            setPosts(data.posts || []);
            setTotalPages(data.totalPages || 1);
            setTotalPosts(data.totalPosts || 0);
            setCurrentPage(data.currentPage || page);
        }
        catch (error) {
            console.error('Error fetching posts by user:', error);
            setPosts([]);
            setTotalPages(1);
            setTotalPosts(0);
        } finally {
            setLoading(false);
        }
    }

    const fetchPostsByContent = async (content, page = 1) => {
        if (!content) {
            console.error('Content is required to fetch posts by content');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(API_URL + `/api/posts/get/content/${content}?page=${page}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            // Backend now returns structured response with pagination metadata
            setPosts(data.posts || []);
            setTotalPages(data.totalPages || 1);
            setTotalPosts(data.totalPosts || 0);
            setCurrentPage(data.currentPage || page);
        }
        catch (error) {
            console.error('Error fetching posts by content:', error);
            setPosts([]);
            setTotalPages(1);
            setTotalPosts(0);
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (page = 1) => {
        if (searchTerm.trim()) {
            if (searchType === 'user') {
                fetchPostsByUser(searchTerm, page);
            } else {
                fetchPostsByContent(searchTerm, page);
            }
        } else {
            fetchAllPosts(page);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            handleSearch(page);
        }
    };

    const handleDelete = async (postId) => {
        if (!postId) {
            console.error('Post ID is required to delete a post');
            return;
        }
        try {
            const response = await fetch(API_URL + `/api/posts/delete/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setPosts(posts.filter(post => post.id !== postId));
            setTotalPosts(prev => prev - 1);
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    }

    const deleteConfirmation = (postId) => {
        return () => {
            if (window.confirm('Are you sure you want to delete this post? Post title: ' + posts.find(post => post.id === postId).title)) {
                handleDelete(postId);
            }
        };
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`page-btn ${currentPage === i ? 'active' : ''}`}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="pagination">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="page-btn"
                >
                    Previous
                </button>
                {startPage > 1 && (
                    <>
                        <button onClick={() => handlePageChange(1)} className="page-btn">1</button>
                        {startPage > 2 && <span className="page-ellipsis">...</span>}
                    </>
                )}
                {pages}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="page-ellipsis">...</span>}
                        <button onClick={() => handlePageChange(totalPages)} className="page-btn">{totalPages}</button>
                    </>
                )}
                <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="page-btn"
                >
                    Next
                </button>
            </div>
        );
    };

    return (
        <div className="post-management">
            <div className="dashboard-header">
                <h1>Posts Dashboard</h1>
                <p>Manage and monitor all posts across the platform</p>
            </div>
            
            <div className="search-section">
                <div className="search-controls">
                    <div className="search-input-group">
                        <div className="search-input-wrapper">
                            <input 
                                type="text" 
                                placeholder={searchType === 'user' ? 'Enter user email...' : 'Enter search term...'}
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                value={searchTerm}
                                className="search-input"
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => {
                                        setSearchTerm('');
                                        fetchAllPosts(1);
                                    }} 
                                    className="clear-btn"
                                    title="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <button onClick={() => handleSearch(1)} className="search-btn">
                            <span>🔍</span>
                            Search
                        </button>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="searchType">Search by:</label>
                        <select 
                            name="searchType" 
                            id="searchType" 
                            onChange={(e) => {setSearchType(e.target.value); setSearchTerm('');}}
                            className="filter-select"
                        >
                            <option value="user">User</option>
                            <option value="containing">Content</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="results-section">
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : posts.length > 0 ? (
                    <div className="posts-container">
                        <div className="results-header">
                            <h2>
                                {searchTerm ? (
                                    searchType === 'user' 
                                        ? `Posts by User: ${searchTerm}` 
                                        : `Posts containing: "${searchTerm}"`
                                ) : 'All Posts'}
                            </h2>
                            <span className="results-count">
                                {totalPosts} post{totalPosts !== 1 ? 's' : ''} found 
                                (Page {currentPage} of {totalPages})
                            </span>
                        </div>
                        <div className="posts-grid">
                            {posts.map((post, index) => (
                                <div key={index} className="post-card">
                                    <div className="post-header">
                                        <div className="post-meta">
                                            <span className="user-badge">{post.user}</span>
                                            <span className="time-badge">{post.days_ago} days ago</span>
                                        </div>
                                        <button 
                                            onClick={deleteConfirmation(post.id)}
                                            className="delete-btn"
                                            title="Delete post"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    <div className="post-content">
                                        <h3 className="post-title">{post.title}</h3>
                                        <p className="post-description">{post.description}</p>
                                    </div>
                                    <div className="post-actions">
                                        <span className="post-id">ID: {post.id}</span>
                                        <div className="action-buttons">
                                            <button className="edit-btn">Edit</button>
                                            <button className="view-btn">View</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {renderPagination()}
                    </div>
                ) : (
                    <div className="no-results">
                        <div className="no-results-icon">📝</div>
                        <h3>No posts found</h3>
                        <p>Try adjusting your search terms or search criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
}
