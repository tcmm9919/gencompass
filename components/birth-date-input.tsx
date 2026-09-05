'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Calendar, type ISODateString } from '@astryxdesign/core/Calendar';
import { IconButton } from '@astryxdesign/core/IconButton';
import { InputGroup, InputGroupText } from '@astryxdesign/core/InputGroup';
import { usePopover } from '@astryxdesign/core/Popover';
import { Selector } from '@astryxdesign/core/Selector';
import { TextInput } from '@astryxdesign/core/TextInput';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { localDate, validDate } from '@/lib/patient';

const MIN_DATE: ISODateString = '1906-01-01';
const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

type BirthDateInputProps = {
  value?: string;
  max?: ISODateString;
  onChange: (value?: string) => void;
  isDisabled?: boolean;
};

function formatDate(value?: string) {
  return value && validDate(value)
    ? value.split('-').reverse().join('.')
    : (value ?? '');
}

function parseDate(text: string): ISODateString | undefined {
  const trimmed = text.trim();
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(trimmed);
  const candidate = match
    ? `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`
    : trimmed;
  return validDate(candidate) ? (candidate as ISODateString) : undefined;
}

function clampDate(date: ISODateString, max: ISODateString) {
  return date < MIN_DATE ? MIN_DATE : date > max ? max : date;
}

export function BirthDateInput({
  value,
  max,
  onChange,
  isDisabled = false,
}: BirthDateInputProps) {
  const maximum = max && validDate(max) ? max : (localDate() as ISODateString);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedDate =
    value && validDate(value) ? (value as ISODateString) : undefined;
  const draft = formatDate(value);
  const [showError, setShowError] = useState(false);
  const [focusDate, setFocusDate] = useState<ISODateString>(
    selectedDate ?? maximum,
  );

  const {
    triggerRef,
    hide: hidePopover,
    show: showPopover,
    isOpen,
    triggerProps,
    render: renderPopover,
  } = usePopover({
    dialogLabel: 'Выбор даты рождения',
    closeButtonLabel: 'Закрыть календарь',
    className: 'w-80 max-w-[calc(100vw-2rem)] p-3',
  });

  useEffect(() => {
    if (isDisabled) hidePopover();
  }, [isDisabled, hidePopover]);

  const visibleDate = clampDate(focusDate, maximum);
  const year = visibleDate.slice(0, 4);
  const month = visibleDate.slice(5, 7);
  const maximumYear = Number(maximum.slice(0, 4));
  const hasAvailableDates = maximum >= MIN_DATE;
  const yearOptions = Array.from(
    { length: Math.max(0, maximumYear - 1906 + 1) },
    (_, index) => {
      const year = String(maximumYear - index);
      return { value: year, label: year };
    },
  );
  const monthOptions = MONTHS.map((label, index) => {
    const month = String(index + 1).padStart(2, '0');
    return {
      value: month,
      label,
      disabled: !hasAvailableDates || `${year}-${month}-01` > maximum,
    };
  });

  const validate = (text: string) => {
    const date = parseDate(text);
    if (!date) return 'Введите существующую дату в формате дд.мм.гггг.';
    if (date < MIN_DATE)
      return 'Дата рождения должна быть не ранее 01.01.1906.';
    if (date > maximum)
      return `Дата рождения должна быть не позднее ${formatDate(maximum)}.`;
    return null;
  };
  const error = showError && draft.trim() ? validate(draft) : null;

  const commit = (text: string) => {
    if (isDisabled) return;
    setShowError(true);
    const date = parseDate(text);
    const next = text.trim() ? (date ?? text) : undefined;
    if (date && !validate(text)) setFocusDate(date);
    if (next !== value) onChange(next);
  };

  const openCalendar = () => {
    if (isDisabled || !hasAvailableDates) return;
    const pending = parseDate(draft);
    setFocusDate(clampDate(pending ?? selectedDate ?? maximum, maximum));
    showPopover();
  };

  const navigate = (nextYear: string, nextMonth: string) => {
    if (isDisabled) return;
    const nextDate = `${nextYear}-${nextMonth}-01` as ISODateString;
    setFocusDate(clampDate(nextDate, maximum));
  };

  return (
    <>
      <InputGroup
        ref={triggerRef}
        label="Дата рождения"
        isDisabled={isDisabled}
        size="lg"
        status={error ? { type: 'error', message: error } : undefined}
        className="w-full"
      >
        <TextInput
          ref={inputRef}
          label=""
          isLabelHidden
          placeholder="дд.мм.гггг"
          value={draft}
          onChange={(text) => {
            if (isDisabled) return;
            const next = text.slice(0, 10);
            const parsed = parseDate(next);
            setShowError(next.length === 10);
            // Keep incomplete/invalid text in the record so form validation
            // cannot save a stale birthday while the user sees another value.
            onChange(next.trim() ? (parsed ?? next) : undefined);
            if (parsed && !validate(next)) setFocusDate(parsed);
          }}
          onBlur={() => commit(draft)}
          onKeyDown={(event) => {
            if (isDisabled || event.nativeEvent.isComposing) return;
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              openCalendar();
            } else if (event.key === 'Enter') {
              event.preventDefault();
              commit(draft);
              hidePopover();
            } else if (event.key === 'Escape' && isOpen) {
              event.preventDefault();
              hidePopover();
            }
          }}
          status={error ? { type: 'error' } : undefined}
          isDisabled={isDisabled}
          hasClear
          size="lg"
          className="min-w-0 flex-1 border-e-0"
        />
        <InputGroupText className="border-s-0 bg-surface px-1">
          <IconButton
            label={isOpen ? 'Закрыть календарь' : 'Выбрать дату рождения'}
            icon={<CalendarDays className="size-4" />}
            variant="ghost"
            size="md"
            isDisabled={isDisabled || !hasAvailableDates}
            onClick={() => (isOpen ? hidePopover() : openCalendar())}
            {...triggerProps}
          />
        </InputGroupText>
      </InputGroup>
      {!isDisabled &&
        renderPopover(
          <VStack gap={3}>
            <HStack gap={2}>
              <Selector
                label="Месяц"
                value={month}
                options={monthOptions}
                onChange={(nextMonth) => navigate(year, nextMonth)}
                width="100%"
                isOptional
                isDisabled={!hasAvailableDates}
              />
              <Selector
                label="Год"
                value={hasAvailableDates ? year : ''}
                options={yearOptions}
                onChange={(nextYear) => navigate(nextYear, month)}
                hasSearch
                searchPlaceholder="Найти год"
                width="100%"
                isOptional
                isDisabled={!hasAvailableDates}
              />
            </HStack>
            <Calendar
              key={selectedDate ?? 'empty'}
              mode="single"
              value={selectedDate}
              min={MIN_DATE}
              max={maximum}
              focusDate={visibleDate}
              onFocusDateChange={setFocusDate}
              weekStartsOn="mon"
              onChange={(date) => {
                if (isDisabled || date < MIN_DATE || date > maximum) return;
                commit(formatDate(date));
                hidePopover();
                inputRef.current?.focus();
              }}
              className="w-full p-0"
            />
          </VStack>,
          { placement: 'below', alignment: 'start' },
        )}
    </>
  );
}
