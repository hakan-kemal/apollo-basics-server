// To build our graph API, we need to import the ApolloServer class from apollo-server
const { ApolloServer } = require('apollo-server');
const isEmail = require('isemail');
// We also need to import our schema from src/schema.js.
const typeDefs = require('./schema');
// Second, we import our createStore function to set up our database, as well as our data sources:
const { createStore } = require('./utils');
// First, let's connect our resolver map to Apollo Server. Right now, it's just an empty object,
// but we should add it to our ApolloServer instance so we don't have to do it later.
const resolvers = require('./resolvers');
// Third, import the LaunchAPI and UserAPI datasource classes/functions
const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');
// Then, we create our database by calling createStore
const store = createStore();
// Next, let's create a new instance of ApolloServer and pass our schema to the typeDefs property on the configuration object.
const server = new ApolloServer({
  context: async ({ request }) => {
    // simple auth check on every request
    const auth = (request.headers && request.headers.authorization) || '';
    const email = Buffer.from(auth, 'base64').toString('ascii');
    if (!isEmail.validate(email)) return { user: null };
    // find a user by their email
    const users = await store.users.findOrCreate({ where: { email } });
    const user = (users && users[0]) || null;

    return { user: { ...user.dataValues } };
  },
  typeDefs,
  resolvers,
  // Finally, we add the dataSources function to our ApolloServer to connect LaunchAPI and UserAPI to our graph.
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store })
  })
  // We also pass in our database we created to the UserAPI data source.
});
// If you use this.context in your datasource, it's critical to create a new instance in the dataSources function
// and to not share a single instance. Otherwise, initialize may be called during the execution of asynchronous code
// for a specific user, and replace the this.context by the context of another user.

// Now that we have scoped out our app's schema, let's run the server by calling server.listen()
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
