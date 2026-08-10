export type Language = 'en' | 'es';
export type Theme = 'light' | 'dark' | 'system';

export interface DefaultCategory {
  id: string;
  key: string;
  name: string;
  color: string;
  created_at: string;
}

export interface DefaultTag {
  id: string;
  default_category_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  category_id: string;
  tag_id: string | null;
  title: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  rating: number;
  notes: string | null;
  activity_date: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  language: Language;
  theme: Theme;
  created_at: string;
  updated_at: string;
}

export interface ActivityInput {
  title?: string | null;
  category_id: string;
  tag_id?: string | null;
  start_time: string;
  end_time: string;
  rating?: number;
  notes?: string | null;
  activity_date?: string;
}

export interface CategoryInput {
  name: string;
  color: string;
}

export interface TagInput {
  category_id: string;
  name: string;
  color?: string;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
  tagIds?: string[];
  minRating?: number;
  titleSearch?: string;
}

export interface ActivityWithRelations extends Activity {
  category: Pick<Category, 'id' | 'name' | 'color'> | null;
  tag: Pick<Tag, 'id' | 'name' | 'color'> | null;
}
