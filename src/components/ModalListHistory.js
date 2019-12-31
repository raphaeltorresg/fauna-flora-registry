import React from 'react'
import { Modal, Grid, Table } from "semantic-ui-react"
import { Link } from 'react-router-dom'

const ModalListHistory = props => {
    return(
        <Modal open={props.open} onClose={() => props.closeViewDetails()}>
            <Modal.Header style={{backgroundColor: '#dfdfea'}}>User History List</Modal.Header>
                <Modal.Content>
                    <Grid centered>
                    <Table celled padded>
                        <Table.Body>
                        {props.history.map((x, index) => (
                            <Table.Row>
                                <Link to={`/view/${x.transactionId}`}>
                                <Table.Cell>{x.specie}</Table.Cell>
                                </Link>
                            </Table.Row>
                        ))}
                        </Table.Body>
                    </Table>
                    </Grid>
                </Modal.Content>
        </Modal>
    )
}

export default ModalListHistory