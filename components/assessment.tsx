'use client';
import {
  BookOpen,
  Check,
  ClipboardList,
  Compass,
  Info,
  ArrowRight,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { TextInput } from '@astryxdesign/core/TextInput';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { DateInput } from '@astryxdesign/core/DateInput';
import type { ISODateString } from '@astryxdesign/core/utils';
import { Selector } from '@astryxdesign/core/Selector';
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Section } from '@astryxdesign/core/Section';
import { InterfaceRegion } from '@/components/workflow-ui';
import { BirthDateInput } from '@/components/birth-date-input';
import { Card } from '@astryxdesign/core/Card';
import { FormLayout } from '@astryxdesign/core/FormLayout';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Banner } from '@astryxdesign/core/Banner';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Link } from '@astryxdesign/core/Link';
import {
  categories,
  calculate,
  toggleCriterion,
  sources,
  zoneNames,
  type Assessment,
  type Category,
} from '@/lib/model';
import {
  ageAt,
  ageLabel,
  localDate,
  type Patient,
  type Visit,
} from '@/lib/patient';

const displayDate = (date: ISODateString) =>
  date.split('-').reverse().join('.');
const iso = (date: string) => (date ? (date as ISODateString) : undefined);
export const riskVariant = (zone: string) =>
  zone === 'low'
    ? 'success'
    : zone === 'moderate'
      ? 'warning'
      : zone === 'high'
        ? 'error'
        : 'neutral';

type FormProps = {
  record: Assessment;
  onChange: (r: Assessment) => void;
  disabled?: boolean;
};

export function PatientContext({
  record,
  onChange,
  disabled = false,
}: FormProps) {
  const { patient, visit } = record;
  const changePatient = (field: keyof Patient, value: string) => {
    const next = { ...patient, [field]: value };
    const age = next.birthDate
      ? ageAt(next.birthDate, visit.date || localDate())
      : null;
    onChange({
      ...record,
      patient: next,
      age: age ? String(age.years) : record.age,
    });
  };
  const changeVisit = (field: keyof Visit, value: string) => {
    const next = { ...visit, [field]: value };
    const age = patient.birthDate
      ? ageAt(patient.birthDate, next.date || localDate())
      : null;
    onChange({
      ...record,
      visit: next,
      age: age ? String(age.years) : record.age,
    });
  };
  return (
    <VStack gap={4}>
      <InterfaceRegion aria-labelledby="patient-heading">
        <VStack gap={5}>
          <HStack gap={3} align="center">
            <UserRound className="size-5 shrink-0 text-secondary" />
            <Heading level={2} id="patient-heading">
              Данные пациента
            </Heading>
          </HStack>
          <FormLayout defaultOptionality="optional" className="gap-5">
            <Grid columns={{ minWidth: 220, max: 2 }} gap={5}>
              {(
                [
                  ['lastName', 'Фамилия', 'Введите фамилию', 80],
                  ['firstName', 'Имя', 'Введите имя', 80],
                  ['middleName', 'Отчество', 'При наличии', 80],
                  [
                    'recordNumber',
                    '№ медицинской карты',
                    'Номер карты пациента',
                    60,
                  ],
                ] as const
              ).map(([key, label, placeholder, limit]) => (
                <TextInput
                  key={key}
                  label={label}
                  placeholder={placeholder}
                  value={patient[key]}
                  onChange={(value) =>
                    changePatient(key, value.slice(0, limit))
                  }
                  isDisabled={disabled}
                  size="lg"
                  width="100%"
                />
              ))}
              <BirthDateInput
                value={patient.birthDate || undefined}
                max={iso(visit.date || localDate())}
                onChange={(value) => changePatient('birthDate', value ?? '')}
                isDisabled={disabled}
              />
              <Selector
                label="Пол"
                value={patient.sex}
                onChange={(value) => changePatient('sex', value)}
                options={[
                  { value: '', label: 'Не указан' },
                  { value: 'female', label: 'Женский' },
                  { value: 'male', label: 'Мужской' },
                  { value: 'unknown', label: 'Не определён' },
                ]}
                isDisabled={disabled}
                size="lg"
                width="100%"
              />
              {patient.birthDate ? (
                <TextInput
                  label="Возраст"
                  labelTooltip="Рассчитан по дате рождения на дату приёма"
                  value={ageLabel(patient.birthDate, visit.date || localDate())}
                  isReadOnly
                  size="lg"
                  width="100%"
                />
              ) : (
                <NumberInput
                  label="Возраст"
                  placeholder="Полных лет"
                  value={record.age === '' ? null : Number(record.age)}
                  onChange={(value) =>
                    onChange({
                      ...record,
                      age: value === null ? '' : String(value),
                    })
                  }
                  min={0}
                  max={120}
                  isIntegerOnly
                  isWheelEnabled={false}
                  hasClear
                  isDisabled={disabled}
                  size="lg"
                  width="100%"
                />
              )}
              <TextInput
                label="Код оценки"
                placeholder="Присваивается при сохранении"
                value={record.code}
                onChange={(value) =>
                  onChange({ ...record, code: value.slice(0, 40) })
                }
                isDisabled={disabled}
                size="lg"
                width="100%"
              />
            </Grid>
          </FormLayout>
        </VStack>
      </InterfaceRegion>
      <InterfaceRegion aria-labelledby="visit-heading">
        <VStack gap={5}>
          <HStack gap={3} align="center">
            <Stethoscope className="size-5 shrink-0 text-secondary" />
            <Heading level={2} id="visit-heading">
              Данные приёма
            </Heading>
          </HStack>
          <FormLayout defaultOptionality="optional" className="gap-5">
            <Grid columns={{ minWidth: 220, max: 2 }} gap={5}>
              <DateInput
                format={displayDate}
                label="Дата оценки"
                value={iso(visit.date)}
                max={iso(localDate())}
                onChange={(value) => changeVisit('date', value ?? '')}
                isDisabled={disabled}
                hasClear
                size="lg"
                width="100%"
              />
              <Selector
                label="Тип приёма"
                value={visit.type}
                onChange={(value) => changeVisit('type', value)}
                options={[
                  { value: 'initial', label: 'Первичный' },
                  { value: 'followup', label: 'Повторный' },
                ]}
                isDisabled={disabled}
                size="lg"
                width="100%"
              />
              <TextInput
                label="Лечащий врач"
                placeholder="ФИО врача"
                value={visit.clinician}
                onChange={(value) =>
                  changeVisit('clinician', value.slice(0, 160))
                }
                isDisabled={disabled}
                size="lg"
                width="100%"
              />
              <TextInput
                label="Специальность"
                placeholder="Например, педиатр"
                value={visit.specialty}
                onChange={(value) =>
                  changeVisit('specialty', value.slice(0, 100))
                }
                isDisabled={disabled}
                size="lg"
                width="100%"
              />
            </Grid>
            <TextInput
              label="Медицинская организация"
              placeholder="Название клиники или отделения"
              value={visit.clinic}
              onChange={(value) => changeVisit('clinic', value.slice(0, 180))}
              isDisabled={disabled}
              size="lg"
              width="100%"
            />
            <TextInput
              label="Предварительный диагноз / причина оценки"
              placeholder="Диагноз, код МКБ или ведущий клинический синдром"
              value={visit.diagnosis}
              onChange={(value) =>
                changeVisit('diagnosis', value.slice(0, 500))
              }
              isDisabled={disabled}
              size="lg"
              width="100%"
            />
          </FormLayout>
        </VStack>
      </InterfaceRegion>
    </VStack>
  );
}

export function CriteriaForm({
  record,
  onChange,
  disabled = false,
}: FormProps) {
  const result = calculate(record.answers);
  const answer = (cat: Category, id: string) =>
    onChange({ ...record, answers: toggleCriterion(record.answers, cat, id) });
  return (
    <VStack gap={4}>
      <VStack gap={4}>
        <HStack justify="between" gap={3} wrap="wrap">
          <Heading level={2}>Клинические признаки</Heading>
          <Text color="secondary">{result.reviewed} из 8 категорий</Text>
        </HStack>
        <ProgressBar
          value={result.reviewed}
          max={8}
          label="Просмотрено категорий"
          isLabelHidden
          formatValueLabel={(value) => `${value} из 8 категорий`}
        />
      </VStack>
      {categories.map((cat, index) => {
        const current = record.answers[cat.id];
        const extras = (item: Category['criteria'][number]) => (
          <HStack gap={2} align="center" className="shrink-0">
            <Tooltip content={item.description} touchTrigger="tap" delay={200}>
              <IconButton
                label={'Определение: ' + item.label}
                icon={<Info className="size-4" />}
                variant="ghost"
                size="sm"
                onClick={(event) => event.stopPropagation()}
              />
            </Tooltip>
            <Text type="code" color="secondary" className="min-w-8 text-end">
              +{item.points}
            </Text>
          </HStack>
        );
        return (
          <InterfaceRegion key={cat.id} aria-labelledby={'heading-' + cat.id}>
            <VStack gap={4}>
              <HStack gap={3} align="start">
                <Text type="code" color="secondary" className="pt-1">
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <VStack gap={2} className="min-w-0 flex-1">
                  <Heading level={3} id={'heading-' + cat.id}>
                    {cat.title}
                  </Heading>
                  <Text color="secondary">
                    {cat.mode === 'single'
                      ? 'Выберите один подходящий вариант'
                      : 'Отметьте все выявленные признаки'}
                  </Text>
                </VStack>
                {current && (
                  <Check
                    className="size-4 shrink-0 text-success mt-1"
                    aria-label="Категория просмотрена"
                  />
                )}
              </HStack>
              {cat.mode === 'single' ? (
                <RadioList
                  label={cat.title}
                  isLabelHidden
                  value={current?.selected[0] ?? ''}
                  onChange={(id) => id && answer(cat, id)}
                  isDisabled={disabled}
                  width="100%"
                >
                  {cat.criteria.map((item) => (
                    <RadioListItem
                      key={item.id}
                      value={item.id}
                      label={item.label}
                      endContent={extras(item)}
                      onClick={() => {
                        if (!disabled && current?.selected.includes(item.id)) {
                          answer(cat, item.id);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (
                          event.key === ' ' &&
                          event.target instanceof HTMLInputElement &&
                          event.target.type === 'radio' &&
                          !disabled
                        ) {
                          event.preventDefault();
                          if (!event.repeat) answer(cat, item.id);
                        }
                      }}
                    />
                  ))}
                </RadioList>
              ) : (
                <VStack
                  gap={2}
                  as="fieldset"
                  className="min-w-0"
                  aria-labelledby={'heading-' + cat.id}
                >
                  {cat.criteria.map((item) => (
                    <HStack
                      key={item.id}
                      gap={2}
                      align="center"
                      className="min-w-0"
                    >
                      <CheckboxInput
                        label={item.label}
                        value={current?.selected.includes(item.id) ?? false}
                        onChange={() => answer(cat, item.id)}
                        isDisabled={disabled}
                        className="min-w-0 flex-1 [&_.astryx-checkbox-label]:font-normal"
                      />
                      {extras(item)}
                    </HStack>
                  ))}
                </VStack>
              )}
              <HStack
                gap={4}
                align="center"
                wrap="wrap"
                className="border-t border-border pt-4"
              >
                <RadioList
                  label={`Данные категории: ${cat.title}`}
                  isLabelHidden
                  orientation="horizontal"
                  value={
                    current?.status === 'selected'
                      ? ''
                      : (current?.status ?? '')
                  }
                  onChange={(status) => {
                    if (status !== 'none' && status !== 'unknown') return;
                    onChange({
                      ...record,
                      answers: {
                        ...record.answers,
                        [cat.id]: { status, selected: [] },
                      },
                    });
                  }}
                  isDisabled={disabled}
                  width="auto"
                  className="min-w-0 max-w-full [&_.astryx-radio-list]:flex-wrap [&_.astryx-radio-list]:gap-4"
                >
                  {(['none', 'unknown'] as const).map((status) => (
                    <RadioListItem
                      key={status}
                      value={status}
                      label={
                        status === 'none'
                          ? cat.id === 'onset'
                            ? 'Симптомы не выявлены'
                            : 'Признаки не выявлены'
                          : 'Данных недостаточно'
                      }
                      onClick={() => {
                        if (disabled || current?.status !== status) return;
                        const answers = { ...record.answers };
                        delete answers[cat.id];
                        onChange({ ...record, answers });
                      }}
                      onKeyDown={(event) => {
                        if (
                          event.key === ' ' &&
                          event.target instanceof HTMLInputElement &&
                          event.target.type === 'radio' &&
                          !disabled
                        ) {
                          event.preventDefault();
                          if (event.repeat) return;
                          const answers = { ...record.answers };
                          if (current?.status === status)
                            delete answers[cat.id];
                          else answers[cat.id] = { status, selected: [] };
                          onChange({ ...record, answers });
                        }
                      }}
                    />
                  ))}
                </RadioList>
                {current && (
                  <Button
                    label="Сбросить"
                    variant="ghost"
                    size="sm"
                    isDisabled={disabled}
                    onClick={() => {
                      const answers = { ...record.answers };
                      delete answers[cat.id];
                      onChange({ ...record, answers });
                    }}
                  />
                )}
              </HStack>
            </VStack>
          </InterfaceRegion>
        );
      })}
    </VStack>
  );
}

export function ScoreCard({
  record,
  onResult,
  final = false,
  disabled = false,
}: {
  record: Assessment;
  onResult?: () => void;
  final?: boolean;
  disabled?: boolean;
}) {
  const r = calculate(record.answers);
  return (
    <Card padding={0} variant="default" className="w-full">
      <VStack gap={5} className="p-4 sm:p-6">
        <HStack gap={3} align="center">
          <Compass className="size-5 shrink-0 text-secondary" />
          <Heading level={3}>
            {final ? 'Результат оценки' : 'Предварительный результат'}
          </Heading>
        </HStack>
        <VStack gap={3} aria-live="polite" aria-atomic="true">
          <HStack gap={2} align="end">
            <Text
              type={r.hasData ? 'display-1' : 'large'}
              weight="semibold"
              hasTabularNumbers
            >
              {r.hasData ? r.score : 'Нет данных'}
            </Text>
            {r.hasData && <Text color="secondary">из 100</Text>}
          </HStack>
          {r.hasData && (
            <HStack gap={2} align="center">
              <StatusDot
                variant={riskVariant(r.zone)}
                label={zoneNames[r.zone]}
              />
              <Text weight="medium">{zoneNames[r.zone]}</Text>
            </HStack>
          )}
        </VStack>
        <VStack gap={3}>
          <ProgressBar
            label="Демонстрационный индекс"
            isLabelHidden
            value={r.score}
            max={100}
            formatValueLabel={() =>
              r.hasData ? `${r.score} из 100` : 'Нет данных'
            }
            variant={r.hasData ? riskVariant(r.zone) : 'neutral'}
            isDisabled={!r.hasData}
          />
          <HStack justify="between" gap={2}>
            <Text type="supporting">0–24 · Низкий</Text>
            <Text type="supporting">25–49</Text>
            <Text type="supporting">50–100 · Высокий</Text>
          </HStack>
        </VStack>
        <Text color="secondary">
          {r.hasData
            ? `Результат по известным данным: ${r.known} из 8 категорий. Незаполненные категории не считаются отрицательным ответом.`
            : 'Отметьте клинические признаки. Результат обновляется по мере заполнения.'}
        </Text>
        {onResult && (
          <Button
            label="Посмотреть результат"
            variant="primary"
            size="lg"
            width="100%"
            endContent={<ArrowRight className="size-4" />}
            onClick={onResult}
            isDisabled={!r.hasData || disabled}
          />
        )}
        <Text type="supporting">
          Демонстрационная модель · не валидирована. Индекс не является
          вероятностью диагноза.
        </Text>
      </VStack>
    </Card>
  );
}

export function Explainability({
  record,
  expanded = false,
}: {
  record: Assessment;
  expanded?: boolean;
}) {
  const items = calculate(record.answers)
    .contributions.filter((c) => c.selected.length)
    .sort((a, b) => b.points - a.points);
  return (
    <InterfaceRegion aria-label="Обоснование результата">
      <VStack gap={4}>
        <HStack gap={3} align="center">
          <BookOpen className="size-5 shrink-0 text-secondary" />
          <Heading level={3}>Что влияет на оценку</Heading>
        </HStack>
        {!items.length ? (
          <EmptyState
            isCompact
            title="Признаки пока не выбраны"
            description="Здесь появятся выбранные признаки и их вклад в результат."
            icon={<ClipboardList />}
          />
        ) : (
          <VStack gap={0}>
            {items.map((item) => (
              <Section
                padding={0}
                paddingBlock={3}
                dividers={['bottom']}
                key={item.category.id}
              >
                <Collapsible
                  defaultIsOpen={expanded}
                  trigger={
                    <HStack gap={3} justify="between" className="w-full">
                      <Text weight="medium">{item.category.title}</Text>
                      <Text type="code">+{item.points}</Text>
                    </HStack>
                  }
                >
                  <VStack gap={3} paddingBlockStart={4}>
                    {item.selected.map((c) => (
                      <Text key={c.id}>
                        {c.label}{' '}
                        <Text color="secondary">(вес {c.points})</Text>
                      </Text>
                    ))}
                    <Text type="supporting">
                      Учитывается максимальный вес: {item.points} баллов.
                    </Text>
                    <HStack gap={3} wrap="wrap">
                      {sources
                        .filter((s) => item.category.sourceIds.includes(s.id))
                        .map((s) => (
                          <Link
                            key={s.id}
                            href={s.url}
                            isExternalLink
                            newTabLabel="Открывается в новой вкладке"
                          >
                            {s.organization}
                          </Link>
                        ))}
                    </HStack>
                  </VStack>
                </Collapsible>
              </Section>
            ))}
          </VStack>
        )}
        <Text type="supporting">Источники описывают признаки, а не веса.</Text>
      </VStack>
    </InterfaceRegion>
  );
}

export function UrgentFlags({ record }: { record: Assessment }) {
  const urgent = calculate(record.answers).urgent;
  return urgent.length ? (
    <VStack gap={3}>
      {urgent.map((c) => (
        <Banner key={c.id} status="warning" title={c.label} collapsible={false}>
          <VStack gap={3}>
            <Text>{c.urgent?.split(' Источник:')[0]}</Text>
            <Link
              href="https://www.rch.org.au/clinicalguide/guideline_index/Metabolic_Disorders/"
              isExternalLink
              newTabLabel="Открывается в новой вкладке"
            >
              Рекомендации RCH
            </Link>
          </VStack>
        </Banner>
      ))}
    </VStack>
  ) : null;
}
