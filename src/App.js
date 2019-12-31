import React from 'react';
import './App.css';
import 'semantic-ui-css/semantic.min.css'
import { HashRouter, Route } from 'react-router-dom'
import Home from './pages/Home';
import ViewData from './pages/ViewData';
import { Container, Grid } from 'semantic-ui-react';
import CreateNewFauna from './pages/CreateNewFauna';
import CreateNewFlora from './pages/CreateNewFlora';

const App = () => {
    return(
      <>
      <Grid centered style={{padding:15, backgroundColor:'#031d0c', marginBottom:10}}>
        <p align="center" style={{fontSize: 23, fontWeight: 700, marginTop:15, color:'#e7f3e8'}}>Fauna and Flora Catalog</p>
      </Grid>
      <Container style={{backgroundColor: '#6ab04c', margin: 10, marginTop:35, borderRadius: 30}}>
      <HashRouter basename="/">
        <Route exact path="/" component={Home} />
        <Route exact path="/viewdata" component={ViewData} />
        <Route exact path="/newfauna" component={CreateNewFauna} />
        <Route exact path="/newflora" component={CreateNewFlora} />
        <Route exact path="/view/:txid" component={ViewData} /> 
      </HashRouter>
      </Container>
      </>
    )
}


export default App;
