import { Link } from "react-router-dom";

function ErrorPage() {
    return (
        <div className="errorPage">
            <div className="errorMessage">Error Encountered: Invalid Path</div>
            <Link to='/' className="errorLink">
                Click to Go Back to the Home Page!
            </Link>
        </div>
    );
}


export default ErrorPage