import gql from 'graphql-tag';
import DbClient from './pg-connection.js';

const typeDefs = gql`
  type Post {
    post_id: ID!
    commentsWithDataloader: [Comment]
    commentsWithNPlusOne: [Comment]
  }

  type Comment {
    comment_id: ID!
    post_id: ID!
  }

  type Query {
    posts: [Post]
  }
`;

const resolvers = {
  Query: {
    posts: async () => {
      const sql = 'SELECT * FROM "Post"';
      // console.log(sql);
      const { rows: posts } = await DbClient.query(sql);
      return posts;
    }
  },

  Post: {
    commentsWithDataloader: (post, _, { dataLoaders }) => {
      return dataLoaders.commentsLoader.load(post.post_id);
    },
    commentsWithNPlusOne: async (post) => {
      const sql = `SELECT * FROM "Comment" WHERE "post_id" = ${post.post_id}`;
      // console.log(sql);
      const { rows: postComments } = await DbClient.query(sql);
      return postComments;
    }
  }
};

export { typeDefs, resolvers };
