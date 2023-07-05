CREATE TABLE "Post" (
    post_id SERIAL,
    PRIMARY KEY (post_id)
);

CREATE TABLE "Comment" (
    comment_id SERIAL,
    post_id INTEGER NOT NULL,
    PRIMARY KEY (comment_id),
    FOREIGN KEY (post_id) REFERENCES "Post"(post_id) ON DELETE CASCADE
);
