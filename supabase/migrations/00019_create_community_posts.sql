-- Community forum posts
CREATE TABLE IF NOT EXISTS community_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  topic       TEXT NOT NULL DEFAULT 'Grammar Help',
  title       TEXT NOT NULL,
  body        TEXT NOT NULL DEFAULT '',
  upvotes     INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Community post comments
CREATE TABLE IF NOT EXISTS community_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  body        TEXT NOT NULL,
  upvotes     INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE community_posts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read
CREATE POLICY "community_posts_select"  ON community_posts  FOR SELECT TO authenticated USING (true);
CREATE POLICY "community_comments_select" ON community_comments FOR SELECT TO authenticated USING (true);

-- Users can insert their own posts/comments
CREATE POLICY "community_posts_insert"  ON community_posts  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_comments_insert" ON community_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts/comments
CREATE POLICY "community_posts_delete"  ON community_posts  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "community_comments_delete" ON community_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX idx_community_comments_post ON community_comments(post_id);
