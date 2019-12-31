import React from 'react';
import { List, Button, Grid } from 'semantic-ui-react';
import { Link } from 'react-router-dom'

const ListSpecies = props => {
    if(props.list.length === 0){
        return (
            <Grid centered style={{padding:10, margin: 10}}>
                <Grid.Row>
                    <Link to={props.url}>
                        <Button>Catalog New {props.name} Specie</Button>
                    </Link>
                </Grid.Row>
                <Grid.Row>
                    <p style={{margin:10}}>Not found any specie</p>
                </Grid.Row>
            </Grid>
        )
    }
    return(
        <Grid centered style={{padding:10, margin: 10}}>
            <Grid.Row>
            <Link to={props.url}>
                <Button onClick={props.newCatalog}>Catalog New {props.name}</Button>
            </Link>
            </Grid.Row>
            <List bulleted>
                {props.list.map(({specie, transactionId}) => (
                   <Link to={`/view/${transactionId}`}>
                    <List.Item style={{color:'black', margin: 5}}>-- {specie}</List.Item>
                   </Link>
                ))}
            </List>
        </Grid>
    )
}

export default ListSpecies