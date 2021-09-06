import { ApolloClient, InMemoryCache, useMutation, useSubscription, gql} from '@apollo/client';
import { WebSocketLink } from "@apollo/client/link/ws";
import {Container, Chip, Grid, TextField, Button} from '@material-ui/core';

//initialize a websocketLink to handle our subscriptions
const link = new WebSocketLink({
    uri: `ws://localhost:4000/`,
    options: {
        reconnect: true,
    },
})