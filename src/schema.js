// import gql from Apollo Server and create a variable called typeDefs for your schema.
const { gql } = require('apollo-server');
// Your schema will go inside the gql function
const typeDefs = gql`
  # We'll start with the Query type, which is the entry point into our schema that describes what data we can fetch.
  type Query {
    # launches: [Launch]!
    launches( # replace the current launches query with this one.
      """
      The number of results to show. Must be >= 1. Default = 20
      """
      pageSize: Int
      """
      If you add a cursor here, it will only return results _after_ this cursor
      """
      after: String
    ): LaunchConnection!
    launch(id: ID!): Launch
    # Queries for the current user
    me: User
  }

  """
  Simple wrapper around our list of launches that contains a cursor to the
  last item in the list. Pass this cursor to the launches query to fetch results
  after these.
  """
  type LaunchConnection { # add this below the Query type as an additional type.
    cursor: String!
    hasMore: Boolean!
    launches: [Launch]!
  }

  # First, we define a launches query to fetch all upcoming rocket launches.
  # This query returns an array of launches, which will never be null.
  # Since all types in GraphQL are nullable by default, we need to add the !
  # to indicate that our query will always return data. Next, we define a query
  # to fetch a launch by its ID. This query takes an argument of id and returns a single launch.
  # Finally, we will add a me query to fetch the current user's data.
  # Above the me query is an example of a comment added to the schema.

  # How do we define what properties are exposed by Launch and User?
  # For these types, we need to define a GraphQL object type.

  type Launch {
    id: ID!
    site: String
    mission: Mission
    rocket: Rocket
    isBooked: Boolean!
  }

  # The Launch type has fields that correspond to object and scalar types.
  # A scalar type is a primitive type like ID, String, Boolean, or Int.
  # You can think of scalars as the leaves of your graph that all fields resolve to.
  # GraphQL has many scalars built in, and you can also define custom scalars like Date.

  # The Mission and Rocket types represent other object types.
  # Let's define the fields on Mission, Rocket, and User:

  type Rocket {
    id: ID!
    name: String
    type: String
  }

  type User {
    id: ID!
    username: String!
    trips: [Launch]!
  }

  type Mission {
    name: String
    missionPatch(size: PatchSize): String
  }

  enum PatchSize {
    SMALL
    LARGE
  }

  # You'll notice that the field missionPatch takes an argument of size.
  # GraphQL is flexible because any fields can contain arguments, not just queries.
  # The size argument corresponds to an enum type, which we're defining at the bottom with PatchSize.

  # Now, let's define the Mutation type. The Mutation type is the entry point into our graph for modifying data.
  # Just like the Query type, the Mutation type is a special object type.

  type Mutation {
    # if false, booking trips failed -- check errors
    bookTrips(launchIds: [ID]!): TripUpdateResponse!

    # if false, cancellation failed -- check errors
    cancelTrip(launchId: ID!): TripUpdateResponse!

    login(email: String): String # login token
  }

  # Both the bookTrips and cancelTrip mutations take an argument and return a TripUpdateResponse.
  # The return type for your GraphQL mutation is completely up to you, but we recommend defining
  # a special response type to ensure a proper response is returned back to the client. In a larger project,
  # you might abstract this type into an interface, but for now, we're going to define TripUpdateResponse:

  type TripUpdateResponse {
    success: Boolean!
    message: String
    launches: [Launch]
  }

  # Our mutation response type contains a success status, a corresponding message, and the launch that we updated.
  # It's always good practice to return the data that you're updating in order for the Apollo Client cache to update automatically.
`;

module.exports = typeDefs;
