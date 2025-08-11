import { useState, useEffect, useContext, useCallback, } from 'react'
import { UserContext } from '../App';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import LoadPage from './LoadPage';
import ServerErrorPage from './ServerErrorPage';

const dateFmt = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const formatDate = (d) => d ? dateFmt.format(new Date(d)) : '';

function PostListDisplay() {
    const navigate = useNavigate();
    const {token, changeToken, user} = useContext(UserContext); 
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([]);

    const apiURL = import.meta.env.VITE_API_URL;

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiURL}/${user.username}/posts`, {
                method: 'GET',
                headers: {'Authorization': `Bearer ${token}`},
            });
            if(response.status === 401) {
                //tokens expired if 401
                changeToken(null);
                navigate("/login");
                return;
            }
            if(response.status >= 500) {
                throw new Error("Failed to Load Posts");
            }
            const data = await response.json();
            setPosts(data);
            setLoading(false);
        } catch(err) {
            setError(err.message);
        }
    }, [apiURL, token, user, changeToken, navigate]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    async function handleDelete(postid) {
        setLoading(true);
        try {
            const response = await fetch(`${apiURL}/${user.username}/posts/${postid}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${token}`},
            });
            if(response.status === 401) {
                //tokens expired if 401
                changeToken(null);
                navigate("/login");
                return;
            }
            if(response.status === 404) {
                //post doesnt exist
                navigate("/404notfound");
                return;
            }
            if(response.status >= 500) {
                throw new Error("Failed to Delete Post");
            }
            setLoading(false);
            await fetchPosts(); //refresh posts after deleting a post
        } catch(err) {
            setError(err.message);
        } 
    }

    async function changePublish(postid, publish, title, content) {
        const post = {
            title: title,
            content: content,
            published: publish
        };
        setLoading(true);
        try {
            const response = await fetch(`${apiURL}/${user.username}/posts/${postid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization':   `Bearer ${token}`,
                },
                body: JSON.stringify(post),
            });
            if(response.status === 401) {
                //tokens expired if 401
                changeToken(null);
                navigate("/login");
                return;
            }
            if(response.status === 404) {
                //post doesnt exist
                navigate("/404notfound");
                return;
            }
            if(response.status >= 500) {
                throw new Error("Failed to Change Post Publish Status");
            }
            setLoading(false);
            await fetchPosts(); //refresh posts after published/unpublishing a post
        } catch(err) {
            setError(err.message);
        }
    }
    
    if (error)   return <ServerErrorPage error={error}/>;
    if (loading) return <LoadPage message={"Loading..."}/>;

    return (
    <>
        <div className="container-fluid py-4 d-flex flex-column flex-sm-row 
        align-items-center gap-3 py-3">
            <div className='text-black fs-6 d-none d-sm-flex align-items-center flex-sm-row 
            flex-column justify-content-center'>
                <span className='fs-5'>Welcome Back,</span>
                <span className='text-bg-primary ms-2 p-2 rounded-pill fst-italic fw-bold overflow-auto'>
                    {user.username}
                </span>
            </div>
            <button className='btn btn-success py-3 fs-6 ms-sm-auto me-sm-5 btn-lg fw-bold'
            onClick={() => navigate("/new")}>New Post</button>
        </div>
        {posts.length === 0 && (
            <div className='h-75 d-flex justify-content-center mt-5 text-dark display-3 fw-light' 
            style={{backgroundColor: '#9de1fcff'}}><span>No Posts</span>
            </div>
        )}
        {posts.length != 0 && (
            <div className="postList h-75 p-2 overflow-y-auto container-fluid overflow-x-hidden">
                <div className='row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 gy-3 gx-3 mt-0 h-100'>
                    {posts.map((post) => {
                        return (
                            <div className="col">
                                <div className='post card h-100 bg-secondary text-white shadow-lg' key={post.id}>
                                    <div className="card-body">
                                        <div className="postTitle card-title fs-2 text-center">{post.title}</div>
                                        <div className="poststats card-subtitle fs-5 text-center d-grid">
                                            <div className="row">
                                                <span className="poststat col">Likes: {post.PostLikes.length}</span>
                                                <span className="poststat col">Comments: {post.comments.length}</span>
                                            </div>
                                        </div>
                                        <div className="posttimes card-text my-1">
                                            <div className="postupdated text-center">
                                                Updated: {formatDate(post.updatedAt)}
                                            </div>
                                            <div className="postcreated text-center">
                                                Created: {formatDate(post.createdAt)}
                                            </div>
                                        </div>
                                        <div className="postbuttons container-fluid mt-3">
                                            <div className="row g-2">
                                                <div className="col-6 text-center">
                                                    <button className='w-100 btn btn-primary'
                                                    onClick={() => navigate(`/edit/${post.id}`)}>Edit</button>
                                                </div>
                                                <div className="col-6 text-center">
                                                    <button className='w-100 btn btn-primary'
                                                    onClick={() => navigate(`/comments/${post.id}`)}>Comments</button>
                                                </div>
                                                <div className="col-6 text-center">
                                                    {post.published && (
                                                        <button className='w-100 btn btn-warning'
                                                        onClick={() => changePublish(post.id, false, post.title, post.content)}>Archive</button>
                                                    )}
                                                    {!post.published && (
                                                        <button className='w-100 btn btn-success'
                                                        onClick={() => changePublish(post.id, true, post.title, post.content)}>Publish</button>
                                                    )}
                                                </div>
                                                <div className="col-6 text-center">
                                                    <button className='w-100 btn btn-danger'
                                                    onClick={() => handleDelete(post.id)}>Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
    </>
    );
}

export default PostListDisplay
