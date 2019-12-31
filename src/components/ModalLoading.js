import React  from 'react'
import { Modal, Dimmer, Loader } from 'semantic-ui-react';

const ModalLoading= props => (
    <Modal open={props.open}>
            <Dimmer active>
                <Loader>Loading</Loader>
            </Dimmer>
    </Modal>
)

export default ModalLoading