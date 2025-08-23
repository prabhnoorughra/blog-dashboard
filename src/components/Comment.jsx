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

function Comment({postId, commentId, content, creator, likes, replies, createdAt, handleDelete}) {
    const navigate = useNavigate();
    return (
         <div className="col" key={commentId}>
            <div className='comment card bg-secondary text-white shadow-sm h-100'>
                <div className="card-body">
                    <div className="commentCreator card-title fs-4 text-center">{creator.username}</div>
                    <div className="commentContent card-subtitle fs-4 text-center text-info overflow-auto"
                        style={{maxHeight: "20vh"}}>
                        {content}
                    </div>
                    <div className="commentStats  fs-5 text-center d-grid">
                        <div className='row'>
                            <span className="poststat col">Likes: {likes}</span>
                            <span className="poststat col">Replies: {replies}</span>
                        </div>
                    </div>
                    <div className="commenttimes">
                        <div className="commentCreated text-center">
                            {formatDate(createdAt)}
                        </div>
                    </div>
                    <div className="commentbuttons container-fluid mt-3">
                        <div className="row justify-content-center">
                            {replies != 0 &&<button className='col-6 text-center btn btn-primary'
                            onClick={() => navigate(`/comment/${postId}/${commentId}`)}>Replies</button>}
                            <button className='col-6 text-center btn btn-danger'
                            onClick={() => handleDelete(commentId)}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Comment