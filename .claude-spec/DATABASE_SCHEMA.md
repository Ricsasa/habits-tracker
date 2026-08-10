# Database Schema - Habit Tracker

## Read-Only Tables (Global Repository)

### 1. default_categories

Global predefined categories (read-only).

```sql
CREATE TABLE default_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO default_categories (key, name, color)
VALUES
  ('study', 'Study', '#2563eb'),
  ('exercise', 'Exercise', '#16a34a'),
  ('personals', 'Personal Improvement', '#ea580c'),
  ('spaces', 'Spaces', '#7c3aed');
```

### 2. default_tags

Global predefined tags (read-only, 1:N relationship with default_categories).

```sql
CREATE TABLE default_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  default_category_id UUID NOT NULL REFERENCES default_categories(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#e5e7eb',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(default_category_id, name)
);

CREATE INDEX idx_default_tags_category ON default_tags(default_category_id);
```

### 3. Seed Default Tags

```sql
-- Exercise tags
INSERT INTO default_tags (default_category_id, name, color)
SELECT id, 'gym', '#10b981' FROM default_categories WHERE key = 'exercise'
UNION ALL
SELECT id, 'yoga', '#10b981' FROM default_categories WHERE key = 'exercise'
UNION ALL
SELECT id, 'pilates', '#10b981' FROM default_categories WHERE key = 'exercise'
UNION ALL
SELECT id, 'running', '#10b981' FROM default_categories WHERE key = 'exercise'
UNION ALL
SELECT id, 'dog walks', '#10b981' FROM default_categories WHERE key = 'exercise'
UNION ALL
SELECT id, 'treadmill', '#10b981' FROM default_categories WHERE key = 'exercise'
UNION ALL
SELECT id, 'hike', '#10b981' FROM default_categories WHERE key = 'exercise';

-- Study tags
INSERT INTO default_tags (default_category_id, name, color)
SELECT id, 'leetcode', '#3b82f6' FROM default_categories WHERE key = 'study'
UNION ALL
SELECT id, 'aws', '#3b82f6' FROM default_categories WHERE key = 'study'
UNION ALL
SELECT id, 'nodejs', '#3b82f6' FROM default_categories WHERE key = 'study'
UNION ALL
SELECT id, 'react', '#3b82f6' FROM default_categories WHERE key = 'study'
UNION ALL
SELECT id, 'php', '#3b82f6' FROM default_categories WHERE key = 'study';

-- Personal Improvement tags
INSERT INTO default_tags (default_category_id, name, color)
SELECT id, 'meditation', '#f97316' FROM default_categories WHERE key = 'personals'
UNION ALL
SELECT id, 'socialization', '#f97316' FROM default_categories WHERE key = 'personals'
UNION ALL
SELECT id, 'psychology', '#f97316' FROM default_categories WHERE key = 'personals'
UNION ALL
SELECT id, 'reading', '#f97316' FROM default_categories WHERE key = 'personals';

-- Spaces tags
INSERT INTO default_tags (default_category_id, name, color)
SELECT id, 'cleaning', '#a78bfa' FROM default_categories WHERE key = 'spaces'
UNION ALL
SELECT id, 'cooking', '#a78bfa' FROM default_categories WHERE key = 'spaces'
UNION ALL
SELECT id, 'decluttering', '#a78bfa' FROM default_categories WHERE key = 'spaces';
```

---

## User Tables

### 4. categories

User categories (copies of default + custom, 1:N with tags).

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_categories_user ON categories(user_id);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own categories"
  ON categories FOR ALL USING (auth.uid() = user_id);
```

### 5. tags

User tags (1:N relationship with user categories).

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#e5e7eb',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id, name)
);

CREATE INDEX idx_tags_category ON tags(category_id);
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own tags"
  ON tags FOR ALL USING (auth.uid() = user_id);
```

### 6. activities

User activities.

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE SET NULL,
  
  title VARCHAR(255),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_time - start_time))::INT / 60
  ) STORED,
  
  rating INT DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  notes TEXT,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT end_after_start CHECK (end_time > start_time)
);

CREATE INDEX idx_activities_user_date ON activities(user_id, activity_date DESC);
CREATE INDEX idx_activities_category ON activities(category_id);
CREATE INDEX idx_activities_rating ON activities(user_id, rating);
CREATE INDEX idx_activities_title ON activities(user_id, title);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own activities"
  ON activities FOR ALL USING (auth.uid() = user_id);
```

### 7. user_settings

User preferences.

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  language VARCHAR(5) DEFAULT 'en' CHECK (language IN ('en', 'es')),
  theme VARCHAR(10) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own settings"
  ON user_settings FOR ALL USING (auth.uid() = user_id);
```

---

## Triggers

Auto-update `updated_at` on any record change.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Deferred Seeding on First Authenticated Load

There is no trigger on `auth.users` and no seeding at signup time. At signup the
session is not yet established, `auth.uid()` is null, and RLS rejects the inserts.

Seeding runs instead on the first authenticated page load, through
`POST /api/bootstrap`. By then the session exists, so every insert passes RLS as the
authenticated user. No service role key, no `security definer`.

### Verification is per table

The endpoint checks categories and tags independently rather than treating the
presence of categories as proof of a complete seed. A run interrupted midway leaves
categories without their tags, and a categories-only check would never repair it.

### Ordering and referential integrity

Tags reference `categories.id`, so ordering is mandatory:

1. Compare the user's `is_default = true` categories against `default_categories`.
   Insert whatever is missing and capture the returned ids.
2. Only then, for each of those categories, compare the user's tags against
   `default_tags` for the corresponding default category. Insert what is missing,
   using the real category id.

Tags are never matched by joining on category name. A user who renames a copied
category would break a name-based join and end up with orphaned or duplicated tags.
Correspondence is resolved through the default category's stored English name
together with `is_default = true`, and from there through real ids.

If category insertion fails, the run stops and returns the error. Tags are not
touched, so no tag can be written against a category that does not exist.

### Idempotency

The endpoint runs on every authenticated mount, not only the first. Repeated runs
insert nothing once the user's data is complete. This also repairs accounts created
before this strategy existed, and completes partial seeds without manual work.

### Response

```
{ seeded: boolean, categoriesCreated: number, tagsCreated: number }
```

### Custom categories are untouched

Only rows with `is_default = true` participate. Categories and tags the user created
are never compared, modified, or counted against the seed.

## Constraints & Rules

- 4 default categories per user (copied on signup)
- Max 3 additional custom categories = 7 total
- Activity title optional (nullable), max 255 chars; blank input stored as NULL
- Rating 0-5 (0 = unrated)
- 1:N relationships maintained on both default and user tables
- RLS ensures user isolation
- No icons (simplified schema)