-- =====================================================
-- Supabase Schema - Arabic Tutor PWA
-- הרץ את זה ב-SQL Editor של Supabase
-- =====================================================

-- מעקב התקדמות מילים
CREATE TABLE IF NOT EXISTS word_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL DEFAULT 'default',
  word_id text NOT NULL,
  mastery_level integer DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
  times_seen integer DEFAULT 0,
  times_correct integer DEFAULT 0,
  last_reviewed timestamptz DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- הגדרות משתמש
CREATE TABLE IF NOT EXISTS user_settings (
  user_id text PRIMARY KEY DEFAULT 'default',
  notification_time text DEFAULT '20:00',
  api_provider text DEFAULT 'anthropic',
  user_level text DEFAULT 'beginner',
  daily_goal integer DEFAULT 10,
  updated_at timestamptz DEFAULT NOW()
);

-- הרשמות לפוש
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL DEFAULT 'default',
  subscription jsonb NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Row Level Security (RLS) - לאפשר גישה פתוחה לבינתיים (משתמש יחיד)
ALTER TABLE word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow all" ON word_progress;
DROP POLICY IF EXISTS "allow all" ON user_settings;
DROP POLICY IF EXISTS "allow all" ON push_subscriptions;

CREATE POLICY "allow all" ON word_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON user_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON push_subscriptions FOR ALL USING (true) WITH CHECK (true);

-- Insert default settings row
INSERT INTO user_settings (user_id) VALUES ('default') ON CONFLICT DO NOTHING;
