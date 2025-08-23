import { useState, useEffect, useContext, useCallback, } from 'react'
import { UserContext } from '../App';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import LoadPage from './LoadPage';
import ServerErrorPage from './ServerErrorPage';
import Comment from './Comment';
import Pagination from './Pagination';



function CommentList() {
    const navigate = useNavigate();
    const {token, changeToken, user} = useContext(UserContext); 
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState();
    const { postId, commentId } = useParams();

    const [page, setPage] = useState(1);
    const apiURL = import.meta.env.VITE_API_URL;
    const take = 10;

    const arr = data ? (data.comments || data.comment.replies) : [];

    const fetchComments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiURL}/${user.username}/posts/${postId}/comments/${commentId ? commentId : ""}?page=${page}&take=${take}`, {
                method: 'GET',
                headers: {'Authorization': `Bearer ${token}`},
            });
            if(response.status === 401) {
                //tokens expired if 401
                changeToken(null);
                navigate("/login", { replace: true });
                return;
            }
            if(response.status === 404) {
                //post doesnt exist
                 navigate("/404notfound", { replace: true });
                return;
            }
            if(response.status >= 500) {
                throw new Error("Failed to Load Comments");
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
    }, [apiURL, token, user, changeToken, navigate, postId, page, commentId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    async function handleDelete(commentid) {
        setLoading(true);
        try {
            const response = await fetch(`${apiURL}/${user.username}/posts/${postId}/comments/${commentid}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${token}`},
            });
            if(response.status === 401) {
                //tokens expired if 401
                changeToken(null);
                navigate("/login", { replace: true });
                return;
            }
            if(response.status === 404) {
                //comment doesnt exist
                navigate("/404notfound", { replace: true });
                return;
            }
            if(response.status >= 500) {
                throw new Error("Failed to Delete Comment");
            }
            await fetchComments(); //refresh comments after deleting a comment
        } catch(err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function changePage(value) {
        setPage(value);
    }

    console.log(data);
    console.log(arr);

    if (error)   return <ServerErrorPage error={error}/>;
    if (loading) return <LoadPage message={"Loading..."}/>;
    return (
    <>
        <div className='flex-grow-1 d-flex flex-column h-100'>
            <div className="navbar py-4 d-flex flex-column flex-lg-row
                align-items-center gap-3 py-3 justify-content-center">
                <div className="p-2 d-flex justify-content-center">
                    <button className='btn btn-primary btn-lg fs-3'
                    onClick={() => navigate(-1)} type='button'>Back</button>
                </div>
            </div>
            <div className='flex-grow-1 overflow-auto' style={{ minHeight: 0 }}>
                {arr.length === 0 && (
                    <div className='d-flex flex-column align-items-center mt-5 text-dark display-3 fw-light gap-5'
                        style={{backgroundColor: '#9de1fcff'}}><span>No Comments</span>
                    </div>
                )}
                {arr.length != 0 && (
                    <div className="commentList h-100 p-2 container-fluid overflow-x-hidden p-4 overflow-y-auto pt-2">
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 gy-3 gx-3 mt-0">
                            {arr.map((comment) => {
                                return (
                                    <Comment postId={postId} commentId={comment.id}
                                    creator={comment.creator} content={comment.content}
                                    createdAt={comment.createdAt} likes={comment._count.CommentLikes}
                                    replies={comment._count.replies} handleDelete={handleDelete}/>
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

export default CommentList
