import React from 'react';
import { Button, Grid } from 'semantic-ui-react';
import HistoryDetails from '../components/HistoryDetails';
import{ Redirect } from 'react-router-dom'
import { getTransactionData, getComments } from '../ar';
import { Link } from 'react-router-dom'

const ViewData = props => {
  const [data, setData] = React.useState(false)
  const [comments, setComments] = React.useState([])

  const getData = async() => {
    const data = await getTransactionData(props.match.params.txid)
    const comments = await getComments(props.match.params.txid)
    console.log(comments)
    setData(data)
    setComments(comments)
  }

  React.useEffect(() => {
    getData()
   },[])


  if(!props.match.params.txid){
    return(
        <Redirect to={"/"}/>
    )
  }

  if(!data){
    return(
      <Grid centered style={{}}>
        <p>Loading...</p>
      </Grid>
    )
  }
    return(
      <Grid centered style={{ marginBottom: 10}}>
        <Grid.Row>
        <Link to={'/'}>
          <Button>Home</Button>
        </Link>
        </Grid.Row>
        <HistoryDetails history={data} comments={comments} />
      </Grid>
    )
}


export default ViewData;
