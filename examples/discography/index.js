
const { ApolloServer, gql } = require("apollo-server");
const db = require('./db');
let AWS = require('aws-sdk');
let docClient = new AWS.DynamoDB.DocumentClient();
// AWS.config.update({region:'ap-south-1'});
AWS.config.loadFromPath('./config.json');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`

  enum Genre {
    Pop,
    Rock,
    Alternative
    HipHop,
    Folk
  }

  type Track {
    title: String!
    number: Int!
  }

  type Artist {
    name: String!
  }

  type Album {
    title: String!
    artist: Artist!
    tracks: [Track!]!
    genre: Genre!
  }

  type Grocery {
    date: String!
    category: String
    name: String
  }

  type Query {
    albums(genre: Genre): [Album!]!
    album(title: String!): Album
    fetch(genre: Genre): [Grocery]
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    albums: (root, args, context) => {
      const isFilteringByGenre = args && args.genre;

      if (isFilteringByGenre) {
        return context.db.getAlbumsByGenre(args.genre)
      }

      return context.db.getAllAlbums();
    },
    album: (root, args, context) => {
      const albumTitle = args && args.title;

      try {
        return context.db.getAlbumByTitle(albumTitle);
      } catch (err) {
        return null;
      }
    },
    fetch: (root, args, context) => {
      let params = {
        TableName: 'serverLessApp'
      };
      return dbRead(params);
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ db })
});

async function dbRead(params) {
  let promise = docClient.scan(params).promise();
  let result = await promise;
  let data = result.Items;
  if (result.LastEvaluatedKey) {
      params.ExclusiveStartKey = result.LastEvaluatedKey;
      data = data.concat(await dbRead(params));
  }
  return data;
}

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
