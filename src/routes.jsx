import App from "./App";
import ErrorPage from "./components/ErrorPage"
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import HomePage from "./components/HomePage";



const routes = [
    {
        path: '/',
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {index: true, element: <HomePage />},
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