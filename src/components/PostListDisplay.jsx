import { useState, useEffect, useContext, useCallback, } from 'react'
import { UserContext } from '../App';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import LoadPage from './LoadPage';
import ServerErrorPage from './ServerErrorPage';
import Post from './Post';
import Pagination from './Pagination';


function PostListDisplay() {
    const navigate = useNavigate();
    const {token, changeToken, user} = useContext(UserContext); 
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState();

    const [query, setQuery] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [published, setPublished] = useState(null);
    const [uploadFilter, setUploadFilter] = useState("desc");

    const [page, setPage] = useState(1);
    const apiURL = import.meta.env.VITE_API_URL;
    const take = 25;

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const baseURL = `${apiURL}/${user.username}/posts`;
            const options = `?page=${page}&take=${take}&published=${published}&uploadFilter=${uploadFilter}`;
            const finalURL = query === '' ? baseURL + options : baseURL + options + `&search=${query}`;
            const response = await fetch(finalURL, {
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
            setData(data);
            setLoading(false);
            if(page > data.pagination.totalPages) {
                setPage(data.pagination.totalPages);
            }
        } catch(err) {
            setError(err.message);
        }
    }, [apiURL, token, user, changeToken, navigate, page, published, uploadFilter, query]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts, query, published, uploadFilter]);

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
            if(response.status >= 500 || !response.ok) {
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

    function changePublished(value) {
        setPublished(value);
        setPage(1);
    }

    function changeUploadFilter(value) {
        setUploadFilter(value);
        setPage(1);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setPage(1);
        setQuery(searchTerm);
        /* await fetchData(); */
        console.log("done");
    }

    function changePage(value) {
        setPage(value);
    }

    
    if (error)   return <ServerErrorPage error={error}/>;
    if (loading) return <LoadPage message={"Loading..."}/>;

    console.log(data);

    return (
    <>
        <div className='flex-grow-1 d-flex flex-column h-100'>
            <div className="navbar py-4 d-flex flex-column flex-lg-row
            align-items-center gap-3 py-3 justify-content-center">
                <div className="btn-group ms-sm-5">
                    <button className={`btn btn-outline-success ${published === true ? 'btn-success text-black' : 'bg-white'}`}
                        onClick={() => changePublished(true)}>
                        Published
                    </button>
                    <button className={`btn btn-outline-info ${published === null ? 'btn-info text-black' : 'bg-white'}`}
                        onClick={() => changePublished(null)}>
                        All
                    </button>
                    <button className={`btn btn-outline-warning ${published === false ? 'btn-warning text-black' : 'bg-white'}`}
                        onClick={() => changePublished(false)}>
                        Archived
                    </button>
                </div>
                <form className="form-inline row g-2 align-items-center justify-content-center flex-grow-1" onSubmit={handleSubmit}>
                    <div className="col-10 col-sm-6">
                        <input className="form-control me-sm-2" type="search" placeholder="Search" value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}/>
                    </div>
                    <div className="col-auto d-flex justify-content-center">
                        <button className="btn btn-outline-success my-2 my-sm-0" type="submit">
                            Search
                        </button>
                            <button className="btn btn-outline-danger my-2 my-sm-0 me-0 ms-2" type="button"
                                onClick={() => {
                                    setQuery('');
                                    setSearchTerm('');
                                    setPublished(null);
                                    setUploadFilter("desc");
                                    setPage(1);
                                }}>
                                Clear Search
                        </button>
                    </div>
                </form>
                <div className='d-flex gap-3'>
                    <div className="btn-group">
                        <button className={`btn btn-outline-primary ${uploadFilter === "desc" ? 'active' : 'bg-white'}`}
                            onClick={() => changeUploadFilter("desc")}>
                            Latest
                        </button>
                        <button className={`btn btn-outline-primary ${uploadFilter === "asc" ? 'active' : 'bg-white'}`}
                            onClick={() => changeUploadFilter("asc")}>
                            Oldest
                        </button>
                    </div>
                    <button className='btn btn-success py-3 fs-6 ms-sm-auto me-sm-5 btn-lg fw-bold'
                    onClick={() => navigate("/new")}>New Post</button>
                </div>
            </div>
            <div className='flex-grow-1 overflow-auto' style={{ minHeight: 0 }}>
                {data && data.posts.length === 0 && (
                    <div className='d-flex justify-content-center mt-1 text-dark display-3 fw-light'
                    style={{backgroundColor: '#9de1fcff'}}><span>No Posts</span>
                    </div>
                )}
                {data && data.posts.length != 0 && (
                    <div className="postList p-2 overflow-y-auto container-fluid overflow-x-hidden mb-2">
                        <div className='row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 gy-3 gx-3 mt-0 h-100'>
                            {data.posts.map((post) => {
                                return (
                                    <Post postId={post.id} title={post.title} likes={post._count.PostLikes} comments={post._count.comments} 
                                    createdAt={post.createdAt} updatedAt={post.updatedAt} 
                                    content={post.content} published={post.published} 
                                    handleDelete={handleDelete} changePublish={changePublish}/>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            <Pagination page={page} data={data} changePage={changePage} />
        </div>
    </>
    );
}

export default PostListDisplay
