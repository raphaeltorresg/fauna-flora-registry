import React  from 'react'
import { Modal } from 'semantic-ui-react'
import HistoryDetails from "./HistoryDetails"

const ModalViewHistory = props => {
    return(
        <Modal open={props.open} onClose={props.closeViewDetails}>
            <Modal.Header style={{backgroundColor: '#dfdfea'}}>History Details</Modal.Header>
            <Modal.Content style={{backgroundColor:'#7289a7'}}>
                <HistoryDetails history={props.history}/>
            </Modal.Content>
        </Modal>
    )
}

export default ModalViewHistory