import React, { useState }  from 'react'
import { Grid, Form, TextArea, Button, Modal, Input, Message, Segment, Dimmer, Loader, Checkbox, Table } from 'semantic-ui-react';
import DatePicker from "react-datepicker"; 
import "react-datepicker/dist/react-datepicker.css";
import { getArweaveUser, generateNewTransaction, arweaveNode, sendArweaveTransaction, readImage, getUserHistory } from '../ar';
import QRCode from 'qrcode'
import ModalViewHistory from '../components/ModalViewHistory';
import ModalLoading from '../components/ModalLoading';
import { Link } from 'react-router-dom'
import ModalListHistory from '../components/ModalListHistory';
import ModalLoadAccount from '../components/ModalLoadAccount';


const CreateNewFlora = props => {
        const [dateRegistry, setDateRegistry] = useState(new Date());
        const [specie, setSpecie] = useState('')
        const [local, setLocal] = useState('')
        const [image, setImage] = useState(false)
        const [specieHistory, setSpecieHistory] = useState('')
        const [arweaveAccount, setArAccount] = useState({ wallet: false, address:'', winstonBalance: 0, arweaveBalance: 0, history: [] })
        const [loadAccModal, setAccModal] = useState(true)
        const [confirmHstModal, setConfirmHstModal] = useState(false)
        const [loading, setLoading] = useState(false)
        const [transaction, setTransaction] = useState(false)
        const [confirmTransaction, setConfirmTransaction] = useState(false)
        const [checkboxConfirm, setConfirmCheckBox] = useState(false)
        const [modalHistory, setModalHistory] = useState(false)
        const [userHistory, setUserHistory] = useState([]) 

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
            if(!specie || !image || !dateRegistry || !specieHistory){
                alert('Check the form, you miss something')
                return
            }
            try{
                setLoading(true)
                const transaction = await generateNewTransaction('flora', specie, image, local, specieHistory, arweaveAccount.wallet)
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

        const viewDetails = async() => {
            try{
                setLoading(true)
                const history = await getUserHistory(arweaveAccount.address)
                setUserHistory(history)
                setModalHistory(true)
                setLoading(false)
            }catch(err){
                console.log(err)
                setLoading(false)
                setModalHistory(false)
            }
        }

        const closeViewDetails = () => {
            setUserHistory([])
            setModalHistory(false)
        }

        if(confirmTransaction){
            return(
                <Grid style={{ margin: 10}} centered>
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
                <Link to={'/'}>
                  <Button>Home</Button>
                </Link>
                <ModalLoadAccount open={loadAccModal} load={loadAccount} />
                <ModalConfirmTransaction 
                    open={confirmHstModal} 
                    specie={specie}
                    dateRegistry={dateRegistry}
                    specieHistory={specieHistory}
                    closeModal={() => setConfirmHstModal(false)}
                    transaction={transaction} userBalance={arweaveAccount.winstonBalance}
                    sendNewHistory={sendNewHistory} checkboxConfirm={checkboxConfirm}
                    setConfirmCheckBox={setConfirmCheckBox} image={image}
                />
                <ModalListHistory 
                    open={modalHistory} history={userHistory} closeViewDetails={closeViewDetails}
                />
                <ModalLoading open={loading} />
                <Grid.Row centered>
                    <Message>
                        <Message.Header>Arweave Account</Message.Header>
                        <p>{arweaveAccount.address}</p>
                        <p style={{fontSize:11, marginBottom:0}}>Balance</p>
                        <p style={{marginTop:0}}>{arweaveAccount.arweaveBalance} AR</p>
                        <Button onClick={() => viewDetails()}>View Upload History</Button>
                    </Message>
                </Grid.Row>
                {/* <Grid.Row centered>
                    <p align="center" style={{fontSize:16, fontWeight:700}}>-> Create New Flora Registry</p>
                </Grid.Row> */}
                <Form style={{margin:10, backgroundColor:'#8bc17b', borderRadius:10, padding: 25}}>
                    <div style={{backgroundColor:'#3e713a', borderRadius: 10, margin: 10}}>
                        <p align="center" style={{fontSize:16, fontWeight:700, padding: 10, color:'#c5ddc0'}}>Create New Flora Registry</p>
                    </div>
                    <Form.Field>
                        <label>Specie</label>
                        <input value={specie} onChange={(e) => setSpecie(e.target.value)} placeholder='Specie' />
                    </Form.Field>
                    <Form.Field>
                        <label>Location</label>
                        <input value={local} onChange={(e) => setLocal(e.target.value)} placeholder='Location' />
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
                    <label style={{marginTop:10}}>Specie History</label>
                    <TextArea rows={8} value={specieHistory} onChange={(e) => setSpecieHistory(e.target.value)} placeholder='Tell us more about the life of the person' />
                </Form.Field>

                <Form.Field>
                    <Button onClick={prepareTransaction} content='Primary'>Prepare Transaction</Button>
                </Form.Field>
                </Form>
            </Grid>
        )
}

const ModalConfirmTransaction = props => (
    <Modal open={props.open}>
      <Modal.Header style={{backgroundColor: '#3e713a', color:'#c5ddc0'}}>Confirm New Flora Registry</Modal.Header>
      <Modal.Content style={{backgroundColor: '#8bc17b'}}>
        <Grid centered>
            <Form style={{margin:30}}>
            <Form.Field>
                <label>Specie</label>
                <input value={props.specie} />
            </Form.Field>
            <Form.Field>
                <label>Image</label>
                <img src={props.image} alt="Person" style={{width: 250, heigth: 250}} />
            </Form.Field>
        
            <Form.Field>
                <label style={{marginTop:10}}>History</label>
                <TextArea rows={8} value={props.specieHistory} />
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