import { ActivityInput, ReportFilters } from './types';

export const MAX_CATEGORIES_PER_USER = 7;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function validateTitle(title: unknown): string | null {
  if (typeof title !== 'string') return 'title is required';
  const trimmed = title.trim();
  if (trimmed.length < 1) return 'title cannot be empty';
  if (trimmed.length > 255) return 'title cannot exceed 255 characters';
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

export function validateActivityInput(input: Partial<ActivityInput>): string | null {
  return (
    validateTitle(input.title) ??
    validateTimeRange(input.start_time, input.end_time) ??
    validateRating(input.rating) ??
    (typeof input.category_id === 'string' && input.category_id.length > 0
      ? null
      : 'category_id is required')
  );
}

export function validateReportFilters(filters: ReportFilters): string | null {
  if (filters.minRating !== undefined) {
    const ratingError = validateRating(filters.minRating);
    if (ratingError) return ratingError;
  }
  if (filters.startDate && filters.endDate && filters.endDate < filters.startDate) {
    return 'endDate must be on or after startDate';
  }
  return null;
}
