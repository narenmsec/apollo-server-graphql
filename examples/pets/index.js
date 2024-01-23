
const { ApolloServer, gql } = require("apollo-server");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`

  enum PetType {
    Cat,
    Dog
  }

  type Pet {
    name: String!
    petType: PetType!
  }

  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    pets: [Pet!]!
    books: [Book]
  }
`;

const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    pets: (root, args, context) => {
      return [
        { name: "Sandy", petType: 'Cat' },
        { name: "Hank", petType: 'Dog' }
      ]
    },
    books: () => books,
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
