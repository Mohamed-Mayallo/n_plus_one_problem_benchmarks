import DbClient from './pg-connection.js';

async function seed() {
  console.log('Wait ...');

  // Truncate all tables
  await DbClient.query(`
    TRUNCATE TABLE "Comment", "Post" CASCADE;
  `);

  // Seed posts
  await DbClient.query(`
    INSERT INTO "Post" ("post_id") 
    SELECT generate_series(1,1000)
    RETURNING *
  `);

  // Seed comments
  await DbClient.query(`
    DO $$
    DECLARE
        i INTEGER;
    BEGIN
      FOR i IN SELECT "post_id" FROM "Post" LOOP
        FOR n IN 1..50 LOOP
          INSERT INTO "Comment"("post_id") VALUES(i);
        END LOOP;
      END LOOP;
    END $$;
  `);

  console.log('Done ...');
}

try {
  seed().then(() => {
    process.exit(0);
  });
} catch (e) {
  console.log(e);
  process.exit(1);
}
