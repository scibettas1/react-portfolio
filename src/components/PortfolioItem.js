import React from "react";
import "../styles/style.css"
import { Button, Modal } from "react-bootstrap"

function PortfolioItem(props) {

    return (
        <div>
            <img src={props.image} data-toggle="modal" data-target={"#" + props.target} alt={props.alt} className="rounded thumb" />
        </div>

    );
}


function PortfolioModal(props) {
    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <img src={props.image} className="img-fluid" alt={props.alt} />
            </Modal.Header>
            <Modal.Body>
                {props.description}
                <Button src={props.link} />
                <Button src= {props.repo} />
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

function ModalLaunch(props) {
    const [modalShow, setModalShow] = React.useState(false);

    return (
        <>

            <img src={props.image} alt={props.alt} className="rounded thumb" onClick={() => setModalShow(true)}/>


            <PortfolioModal
                show={modalShow}
                onHide={() => setModalShow(false)}
            />
        </>
    );
}
 export default ModalLaunch






















// trying to figure out how to get this modal to work 

// <div className="modal fade" id={props.target} tabindex="-1" aria-hidden="true">
//                 <div className="modal-dialog">
//                     <div className="modal-content">
//                         <div className="modal-header">
//                             <img src={props.image} className="img-fluid" alt={props.alt} />
//                             <button type="button" className="close" data-dismiss="modal" aria-label="Close">
//                                 <span aria-hidden="true">&times;</span>
//                             </button>
//                         </div>
//                         <div className="modal-body">
//                             {props.description}
//                         </div>
//                         <div className="modal-footer">
//                             <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
//                         </div>
//                     </div>
//                 </div>
//             </div>