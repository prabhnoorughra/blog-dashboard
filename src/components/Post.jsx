import { useNavigate } from "react-router-dom";

const dateFmt = new Intl.DateTimeFormat(undefined, {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const formatDate = (d) => d ? dateFmt.format(new Date(d)) : '';

function Post({postId, title, content, likes, comments, updatedAt, createdAt, published,
    handleDelete, changePublish}) {
    const navigate = useNavigate();

    return (
        <div className="col" key={postId}>
            <div className='post card h-100 bg-secondary text-white shadow-sm'>
                <div className="card-body">
                    <div className="postTitle card-title fs-2 text-center">{title}</div>
                    <div className="poststats card-subtitle fs-5 text-center d-grid">
                        <div className="row">
                            <span className="poststat col">Likes: {likes}</span>
                            <span className="poststat col">Comments: {comments}</span>
                        </div>
                    </div>
                    <div className="posttimes card-text my-1">
                        <div className="postupdated text-center">
                            Updated: {formatDate(updatedAt)}
                        </div>
                        <div className="postcreated text-center">
                            Created: {formatDate(createdAt)}
                        </div>
                    </div>
                    <div className="postbuttons container-fluid mt-3">
                        <div className="row g-2">
                            <div className="col-6 text-center">
                                <button className='w-100 btn btn-primary'
                                onClick={() => navigate(`/edit/${postId}`)}>Edit</button>
                            </div>
                            <div className="col-6 text-center">
                                <button className='w-100 btn btn-primary'
                                onClick={() => navigate(`/comments/${postId}`)}>Comments</button>
                            </div>
                            <div className="col-6 text-center">
                                {published && (
                                    <button className='w-100 btn btn-warning'
                                    onClick={() => changePublish(postId, false, title, content)}>Archive</button>
                                )}
                                {!published && (
                                    <button className='w-100 btn btn-success'
                                    onClick={() => changePublish(postId, true, title, content)}>Publish</button>
                                )}
                            </div>
                            <div className="col-6 text-center">
                                <button className='w-100 btn btn-danger'
                                onClick={() => handleDelete(postId)}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default Post