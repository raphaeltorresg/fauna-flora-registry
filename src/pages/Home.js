import React, { useEffect, useState } from 'react';
import { Grid, Button, Tab } from 'semantic-ui-react';
import { Link } from 'react-router-dom'
import ListSpecies from '../components/ListSpecies';
import { getFaunaSpecies, getFloraSpecies } from '../ar';



const Home = () => {
  const [fauna, setFauna] = useState([])
  const [flora, setFlora] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async() => {
    try{
      const x = await getFaunaSpecies()
      const y = await getFloraSpecies()
      console.log(y)
      setFauna(x)
      setFlora(y)
      setLoading(false)
    }catch(err){
      setLoading(false)
    }
  }

  useEffect(() => {
   fetchData()
  },[])

  const panes = [
    { menuItem: 'Fauna', render: () => <ListSpecies list={fauna} url={"/newfauna"} name={'Fauna'} />},
    { menuItem: 'Flora', render: () => <ListSpecies list={flora} url={"/newflora"} name={'Flora'} /> }
  ]

  if(loading){
    return (
      <Grid centered style={{}}>
        <p>Loading...</p>
      </Grid>
    )
  }
    return(
      <Grid centered style={{}}>
        <Tab
           menu={{
            pointing: true,
            style: {
              display: "flex",
              justifyContent: "center",
              backgroundColor:'#cdf9be'
            }
          }} 
          panes={panes} />
      </Grid>
    )
}


export default Home;
