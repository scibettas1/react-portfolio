import React from "react";
import "../styles/style.css"
import { Button, Modal } from "react-bootstrap"



function ModalLaunchWeb(props) {
    const [modalShow, setModalShow] = React.useState(false);
    const portfolioItem = props;
    console.log(portfolioItem);

    return (
        <>
            <img src={props.image} alt={props.alt} className="rounded thumb" onClick={() => setModalShow(true)}/>
            
            <PortfolioModal
                show={modalShow}
                onHide={() => setModalShow(false)}
            />
        </>
    );

    function PortfolioModal(props) {
        return (
            <Modal
                {...props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <img src={portfolioItem.image} className="img-fluid" alt={portfolioItem.alt} />
                </Modal.Header>
                <Modal.Body>
                    {portfolioItem.description}
                    <Button href={portfolioItem.link}  target="_blank" rel="noreferrer">Launch Application</Button>
                    <Button href= {portfolioItem.repo}  target="_blank" rel="noreferrer">Visit Repository</Button>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={props.onHide}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }

}
 export default ModalLaunchWeb
