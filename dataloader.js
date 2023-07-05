import DataLoader from 'dataloader';
import DbClient from './db/pg-connection.js';

const commentsBatchFunction = async (postsIds) => {
    const sql = `SELECT * FROM "Comment" WHERE "post_id" IN (${postsIds})`;
    // console.log(sql);
    const { rows: comments } = await DbClient.query(sql);
    const groupedComments = comments.reduce((tot, cur) => {
      if (!tot[cur.post_id]) {
        tot[cur.post_id] = [cur];
      } else {
        tot[cur.post_id].push(cur);
      }
      return tot;
    }, {});
    return postsIds.map((postId) => groupedComments[postId]);
  },
  createCommentsLoader = () => new DataLoader(commentsBatchFunction, { cache: false }),
  createDataloaders = () => ({
    commentsLoader: createCommentsLoader()
  });

export default createDataloaders;
