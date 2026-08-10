import { ActivityInput, ReportFilters } from './types';

export const MAX_CATEGORIES_PER_USER = 7;
export const MAX_NOTES_LENGTH = 5000;
export const MAX_TITLE_SEARCH_LENGTH = 100;
export const MAX_FILTER_IDS = 100;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function validateTitle(title: unknown): string | null {
  if (title === undefined || title === null) return null;
  if (typeof title !== 'string') return 'title must be a string';
  if (title.trim().length > 255) return 'title cannot exceed 255 characters';
  return null;
}

export function validateRating(rating: unknown): string | null {
  if (rating === undefined || rating === null) return null;
  if (typeof rating !== 'number' || !Number.isInteger(rating)) return 'rating must be an integer';
  if (rating < 0 || rating > 5) return 'rating must be between 0 and 5';
  return null;
}

export function validateTimeRange(startTime: unknown, endTime: unknown): string | null {
  if (typeof startTime !== 'string' || typeof endTime !== 'string') {
    return 'start_time and end_time are required';
  }
  const start = Date.parse(startTime);
  const end = Date.parse(endTime);
  if (Number.isNaN(start) || Number.isNaN(end)) return 'start_time and end_time must be valid dates';
  if (end <= start) return 'end_time must be after start_time';
  return null;
}

export function validateName(name: unknown, maxLength: number, field: string): string | null {
  if (typeof name !== 'string') return `${field} is required`;
  const trimmed = name.trim();
  if (trimmed.length < 1) return `${field} cannot be empty`;
  if (trimmed.length > maxLength) return `${field} cannot exceed ${maxLength} characters`;
  return null;
}

export function validateColor(color: unknown, required: boolean): string | null {
  if (color === undefined || color === null) return required ? 'color is required' : null;
  if (typeof color !== 'string' || !HEX_COLOR.test(color)) return 'color must be a hex value like #2563eb';
  return null;
}

export function validateNotes(notes: unknown): string | null {
  if (notes === undefined || notes === null) return null;
  if (typeof notes !== 'string') return 'notes must be a string';
  if (notes.length > MAX_NOTES_LENGTH) {
    return `notes cannot exceed ${MAX_NOTES_LENGTH} characters`;
  }
  return null;
}

export function validateActivityInput(input: Partial<ActivityInput>): string | null {
  return (
    validateTitle(input.title) ??
    validateNotes(input.notes) ??
    validateTimeRange(input.start_time, input.end_time) ??
    validateRating(input.rating) ??
    (input.activity_date === undefined || ISO_DATE.test(String(input.activity_date))
      ? null
      : 'activity_date must be YYYY-MM-DD') ??
    (typeof input.category_id === 'string' && input.category_id.length > 0
      ? null
      : 'category_id is required')
  );
}

function validateIdList(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (!Array.isArray(value)) return `${field} must be an array`;
  if (value.length > MAX_FILTER_IDS) return `${field} cannot exceed ${MAX_FILTER_IDS} entries`;
  // Anything that is not a uuid cannot match a row, and letting it through only
  // hands unfiltered text to the PostgREST query builder.
  if (!value.every((id) => typeof id === 'string' && UUID.test(id))) {
    return `${field} must contain only uuids`;
  }
  return null;
}

function validateIsoDate(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return `${field} must be YYYY-MM-DD`;
  return null;
}

export function validateReportFilters(filters: ReportFilters): string | null {
  if (filters.minRating !== undefined) {
    const ratingError = validateRating(filters.minRating);
    if (ratingError) return ratingError;
  }
  const shapeError =
    validateIsoDate(filters.startDate, 'startDate') ??
    validateIsoDate(filters.endDate, 'endDate') ??
    validateIdList(filters.categoryIds, 'categoryIds') ??
    validateIdList(filters.tagIds, 'tagIds');
  if (shapeError) return shapeError;
  if (filters.titleSearch !== undefined && filters.titleSearch !== null) {
    if (typeof filters.titleSearch !== 'string') return 'titleSearch must be a string';
    if (filters.titleSearch.length > MAX_TITLE_SEARCH_LENGTH) {
      return `titleSearch cannot exceed ${MAX_TITLE_SEARCH_LENGTH} characters`;
    }
  }
  if (filters.startDate && filters.endDate && filters.endDate < filters.startDate) {
    return 'endDate must be on or after startDate';
  }
  return null;
}

// `%` and `_` are wildcards to ilike, so an unescaped user string turns a
// prefix lookup into a full-table scan (or matches rows it should not).
export function escapeLikePattern(input: string): string {
  return input.replace(/[\\%_]/g, (char) => `\\${char}`);
}
