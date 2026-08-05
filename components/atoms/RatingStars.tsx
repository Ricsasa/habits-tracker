'use client';

import { useLanguage } from '@/lib/i18n/useLanguage';

export interface RatingStarsProps {
  rating: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md';
}

const STARS = [1, 2, 3, 4, 5];

const SIZES = { sm: 'text-xs', md: 'text-xl' };

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
      <span className={`${SIZES[size]} text-category-rating rounded-none`} aria-label={label}>
        {STARS.map((star) => (star <= rating ? '★' : '☆')).join('')}
      </span>
    );
  }

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5 rounded-none">
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          aria-label={t('forms.ratingSet', { value: star })}
          aria-pressed={star <= rating}
          onClick={() => onChange(star === rating ? 0 : star)}
          className={`border border-border-light bg-surface-primary px-3 py-2 text-xl rounded-none dark:border-border-light-dark dark:bg-surface-secondary-dark ${
            star <= rating
              ? 'text-category-rating'
              : 'text-border-medium dark:text-content-tertiary-dark'
          }`}
        >
          ★
        </button>
      ))}
      <span className="self-center text-xs text-content-tertiary dark:text-content-tertiary-dark">
        {rating === 0 ? t('common.unrated') : String(rating)}
      </span>
    </div>
  );
}
