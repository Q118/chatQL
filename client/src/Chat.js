import { ApolloClient, InMemoryCache, useMutation, useSubscription, gql } from '@apollo/client';
import { WebSocketLink } from "@apollo/client/link/ws";
import { Container, Chip, Grid, TextField, Button } from '@material-ui/core';
import React, {useState} from 'react';

//initialize a websocketLink to handle our subscriptions
const link = new WebSocketLink({
    uri: `ws://localhost:4000/`,
    options: {
        reconnect: true,
    },
})

export const client = new ApolloClient({
    link, //websocket link
    uri: 'http://localhost:4000/', //connect to server
    cache: new InMemoryCache(),
});

export const Chat = () =>{
    const [user, setUser] = useState("Shelby"); //initialize user
    const [text, setText] = useState(""); //initialize text

    //Pass our POST_MESSAGE query in the useMutation hook which returns an array, where the first element is our mutate function, postMessage.
    const [postMessage] = useMutation(POST_MESSAGE)
    
    const sendMessage=() => {
        //sendMessage first checks if both inputs are not empty.
        if(text.length>0 && user.length >0){
          // It executes the postMessage mutate function by passing the variables from the input (user and text) and resets the text field.
          postMessage({
            variables:{ user: user, text: text }
          })
          setText(""); //reset text field
        }else{
          // If one of the input fields is blank, an alert window will trigger.
          alert("Missing fields!")
        }
      }

    return(
        <Container>
          <h3>Welcome to chatQL!</h3>
          <Messages/>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <TextField onChange={ (e) => {
                setUser(e.target.value)}} value={user} size="small" fullWidth variant="outlined" required label="Required" label="Enter name" />
            </Grid>
            <Grid item xs={8}>
              <TextField onChange={(e)=>{
                setText(e.target.value)}} value={text} size="small" fullWidth variant="outlined" required label="Required" label="Enter message here" />
            </Grid>
            <Grid item xs={1}>
              <Button onClick={sendMessage} fullWidth  variant="contained" style={{backgroundColor:"#60a820", color:"white"}}>Send</Button>
            </Grid>
          </Grid>
        </Container>
    )
}

const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      user
      text
    }
  }
`;

const POST_MESSAGE = gql`
  mutation($user:String!, $text:String!){
    postMessage(user:$user, text:$text)
  }
`;


const Messages = () => {
    const { data } = useSubscription(GET_MESSAGES);
    if (!data) {
        return null;
    }
    return (
        <div style={{ marginBottom: '5rem' }}>
            {data.messages.map(({ id, user, text }) => {
                return (
                    <div key={id} style={{ textAlign: 'right' }}>
                        <p style={{ marginBottom: '0.3rem' }}>{user}</p>
                        <Chip style={{ fontSize: '0.9rem' }} color='primary' label={text} />
                    </div>
                );
            })}
        </div>
    );
};
