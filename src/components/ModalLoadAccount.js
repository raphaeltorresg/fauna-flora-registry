import React from 'react'
import { Modal, Input } from 'semantic-ui-react'

const ModalLoadAccount = props => (
    <Modal open={props.open}>
      <Modal.Header style={{backgroundColor: '#3e713a', color:'#c5ddc0'}}>Load Arweave Account</Modal.Header>
      <Modal.Content style={{backgroundColor: '#8bc17b'}}>
        <Modal.Description>
          <p>
            For catalog a new specie you need to connect with your Arweave account by loading the wallet file.
          </p>
          <Input type="file" accept="application/JSON"  onChange={(e) => props.load(e.target.files[0])}/>
        </Modal.Description>
      </Modal.Content>
    </Modal>
)

export default ModalLoadAccount