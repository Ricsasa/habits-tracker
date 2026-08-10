'use client';

import { useLanguage } from '@/lib/i18n/useLanguage';

export interface RatingStarsProps {
  rating: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md';
}

const STARS = [1, 2, 3, 4, 5];

// Deliberate exception to the boxed-control language: a star is already a mark,
// so a border and fill around it would read as a second frame. The glyph itself
// carries the state, which is why it runs larger than any other inline control.
const SIZES = { sm: 'text-base', md: 'text-3xl' };

export default function RatingStars({
  rating,
  onChange,
  readOnly = false,
  size = 'md',
}: RatingStarsProps) {
  const { t } = useLanguage();
  const label = t('forms.ratingValue', { value: rating });

  if (readOnly || !onChange) {
    return (
      <span
        className={`${SIZES[size]} leading-none text-category-rating rounded-none`}
        aria-label={label}
      >
        {STARS.map((star) => (star <= rating ? '★' : '☆')).join('')}
      </span>
    );
  }

  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1 rounded-none">
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          aria-label={t('forms.ratingSet', { value: star })}
          aria-pressed={star <= rating}
          onClick={() => onChange(star === rating ? 0 : star)}
          className={`bg-transparent px-1 py-1 text-4xl leading-none rounded-none transition-colors ${
            star <= rating
              ? 'text-category-rating'
              : 'text-border-medium dark:text-content-tertiary-dark'
          }`}
        >
          ★
        </button>
      ))}
      <span className="ml-1 self-center text-xs text-content-tertiary dark:text-content-tertiary-dark">
        {rating === 0 ? t('common.unrated') : String(rating)}
      </span>
    </div>
  );
}
