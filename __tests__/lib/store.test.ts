import { act, renderHook } from '@testing-library/react';
import { useAppStore } from '@/lib/store';
import { todayIso } from '@/lib/locale-utils';

const initialState = useAppStore.getState();

beforeEach(() => {
  useAppStore.setState(initialState, true);
});

describe('useAppStore', () => {
  it('starts on today with no report filters applied', () => {
    const { result } = renderHook(() => useAppStore());

    expect(result.current.selectedDate).toBe(todayIso());
    expect(result.current.reportFilters).toEqual({});
  });

  it('exposes the new date to consumers after setSelectedDate', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => result.current.setSelectedDate('2026-08-04'));

    expect(result.current.selectedDate).toBe('2026-08-04');
  });
});
