import { useState, useEffect, useContext, useCallback, } from 'react'
import { UserContext } from '../App';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Editor } from '@tinymce/tinymce-react';
import LoadPage from './LoadPage';
import ServerErrorPage from './ServerErrorPage';



function EditPost() {
    const navigate = useNavigate();
    const [loadmessage, setLoadmessage] = useState("Loading...");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [title,   setTitle]   = useState('');
    const [content, setContent] = useState(''); //HTML string
    const [published, setPublished] = useState(null);

    const {token, changeToken, user} = useContext(UserContext); 
    const apiURL = import.meta.env.VITE_API_URL;
    const { postId } = useParams();


    //grabbing the exisitng values of the post we are trying to edit
    useEffect(() => async() => {
        try {
            setLoading(true);
            const response = await fetch(`${apiURL}/${user.username}/posts/${postId}`, {
                method:  'GET',
                headers: {
                    'Authorization':   `Bearer ${token}`,
                },
            });
            if(response.status === 401) {
                //token expired
                changeToken(null);
                navigate("/login", { replace: true });
                return;
            }
            if(response.status === 404) {
                //post doesnt exist
                navigate("/404notfound", { replace: true });
                return;
            }
            if (response.status >= 500) {
                throw new Error('Server failed to find post');
            }
            const data = await response.json();
            setContent(data.content);
            setTitle(data.title);
            setPublished(data.published);
            setLoading(false);
        } catch (err) {
            setError(err.message);
        } 
    }, [postId, apiURL, changeToken, navigate, user, token]);

    async function handleEditPost(e) {
        e.preventDefault();
        try {
            setLoadmessage("Saving...");
            setLoading(true);
            const response = await fetch(`${apiURL}/${user.username}/posts/${postId}`, {
                method:  'PUT',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization':   `Bearer ${token}`,
                },
                body: JSON.stringify({title, content, published}),
            });
            if(response.status === 401) {
                //token expired
                changeToken(null);
                navigate("/login");
                return;
            }
            if(response.status === 404) {
                //post doesnt exist
                navigate("/404notfound");
                return;
            }
            if (response.status >= 500) {
                throw new Error('Edit failed');
            }
            setLoading(false);
            setLoadmessage("Loading...");
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    }

    if (error)   return <ServerErrorPage error={error}/>;
    if (loading) return <LoadPage message={loadmessage}/>;
   
    return (
    <>
        <form onSubmit={handleEditPost} className='px-5 pt-5'>
            <div className="row mb-3 align-items-center">
                <label className='col-form-label col-sm-1 col-form-label-lg text-end' 
                    for="title">Title</label>
                <div className="col-sm-5">
                    <input className='form-control form-control-lg'  onChange={(e) => setTitle(e.target.value)}
                    type="text" required placeholder='Title' name='title' id="title" value={title}/>
                </div>
                <div className="col-sm-4 d-flex justify-content-center">
                    <div className="form-check">
                        <label className='form-check-label fs-5' for="published">Published</label>
                        <input name="published" type="checkbox" id='published'  
                        className='form-check-input fs-5'
                        checked={published} onChange={e => setPublished(e.target.checked)}/>
                    </div>
                </div>
            </div>
            <Editor
                apiKey={import.meta.env.VITE_TINY_API_KEY}
                value={content}
                init={{
                    height: "70vh",
                    menubar: false,
                    plugins:
                        `advlist autolink lists link image charmap preview anchor
                        searchreplace visualblocks code fullscreen
                        insertdatetime media table paste help wordcount`
                    ,
                    toolbar:
                        `undo redo | formatselect | bold italic underline strikethrough backcolor | 
                        alignleft aligncenter alignright alignjustify | link image media table |
                        bullist numlist outdent indent | removeformat | preview | help`
                    ,
                }}
                onEditorChange={(newHtml) => setContent(newHtml)}
            />
            <div className="row justify-content-center mt-3 gap-1">
                <button type='submit' className='col-2 btn btn-success btn-lg'>Save</button>
                <button className='col-2 btn btn-warning btn-lg'
                    onClick={() => navigate(-1)}>Cancel</button>
            </div>
        </form>
    </>
    );
}

export default EditPost
