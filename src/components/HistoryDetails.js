import React, { useState, useEffect } from 'react'
import { Grid, Form, Segment, TextArea, Button, Modal, Input, Checkbox, Feed, Message, Divider } from 'semantic-ui-react';
import { getArweaveUser, generateNewComment, arweaveNode, sendArweaveTransaction } from '../ar';
import ModalLoading from './ModalLoading';
import Blockies from 'react-blockies';

const HistoryDetails = props => {
    const { image, date, location, geoLocal, history, transactionId, specie  } = props.history
    const [ newComment, setNewComment] = useState('')
    const [newCommentModal, openNewCommentModal] = useState(false)
    const [wallet, setArAccount] = useState(false)
    const [transaction, setNewTransaction] = useState(false)
    const [loading, setLoading] = useState(false)
    const [newCommentTxId, setNewCommentTxId] = useState(false)
    const [checkboxConfirm, setConfirmCheckBox] = useState(false)

    const loadAccount = async(walletFile) => {
        try{
            setLoading(true)
            const { wallet, address, winstonBalance, arweaveBalance, history } = await getArweaveUser(walletFile)
            const transaction = await generateNewComment(newComment, transactionId, wallet)
            setNewTransaction(transaction)
            setArAccount({ wallet, address, winstonBalance, arweaveBalance, history })
            setLoading(false)
        }catch(err){
            setLoading(false)
            alert('Failed on load Arweave Account, check your wallet file and your connection')
        }
    }

    const closeModal = async() => {
        setNewTransaction(false)
        openNewCommentModal(false)
        setArAccount(false)
        setNewCommentTxId(false)
    }

    const deployNewComment = async() => {
        try{
            if(!checkboxConfirm){
                alert('View the checkbox')
                return
            }
            setLoading(true)
            const transactionId = await sendArweaveTransaction(transaction)
            setNewCommentTxId(transactionId)
            setNewTransaction(false)
            openNewCommentModal(false)
            setArAccount(false)
            setLoading(false)
        }catch(err){
            setLoading(false)
            alert('Failed on deploy new comment')
            closeModal()
        }
    }


    
    return(
        <Grid centered style={{padding:10, marginTop: 5, backgroundColor:'#8bc17b', maxWidth: 500}}>
            <ModalLoading open={loading} />
            <ModalConfirmTransaction 
                open={newCommentModal}
                wallet={wallet}
                specie={specie}
                comment={newComment}
                transaction={transaction}
                closeModal={closeModal}
                load={loadAccount}
                deployNewComment={deployNewComment}
                setConfirmCheckBox={setConfirmCheckBox}
                checkboxConfirm={checkboxConfirm}
            />
            <ConfirmationModalTx txId={newCommentTxId} closeModal={closeModal} />
            <Form>
                 <Form.Field>
                    <label>Specie</label>
                    <p style={{fontSize: 20, margin: 0}}>{specie}</p>
                        <a href={`https://viewblock.io/arweave/tx/${transactionId}`} target="_blank" rel="noopener noreferrer">
                    <p style={{fontSize: 10}}>View on Blockchain</p>
                    </a>
                </Form.Field>
                <Form.Field>
                    <label>Image</label>
                    <img src={image} alt="Person" style={{width: 250, heigth: 250 }} />
                </Form.Field>
                <Form.Field>
                    <label>Location</label>
                    <p>{location}</p>
                </Form.Field>
                <Form.Field>
                    <label>History</label>
                    <p>{history}</p>
                </Form.Field>
            </Form>
            {(props.comments.length>0) && <p style={{fontSize:20, marginBottom:0, marginTop:20, fontStyle:'italic'}}>Comments({props.comments.length})</p>}
            <Feed>
                {props.comments.map(({sender, comment, transactionIdComment}) => (
                    <>
                    <Feed.Event>
                    <Feed.Label>
                    <a href={`https://viewblock.io/arweave/tx/${transactionIdComment}`} target="_blank" rel="noopener noreferrer">
                        <Blockies seed={sender} size={8} />
                    </a>
                    </Feed.Label>
                    <Feed.Content>
                        {comment}
                    </Feed.Content>
                    </Feed.Event>
                    <Divider />
                    </>
                ))}
            </Feed>
            <Segment style={{backgroundColor:'#79aa5d'}}>
                <Grid centered style={{backgroundColor:'#79aa5d'}}>
                <Grid.Row>
                <TextArea onChange={(e) => setNewComment(e.target.value)}  placeholder='Tell us more' />
                </Grid.Row>
                <Button onClick={() => openNewCommentModal(true)} content='Primary'>Post New Comment</Button>
                </Grid>
            </Segment>
        </Grid>
    )
}

const ConfirmationModalTx = props => (
    <Modal open={props.txId}>
    <Modal.Content style={{backgroundColor: '#8bc17b'}}>
            <Grid style={{ margin: 10}} centered>
                <Message>
                    <Message.Header>
                        Your transaction has been submitted to Arweave Blockchain
                    </Message.Header>
                    <p>After mining your data will be available on the network.</p>
                    <p>Transaction Id:</p>
                    <p>{props.txId}</p>
                    <Button color='red' onClick={props.closeModal}>Close Modal</Button>
                </Message>
            </Grid>
        </Modal.Content>
    </Modal>
 )


const ModalConfirmTransaction = props => (
    <Modal open={props.open}>
      <Modal.Header style={{backgroundColor: '#3e713a', color:'#c5ddc0'}}>Confirm New Comment</Modal.Header>
      <Modal.Content style={{backgroundColor: '#8bc17b'}}>
        <Grid centered>
        {props.wallet ?

            <Form style={{margin:30}}>
            <Form.Field>
                <label>Specie</label>
                <input value={props.specie} />
            </Form.Field>
           
            <Form.Field>
                <label style={{marginTop:10}}>Comment</label>
                <TextArea rows={3} value={props.comment} />
            </Form.Field>

                <Form.Field>
                <label style={{marginTop:10}}>Transaction Fee</label>
                <p>{arweaveNode.ar.winstonToAr(props.transaction.reward)} AR</p>
                </Form.Field>
                <Form.Field>
                {(parseInt(props.transaction.reward,10) < parseInt(props.wallet.winstonBalance,10)) ?
                <Segment>
                    <Checkbox checked={props.confirmCheckBox} onChange={props.setConfirmCheckBox} label={{ children: 'I acknowledge all responsibility for the content sent and I am aware that the data cannot be deleted by anyone' }} />
                    <Button onClick={props.deployNewComment} content='Primary'>Confirm Transaction</Button>
                </Segment>
                    :
                    <p>No Arweave Balance Available</p>
                }
                </Form.Field>           
           
            <Form.Field>
                <Button color='red' onClick={props.closeModal}>Cancel</Button>
            </Form.Field>            
            </Form>
            :
            <Segment>
            <p>
                For upload a new comment you need to connect with your Arweave account by loading the wallet file.
            </p>
            <Input type="file" accept="application/JSON"  onChange={(e) => props.load(e.target.files[0])}/>
        </Segment>
        }
        </Grid>
        </Modal.Content>
        </Modal>
)

export default HistoryDetails