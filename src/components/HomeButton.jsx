import { useNavigate } from "react-router-dom";


function HomeButton() {
    const navigate = useNavigate();

    return (
        <button className="homebtn" onClick={() => navigate("/")}>
            Home
        </button>
    );
}



export default HomeButton