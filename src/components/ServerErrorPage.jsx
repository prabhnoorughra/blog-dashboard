

function ServerErrorPage({error}) {
    return(
        <div className="display-3 m-auto d-flex align-items-center justify-content-center text-center h-25 gap-3">
            <span>Error:</span><span className="display-3 text-danger">{error}</span>
        </div>
    );
}


export default ServerErrorPage