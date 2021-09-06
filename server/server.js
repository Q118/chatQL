/** @format */


const { GraphQLServer, PubSub } = require("graphql-yoga");

//This object type will be the messages that we send and receive on this app. id is a unique identifier for each message. The user will simply be the name of the sender and text is the content of the message.
const typeDefs = `
  type Message {
    id: ID!
    user: String!
    text: String!
  }
  type Query {
    messages: [Message!]
  }
  type Mutation {
    postMessage(user: String!, text: String!): ID!
  }
  type Subscription {
    messages: [Message!]
  }
`;

//create new instance of pubsub
const pubsub = new PubSub();

const messages = []; //stores all the messages sent
const subscribers = []; //stores any new messages sent upon listening

//to push new users to the subscribers array
const onMessagesUpdates = (fn) => subscribers.push(fn);

const resolvers = {
	Query: {
		//gets all messages
		messages: () => messages,
	},
	//add this below the Query resolver
	Mutation: {
		postMessage: (parent, { user, text }) => {
			const id = messages.length;
			messages.push({ id, user, text });
			//Below line alerts our subscription to call the callback function every time a new message is pushed under Mutation.
			subscribers.forEach((fn) => fn());
			return id;
		},
	},
	//Subscriptions resolvers are not a function, but an object with subscribe method, that returns AsyncIterable.
	Subscription: {
		messages: {
			subscribe: (parent, args, { pubsub }) => {
				//create random number as the channel to publish messages to
				const channel = Math.random().toString(36).slice(2, 15);

				//push the user to the subscriber array with onMessagesUpdates function and
				//publish updated messages array to the channel as the callback
				onMessagesUpdates(() => pubsub.publish(channel, { messages }));

				//publish all messages immediately once a user subscribed
				setTimeout(() => pubsub.publish(channel, { messages }), 0);

				//returns the asyncIterator
				return pubsub.asyncIterator(channel);
			},
		},
	},
};

//initialize the server with our typeDefs (i.e. schema), resolver functions and pubsub as context.
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } });
server.start(({ port }) => {
	console.log(`Server on http://localhost:${port}/`);
});
