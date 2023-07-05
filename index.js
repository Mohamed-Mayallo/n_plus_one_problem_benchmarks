import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import createDataloaders from './dataloader.js';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { typeDefs, resolvers } from './schema.js';
import {
  postsWithBatchLoading,
  postsWithEagerLoading,
  postsWithNPlusOne,
  postsWithCache
} from './rest.js';

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

await server.start();

app.use(cors(), bodyParser.json({ limit: '50mb' }));

app.get('/api/postsWithNPlusOne', async (_, res) => {
  const startTime = Date.now();

  await postsWithNPlusOne();

  const endTime = Date.now();

  const elapsedTimeInSec = ((endTime - startTime) / 1000).toString();

  res.json({ elapsedTimeInSec });
});

app.get('/api/postsWithEagerLoading', async (_, res) => {
  const startTime = Date.now();

  await postsWithEagerLoading();

  const endTime = Date.now();

  const elapsedTimeInSec = ((endTime - startTime) / 1000).toString();

  res.json({ elapsedTimeInSec });
});

app.get('/api/postsWithBatchLoading', async (_, res) => {
  const startTime = Date.now();

  await postsWithBatchLoading();

  const endTime = Date.now();

  const elapsedTimeInSec = ((endTime - startTime) / 1000).toString();

  res.json({ elapsedTimeInSec });
});

app.get('/api/postsWithCache', async (_, res) => {
  const startTime = Date.now();

  await postsWithCache();

  const endTime = Date.now();

  const elapsedTimeInSec = ((endTime - startTime) / 1000).toString();

  res.json({ elapsedTimeInSec });
});

app.use(
  '/graphql',
  expressMiddleware(server, {
    context: () => {
      return {
        dataLoaders: createDataloaders()
      };
    }
  })
);

await new Promise((resolve) => httpServer.listen({ port: 3000 }, resolve));

console.log(`🚀 GraphQL Server ready at http://localhost:3000/graphql`);
