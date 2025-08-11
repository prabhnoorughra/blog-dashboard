import { Link } from "react-router-dom";

function ErrorPage() {
    return (
        <div className="bg-dark vh-100 display-3 d-flex flex-column justify-content-start
        align-items-center pt-5">
            <div className="errorMessage text-danger mt-5 text-center">
                Error Encountered: Invalid Path
                </div>
            <Link to='/' className="errorLink text-dark mt-5 btn btn-warning btn-lg">
                Click to Go Back to the Home Page!
            </Link>
        </div>
    );
}


export default ErrorPage