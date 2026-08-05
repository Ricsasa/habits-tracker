'use client';

import { useState } from 'react';
import { Activity, ActivityInput } from '@/lib/types';
import { combineDateTime, minutesBetween, timeInputValue, todayIso } from '@/lib/locale-utils';

export interface ActivityFormValues {
  title: string;
  categoryId: string | null;
  tagId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  rating: number;
  notes: string;
}

export type FieldErrors = Partial<Record<'title' | 'category' | 'time', string>>;

function initialValues(activity?: Activity): ActivityFormValues {
  if (!activity) {
    return {
      title: '',
      categoryId: null,
      tagId: null,
      date: todayIso(),
      startTime: '08:00',
      endTime: '09:00',
      rating: 0,
      notes: '',
    };
  }
  return {
    title: activity.title,
    categoryId: activity.category_id,
    tagId: activity.tag_id,
    date: activity.activity_date,
    startTime: timeInputValue(activity.start_time),
    endTime: timeInputValue(activity.end_time),
    rating: activity.rating,
    notes: activity.notes ?? '',
  };
}

export function validateValues(values: ActivityFormValues): FieldErrors {
  const errors: FieldErrors = {};
  const title = values.title.trim();
  if (title.length === 0 || title.length > 255) errors.title = 'messages.titleRequired';
  if (!values.categoryId) errors.category = 'messages.categoryRequired';
  if (values.endTime <= values.startTime) errors.time = 'messages.invalidTimeRange';
  return errors;
}

export function toActivityInput(values: ActivityFormValues): ActivityInput {
  return {
    title: values.title.trim(),
    category_id: values.categoryId as string,
    tag_id: values.tagId,
    start_time: combineDateTime(values.date, values.startTime),
    end_time: combineDateTime(values.date, values.endTime),
    rating: values.rating,
    notes: values.notes.trim() === '' ? null : values.notes.trim(),
    activity_date: values.date,
  };
}

export function useActivityForm(activity?: Activity) {
  const [values, setValues] = useState<ActivityFormValues>(() => initialValues(activity));
  const [errors, setErrors] = useState<FieldErrors>({});

  function update<K extends keyof ActivityFormValues>(key: K, value: ActivityFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  const durationMinutes = minutesBetween(values.date, values.startTime, values.endTime);

  return { values, errors, setErrors, update, durationMinutes };
}
