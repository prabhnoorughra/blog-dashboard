import { useNavigate } from "react-router-dom";


function HomeButton() {
    const navigate = useNavigate();

    return (
        <button className="homebtn btn btn-primary btn-lg" 
            onClick={() => navigate("/")}>
            Home
        </button>
    );
}



export default HomeButton