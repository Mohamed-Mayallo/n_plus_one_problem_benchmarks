import DbClient from './pg-connection.js';
import CacheClient from './redis-connection.js';

const postsWithNPlusOne = async () => {
  const { rows: posts } = await DbClient.query('SELECT * FROM "Post"');

  for (const post of posts) {
    const postComments = await DbClient.query(
      `SELECT * FROM "Comment" WHERE "post_id" = ${post.post_id}`
    );

    post.comments = postComments;
  }

  return posts;
};

const postsWithEagerLoading = async () => {
  const { rows: posts } = await DbClient.query(`
    SELECT * 
    FROM "Post"
    JOIN "Comment"
    ON "Comment"."post_id" = "Post"."post_id"
  `);

  const groupedPosts = posts.reduce((tot, cur) => {
    let lastIndex = tot.length - 1;

    if (!tot[lastIndex] || tot[lastIndex].post_id != cur.post_id) {
      tot[lastIndex + 1] = { post_id: cur.post_id, comments: [{ comment_id: cur.comment_id }] };
    } else {
      tot[lastIndex].comments.push({ comment_id: cur.comment_id });
    }

    return tot;
  }, []);

  return groupedPosts;
};

const postsWithBatchLoading = async () => {
  const { rows: posts } = await DbClient.query('SELECT * FROM "Post"'),
    postsIds = posts.map((post) => post.post_id),
    { rows: comments } = await DbClient.query(
      `SELECT * FROM "Comment" WHERE "post_id" IN (${postsIds})`
    );

  const groupedComments = comments.reduce((tot, cur) => {
    if (!tot[cur.post_id]) {
      tot[cur.post_id] = [cur];
    } else {
      tot[cur.post_id].push(cur);
    }

    return tot;
  }, {});

  posts.map((post) => {
    post.comments = groupedComments[post.post_id];
  });

  return posts;
};

const postsWithCache = async () => {
  const { rows: posts } = await DbClient.query('SELECT * FROM "Post"'),
    postsIds = posts.map((post) => post.post_id);

  let comments = await CacheClient.get('posts_comments');

  if (comments) {
    comments = JSON.parse(comments);
    console.log('CACHE HIT *****');
  }

  if (!comments) {
    console.log('CACHE MISS -----');
    comments = (await DbClient.query(`SELECT * FROM "Comment" WHERE "post_id" IN (${postsIds})`))
      .rows;

    CacheClient.set('posts_comments', JSON.stringify(comments));
  }

  const groupedComments = comments.reduce((tot, cur) => {
    if (!tot[cur.post_id]) {
      tot[cur.post_id] = [cur];
    } else {
      tot[cur.post_id].push(cur);
    }

    return tot;
  }, {});

  posts.map((post) => {
    post.comments = groupedComments[post.post_id];
  });

  return posts;
};

export { postsWithNPlusOne, postsWithEagerLoading, postsWithBatchLoading, postsWithCache };
