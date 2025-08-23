

function Pagination({data, page, changePage}) {
    return (
        <div className="pagination justify-content-center py-2"
            style={{backgroundColor: '#9de1fcff'}}>
            {data && (
            <div className={`page-item ${page <= 1 ? "disabled" : ""}`}
                onClick={() => {
                    if(page > 1) {
                        changePage(page - 1);
                    }
                }}>
                <a className="page-link btn btn-link">Prev</a>
            </div>
            )}
            {data && page === data.pagination.totalPages && page - 2 > 0 && (
            <div className='page-item'
                onClick={() => changePage(page - 2)}>
                <a className="page-link btn btn-link">{page - 2}</a>
            </div>
            )}
            {data && page != 1 && page - 1 > 0 && (
            <div className='page-item'
                onClick={() => changePage(page - 1)}>
                <a className="page-link btn btn-link">{page - 1}</a>
            </div>
            )}
            {page != null && data && (
            <div className='page-item'>
                <a className="page-link btn btn-link active">{page}</a>
            </div>
            )}
            {data && page + 1 <= data.pagination.totalPages && (
            <div className='page-item'
                onClick={() => changePage(page + 1)}>
                <a className="page-link btn btn-link">{page + 1}</a>
            </div>
            )}
            {data && page === 1 && page + 2 <= data.pagination.totalPages && (
            <div className='page-item'
                onClick={() => changePage(page + 2)}>
                <a className="page-link btn btn-link">{page + 2}</a>
            </div>
            )}
            {data && (
            <div className={`page-item ${page >= data.pagination.totalPages ? "disabled" : ""}`}
                onClick={() => {
                    if(page < data.pagination.totalPages) {
                        changePage(page + 1);
                    }
                }}>
                <a className="page-link btn btn-link">Next</a>
            </div>
            )}
        </div>
    );
}


export default Pagination