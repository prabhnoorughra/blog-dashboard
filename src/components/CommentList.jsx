import { useState, useEffect, useContext, useCallback, } from 'react'
import { UserContext } from '../App';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import LoadPage from './LoadPage';
import ServerErrorPage from './ServerErrorPage';

const dateFmt = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const formatDate = (d) => d ? dateFmt.format(new Date(d)) : '';


function CommentList() {
    const navigate = useNavigate();
    const {token, changeToken, user} = useContext(UserContext); 
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState([]);
    const { postId } = useParams();

    const apiURL = import.meta.env.VITE_API_URL;

    const fetchComments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiURL}/${user.username}/posts/${postId}/comments`, {
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
            setComments(data);
            setLoading(false);
        } catch(err) {
            setError(err.message);
        }
    }, [apiURL, token, user, changeToken, navigate, postId]);

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
            setLoading(false);
            await fetchComments(); //refresh comments after deleting a comment
        } catch(err) {
            setError(err.message);
        }
    }

    if (error)   return <ServerErrorPage error={error}/>;
    if (loading) return <LoadPage message={"Loading..."}/>;
    return (
    <>
        {comments.length === 0 && (
            <>
                <div className='h-75 d-flex flex-column align-items-center mt-5 text-dark display-3 fw-light gap-5' 
                    style={{backgroundColor: '#9de1fcff'}}><span>No Comments</span>
                     <button className='btn btn-primary btn-lg fs-4'
                     onClick={() => navigate(-1)} type='button'>Back</button>
                </div>
            </>
        )}
        {comments.length != 0 && (
            <div className='h-75'>
                <div className="p-2 d-flex justify-content-center">
                    <button className='btn btn-primary btn-lg fs-3'
                    onClick={() => navigate(-1)} type='button'>Back</button>
                </div>
                <div className="commentList h-100 p-2 container-fluid overflow-x-hidden p-4 overflow-y-auto pt-2">
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 gy-3 gx-3 mt-0">
                        {comments.map((comment) => {
                            return (
                                <div className="col">
                                    <div className='comment card bg-secondary text-white shadow-lg h-100' 
                                    key={comment.id}>
                                        <div className="card-body">
                                            <div className="commentCreator card-title fs-4 text-center">{comment.creator.username}</div>
                                            <div className="commentContent card-subtitle fs-4 text-center text-info overflow-auto"
                                                style={{maxHeight: "20vh"}}>
                                                {comment.content}
                                            </div>
                                            <div className="commentStats  fs-5 text-center d-grid">
                                                <div className='row'>
                                                    <span className="poststat col">Likes: {comment.CommentLikes.length}</span>
                                                    <span className="poststat col">Replies: {comment.replies.length}</span>
                                                </div>
                                            </div>
                                            <div className="commenttimes">
                                                <div className="commentCreated text-center">
                                                    Created: {formatDate(comment.createdAt)}
                                                </div>
                                            </div>
                                            <div className="commentbuttons container-fluid mt-3">
                                                <div className="row justify-content-center">
                                                    {comment.replies.length != 0 &&<button className='col-6 text-center btn btn-primary'
                                                    onClick={() => navigate(`/comment/${postId}/${comment.id}`)}>Replies</button>}
                                                    <button className='col-6 text-center btn btn-danger'
                                                    onClick={() => handleDelete(comment.id)}>Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
            </div>
        )}
    </>
    );
}

export default CommentList
