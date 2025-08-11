import { useState, useEffect, useContext, useCallback, } from 'react'
import { UserContext } from '../App';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Editor } from '@tinymce/tinymce-react';
import LoadPage from './LoadPage';
import ServerErrorPage from './ServerErrorPage';



function NewPost() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const {token, changeToken, user} = useContext(UserContext); 

    const [title,   setTitle]   = useState('');
    const [content, setContent] = useState('');   // will hold HTML


    const apiURL = import.meta.env.VITE_API_URL;

    async function handleCreatePost(e) {
        e.preventDefault();

        try {
            setLoading(true);
            const response = await fetch(`${apiURL}/${user.username}/posts`, {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization':   `Bearer ${token}`,
                },
                body: JSON.stringify({title, content}),
            });
            if(response.status === 401) {
                //token expired
                changeToken(null);
                navigate("/login");
                return;
            }
            if (response.status >= 500) {
                throw new Error('Create failed');
            }
            setLoading(false);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } 
    }


    if (error)   return <ServerErrorPage error={error}/>;
    if (loading) return <LoadPage message={"Creating Post..."}/>;
    return (
    <>
        <form onSubmit={handleCreatePost} className='px-5 pt-5'>
            <div className="row mb-3">
                <label className='col-form-label col-sm-2 col-form-label-lg' 
                    for="title">Title</label>
                <div className="col-sm-10">
                    <input className='form-control form-control-lg'  onChange={(e) => setTitle(e.target.value)}
                    type="text" required placeholder='Title' name='title' id="title" value={title}/>
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
                <button type='submit' className='col-2 btn btn-success btn-lg'>Create Post</button>
                <button className='col-2 btn btn-warning btn-lg'
                    onClick={() => navigate("/", {replace: true})} type='button'>Cancel</button>
            </div>
        </form>
    </>
    );
}

export default NewPost
