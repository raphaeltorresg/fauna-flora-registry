import React, { useState }  from 'react'
import { Grid, Form, TextArea, Button, Modal, Input, Message, Segment, Checkbox } from 'semantic-ui-react';
import "react-datepicker/dist/react-datepicker.css";
import { getArweaveUser, arweaveNode, sendArweaveTransaction, readImage, generateNewComment } from '../ar';
import ModalViewHistory from '../components/ModalViewHistory';
import ModalLoading from '../components/ModalLoading';
import { Link } from 'react-router-dom'


const CreateNewFlora = props => {
        const [comment, setComment] = useState('')
        const [image, setImage] = useState(false)
        const [arweaveAccount, setArAccount] = useState({ wallet: false, address:'', winstonBalance: 0, arweaveBalance: 0, history: [] })
        const [loadAccModal, setAccModal] = useState(true)
        const [confirmHstModal, setConfirmHstModal] = useState(false)
        const [loading, setLoading] = useState(false)
        const [transaction, setTransaction] = useState(false)
        const [confirmTransaction, setConfirmTransaction] = useState(false)
        const [checkboxConfirm, setConfirmCheckBox] = useState(false)

        const loadImage = async(imageFile) => {
            try{
                setLoading(true)
                const image = await readImage(imageFile)
                setImage(image)
                setLoading(false)
            }catch(err){
                setLoading(false)
            }
        }

        const loadAccount = async(walletFile) => {
            try{
                setLoading(true)
                setAccModal(false)
                const { wallet, address, winstonBalance, arweaveBalance, history } = await getArweaveUser(walletFile)
                setArAccount({ wallet, address, winstonBalance, arweaveBalance, history })
                setLoading(false)
            }catch(err){
                setAccModal(true)
                setLoading(false)
                alert('Failed on load Arweave Account, check your wallet file and your connection')
            }
        }

        const prepareTransaction = async() => {
            if(!comment){
                alert('Check the form, you miss something')
                return
            }
            const { transactionHash } = props
            try{
                setLoading(true)
                const transaction = await generateNewComment(comment, image, transactionHash, arweaveAccount.wallet)
                setTransaction(transaction)
                setConfirmHstModal(true)
                setLoading(false)
            }catch(err){
                setLoading(false)
                alert('Failed on prepare transaction')
                console.log(err)
            }
        }

        const sendNewHistory = async() => {
            try{
                if(!checkboxConfirm){
                    alert('View the checkbox')
                    return
                }
                setLoading(true)
                setConfirmHstModal(false)
                const transactionId = await sendArweaveTransaction(transaction)
                setConfirmTransaction(transactionId)
                setLoading(false)
                setTransaction(false)
            }catch(err){
                setLoading(false)
                setConfirmHstModal(true)
                alert('Failed to deploy the transaction')
            }
        }

        if(confirmTransaction){
            return(
                <Grid centered>
                    <Message>
                        <Message.Header>
                            Your transaction has been submitted to Arweave Blockchain
                        </Message.Header>
                        <p>After mining your data will be available on the network.</p>
                        <p>Transaction Id:</p>
                        <p>{confirmTransaction}</p>
                        <Link to="/">
                            <Button>Home</Button>
                        </Link>
                    </Message>
                </Grid>
            )
        }

        return(
            <Grid centered>
                <ModalLoadAccount open={loadAccModal} load={loadAccount} />
                <ModalConfirmTransaction 
                    open={confirmHstModal} 
                    comment={comment} 
                    closeModal={() => setConfirmHstModal(false)}
                    transaction={transaction} userBalance={arweaveAccount.winstonBalance}
                    sendNewHistory={sendNewHistory} checkboxConfirm={checkboxConfirm}
                    setConfirmCheckBox={setConfirmCheckBox} image={image}
                />

                <ModalLoading open={loading} />
                <Grid.Row centered>
                    <Message>
                        <Message.Header>Arweave Account</Message.Header>
                        <p>{arweaveAccount.address}</p>
                        <p style={{fontSize:11, marginBottom:0}}>Balance</p>
                        <p style={{marginTop:0}}>{arweaveAccount.arweaveBalance} AR</p>
                    </Message>
                </Grid.Row>
                <Grid.Row centered>
                    <p align="center" style={{fontSize:16, fontWeight:700}}>-> Create New Flora Registry</p>
                </Grid.Row>
                <Form style={{margin:10}}>

                    <Form.Field>
                        <label style={{marginTop:10}}>Comment</label>
                        <TextArea rows={8} value={comment} onChange={(e) => setComment(e.target.value)} placeholder='Tell us more about the life of the person' />
                    </Form.Field>

                    <Form.Field>
                        <label>Image</label>
                        {image ? 
                            <React.Fragment>
                                <div>
                                    <img src={image} alt="Person" style={{width: 250, heigth: 250}} />
                                </div>
                                <div>
                                    <Button circular negative onClick={() => setImage(false)}>X</Button>
                                </div>
                            </React.Fragment>
                            :
                            <Input type="file" accept="image/*" onChange={(e) => loadImage(e.target.files[0])} />
                        }
                    </Form.Field>
                <Form.Field>
                    <Button onClick={prepareTransaction} content='Primary'>Prepare Transaction</Button>
                </Form.Field>
                </Form>
            </Grid>
        )
}

const ModalLoadAccount = props => (
    <Modal open={props.open}>
      <Modal.Header style={{backgroundColor: '#dfdfea'}}>Load Arweave Account</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>
            For upload a new people history you need to connect with your Arweave account by loading the wallet file.
          </p>
          <Input type="file" accept="application/JSON"  onChange={(e) => props.load(e.target.files[0])}/>
        </Modal.Description>
      </Modal.Content>
    </Modal>
)

const ModalConfirmTransaction = props => (
    <Modal open={props.open}>
      <Modal.Header style={{backgroundColor: '#dfdfea'}}>Confirm New Comment</Modal.Header>
      <Modal.Content>
        <Grid centered>
            <Form style={{margin:30}}>
            <Form.Field>
                <label>Comment</label>
                <input value={props.specie} />
            </Form.Field>
            <Form.Field>
                <label>Image</label>
                <img src={props.image} alt="Person" style={{width: 250, heigth: 250}} />
            </Form.Field>

            <Form.Field>
                <label style={{marginTop:10}}>Transaction Fee</label>
                <p>{arweaveNode.ar.winstonToAr(props.transaction.reward)} AR</p>
            </Form.Field>

            <Form.Field>
                {(parseInt(props.transaction.reward,10) < parseInt(props.userBalance,10)) ?
                <Segment>
                    <Checkbox checked={props.confirmCheckBox} onChange={props.setConfirmCheckBox} label={{ children: 'I acknowledge all responsibility for the content sent and I am aware that the data cannot be deleted by anyone' }} />
                    <Button onClick={props.sendNewHistory} content='Primary'>Confirm Transaction</Button>
                </Segment>
                    :
                    <p>No Arweave Balance Available</p>
                }
            </Form.Field>
            <Form.Field>
                <Button color='red' onClick={props.closeModal}>Cancel</Button>
            </Form.Field>
            
            </Form>
        </Grid>
        </Modal.Content>
        </Modal>
)






  



export default CreateNewFlora