import App from "./App";
import ErrorPage from "./components/ErrorPage"
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import HomePage from "./components/HomePage";
import PostListDisplay from "./components/PostListDisplay";
import NewPost from "./components/NewPost";
import EditPost from "./components/EditPost";
import CommentList from "./components/CommentList";



const routes = [
    {
        path: '/',
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {
                element: <HomePage />,
                children: [
                    { index: true,                                      element: <PostListDisplay /> },
                    { path: 'new',                                      element: <NewPost /> },
                    { path: 'edit/:postId',                             element: <EditPost /> },  
                    { path: 'comments/:postId',                         element: <CommentList /> },    
                    { path: 'comment/:postId/:commentId',               element: <CommentList /> },
                ]
            },
            {path: "login", element: <LoginPage />},
            {path: "sign-up", element: <SignupPage />},
        ],
    },
    {
        path: "*", 
        element: <ErrorPage />,
    },
];

export default routes