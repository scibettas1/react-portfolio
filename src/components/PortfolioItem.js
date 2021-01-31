import React from "react";
import "../styles/style.css"

function PortfolioItem(props) {
    
    return (
        <div>
            <img src={props.image} data-toggle="modal" data-target={"#" + props.target} alt={props.alt} className="rounded thumb" />
            <div className="modal fade" id={props.target} tabindex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <img src={props.image} className="img-fluid" alt={props.alt} />
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            {props.description}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PortfolioItem;