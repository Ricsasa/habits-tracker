import {
  escapeLikePattern,
  MAX_FILTER_IDS,
  MAX_NOTES_LENGTH,
  MAX_TITLE_SEARCH_LENGTH,
  validateActivityInput,
  validateColor,
  validateName,
  validateNotes,
  validateRating,
  validateReportFilters,
  validateTimeRange,
  validateTitle,
} from '@/lib/validation';
import { makeActivityInput } from '../helpers/fixtures';

const VALID_UUID = '11111111-2222-4333-8444-555555555555';

describe('validateTitle', () => {
  it('accepts missing, empty, and whitespace-only titles, since title is optional', () => {
    expect(validateTitle(undefined)).toBeNull();
    expect(validateTitle(null)).toBeNull();
    expect(validateTitle('')).toBeNull();
    expect(validateTitle('   ')).toBeNull();
  });

  it('rejects non-string titles', () => {
    expect(validateTitle(42)).toBe('title must be a string');
  });

  it('accepts 255 characters and rejects 256', () => {
    expect(validateTitle('a'.repeat(255))).toBeNull();
    expect(validateTitle('a'.repeat(256))).toBe('title cannot exceed 255 characters');
    // trimmed before measuring, so surrounding space does not push it over
    expect(validateTitle(` ${'a'.repeat(255)} `)).toBeNull();
  });
});

describe('validateRating', () => {
  it('treats undefined and null as valid, since rating is optional', () => {
    expect(validateRating(undefined)).toBeNull();
    expect(validateRating(null)).toBeNull();
  });

  it('rejects non-integers and out-of-range values, accepts 0 and 5', () => {
    expect(validateRating(2.5)).toBe('rating must be an integer');
    expect(validateRating('4')).toBe('rating must be an integer');
    expect(validateRating(-1)).toBe('rating must be between 0 and 5');
    expect(validateRating(6)).toBe('rating must be between 0 and 5');
    expect(validateRating(0)).toBeNull();
    expect(validateRating(5)).toBeNull();
  });
});

describe('validateTimeRange', () => {
  it('rejects missing or unparseable timestamps', () => {
    expect(validateTimeRange(undefined, '2026-08-04T10:00:00Z')).toBe(
      'start_time and end_time are required'
    );
    expect(validateTimeRange('2026-08-04T09:00:00Z', null)).toBe(
      'start_time and end_time are required'
    );
    expect(validateTimeRange('not-a-date', '2026-08-04T10:00:00Z')).toBe(
      'start_time and end_time must be valid dates'
    );
  });

  it('rejects an end equal to or before the start', () => {
    const start = '2026-08-04T09:00:00Z';
    expect(validateTimeRange(start, start)).toBe('end_time must be after start_time');
    expect(validateTimeRange(start, '2026-08-04T08:59:00Z')).toBe(
      'end_time must be after start_time'
    );
    expect(validateTimeRange(start, '2026-08-04T09:01:00Z')).toBeNull();
  });
});

describe('validateName', () => {
  it('names the offending field in every message and enforces the given max length', () => {
    expect(validateName(undefined, 50, 'name')).toBe('name is required');
    expect(validateName('  ', 50, 'name')).toBe('name cannot be empty');
    expect(validateName('a'.repeat(51), 50, 'name')).toBe('name cannot exceed 50 characters');
    expect(validateName('a'.repeat(50), 50, 'name')).toBeNull();
  });
});

describe('validateColor', () => {
  it('accepts 6-digit hex only, and honors the required flag', () => {
    expect(validateColor('#2563eb', true)).toBeNull();
    expect(validateColor('#ABCDEF', true)).toBeNull();
    expect(validateColor('rgb(37, 99, 235)', true)).toBe('color must be a hex value like #2563eb');
    expect(validateColor('#abc', true)).toBe('color must be a hex value like #2563eb');
    expect(validateColor(undefined, true)).toBe('color is required');
    expect(validateColor(undefined, false)).toBeNull();
  });
});

describe('validateActivityInput', () => {
  it('returns the first error in precedence order and requires category_id', () => {
    // both title and time range are invalid; the title error wins
    expect(
      validateActivityInput({ title: 'a'.repeat(256), start_time: 'nope', end_time: 'nope' })
    ).toBe('title cannot exceed 255 characters');

    // an empty title is allowed and falls through to the next check
    expect(validateActivityInput({ title: '', start_time: 'nope', end_time: 'nope' })).toBe(
      'start_time and end_time must be valid dates'
    );

    expect(validateActivityInput(makeActivityInput({ category_id: '' }))).toBe(
      'category_id is required'
    );
    expect(validateActivityInput(makeActivityInput())).toBeNull();
  });
});

describe('validateReportFilters', () => {
  it('checks minRating only when present and rejects an inverted date range', () => {
    expect(validateReportFilters({})).toBeNull();
    expect(validateReportFilters({ minRating: 9 })).toBe('rating must be between 0 and 5');
    expect(validateReportFilters({ startDate: '2026-08-04', endDate: '2026-08-01' })).toBe(
      'endDate must be on or after startDate'
    );
    // an open-ended range is valid, so a lone startDate must not trip the check
    expect(validateReportFilters({ startDate: '2026-08-04' })).toBeNull();
    expect(validateReportFilters({ startDate: '2026-08-04', endDate: '2026-08-04' })).toBeNull();
  });

  it('rejects filter fields whose type or size is not what the query builder expects', () => {
    const filters = (value: unknown) => value as never;

    expect(validateReportFilters({ startDate: filters('04/08/2026') })).toBe(
      'startDate must be YYYY-MM-DD'
    );
    expect(validateReportFilters({ endDate: filters(20260804) })).toBe('endDate must be YYYY-MM-DD');
    expect(validateReportFilters({ categoryIds: filters('not-an-array') })).toBe(
      'categoryIds must be an array'
    );
    expect(validateReportFilters({ tagIds: ['not-a-uuid'] })).toBe(
      'tagIds must contain only uuids'
    );
    expect(
      validateReportFilters({ categoryIds: Array(MAX_FILTER_IDS + 1).fill(VALID_UUID) })
    ).toBe(`categoryIds cannot exceed ${MAX_FILTER_IDS} entries`);
    expect(validateReportFilters({ titleSearch: filters({}) })).toBe(
      'titleSearch must be a string'
    );
    expect(validateReportFilters({ titleSearch: 'x'.repeat(MAX_TITLE_SEARCH_LENGTH + 1) })).toBe(
      `titleSearch cannot exceed ${MAX_TITLE_SEARCH_LENGTH} characters`
    );
    expect(validateReportFilters({ categoryIds: [VALID_UUID], titleSearch: 'run' })).toBeNull();
  });
});

describe('validateNotes', () => {
  it('accepts absent notes and rejects a non-string or oversized value', () => {
    expect(validateNotes(undefined)).toBeNull();
    expect(validateNotes(null)).toBeNull();
    expect(validateNotes('a note')).toBeNull();
    expect(validateNotes(42)).toBe('notes must be a string');
    expect(validateNotes('x'.repeat(MAX_NOTES_LENGTH + 1))).toBe(
      `notes cannot exceed ${MAX_NOTES_LENGTH} characters`
    );
  });
});

describe('escapeLikePattern', () => {
  it('neutralises ilike wildcards so a search stays a literal substring match', () => {
    expect(escapeLikePattern('100%')).toBe('100\\%');
    expect(escapeLikePattern('a_b')).toBe('a\\_b');
    expect(escapeLikePattern('back\\slash')).toBe('back\\\\slash');
    expect(escapeLikePattern('plain')).toBe('plain');
  });
});
