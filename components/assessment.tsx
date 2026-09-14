'use client';
import {
  BookOpen,
  Check,
  ClipboardList,
  Compass,
  Info,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Section } from '@astryxdesign/core/Section';
import { InterfaceRegion } from '@/components/workflow-ui';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Banner } from '@astryxdesign/core/Banner';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Link } from '@astryxdesign/core/Link';
import { bibliography } from '@/lib/bibliography';
import {
  categories,
  calculateAssessment,
  toggleCriterion,
  sources,
  zoneNames,
  type Assessment,
  type Category,
} from '@/lib/model';
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

export function CriteriaForm({
  record,
  onChange,
  disabled = false,
}: FormProps) {
  const result = calculateAssessment(record);
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
            {!result.scoringPending && (
              <Text type="code" color="secondary" className="min-w-8 text-end">
                +{item.points}
              </Text>
            )}
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
                    if (
                      status !== 'none' &&
                      status !== 'unknown' &&
                      status !== 'normal'
                    )
                      return;
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
                  {(cat.id === 'laboratory' &&
                  record.modelVersion !== 'demo-0.1'
                    ? (['normal', 'unknown'] as const)
                    : (['none', 'unknown'] as const)
                  ).map((status) => (
                    <RadioListItem
                      key={status}
                      value={status}
                      label={
                        status === 'normal'
                          ? 'Норма на момент исследования'
                          : status === 'none'
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
  const r = calculateAssessment(record);
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
              type={r.hasData && !r.scoringPending ? 'display-1' : 'large'}
              weight="semibold"
              hasTabularNumbers
            >
              {r.scoringPending
                ? 'Индекс не рассчитан'
                : r.hasData
                  ? r.score
                  : 'Нет данных'}
            </Text>
            {r.hasData && !r.scoringPending && (
              <Text color="secondary">из 100</Text>
            )}
          </HStack>
          {r.hasData && !r.scoringPending && (
            <HStack gap={2} align="center">
              <StatusDot
                variant={riskVariant(r.zone)}
                label={zoneNames[r.zone]}
              />
              <Text weight="medium">{zoneNames[r.zone]}</Text>
            </HStack>
          )}
        </VStack>
        {!r.scoringPending && (
          <VStack gap={3}>
            <ProgressBar
              label="Демонстрационный индекс"
              isLabelHidden
              value={r.score ?? 0}
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
        )}
        {r.scoringPending && (
          <Text color="secondary">
            Числовая модель ожидает клинического утверждения. Признаки,
            обоснование и направление доступны.
          </Text>
        )}
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
          {r.modelLabel}. Модель не валидирована; индекс не является
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
  const result = calculateAssessment(record);
  const items = result.contributions
    .filter((c) => c.selected.length)
    .sort((a, b) => (result.scoringPending ? 0 : b.points - a.points));
  return (
    <InterfaceRegion aria-label="Обоснование результата">
      <VStack gap={4}>
        <HStack gap={3} align="center">
          <BookOpen className="size-5 shrink-0 text-secondary" />
          <Heading level={3}>Что влияет на оценку</Heading>
        </HStack>
        {record.visit.diagnosis && (
          <VStack gap={1}>
            <Text weight="medium">Причина оценки</Text>
            <Text color="secondary">{record.visit.diagnosis}</Text>
          </VStack>
        )}
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
                      {!result.scoringPending && (
                        <Text type="code">+{item.points}</Text>
                      )}
                    </HStack>
                  }
                >
                  <VStack gap={3} paddingBlockStart={4}>
                    {item.selected.map((c) => (
                      <Text key={c.id}>
                        {c.label}{' '}
                        {!result.scoringPending && (
                          <Text color="secondary">(вес {c.points})</Text>
                        )}
                      </Text>
                    ))}
                    <Text type="supporting">
                      {result.scoringPending
                        ? item.category.id === 'consanguinity'
                          ? 'Консангвинность повышает вероятность аутосомно-рецессивного типа наследования при подтверждении генетического диагноза и учитывается в сочетании с семейным анамнезом. Самостоятельные баллы не начисляются; коэффициент ожидает утверждения.'
                          : item.category.id === 'neurodevelopment'
                            ? 'Регресс рассматривается отдельно от задержки развития и требует клинической оценки независимо от индекса. Новый вес ожидает утверждения.'
                            : item.category.id === 'treatment'
                              ? 'Ответ на терапию рассматривается вместе с неврологическими проявлениями. Правило усиления пока не утверждено.'
                              : 'Признаки учтены в обосновании. Числовые вклады будут доступны после утверждения новой модели.'
                        : `Учитывается максимальный вес: ${item.points} баллов.`}
                    </Text>
                    {result.scoringPending && (
                      <VStack gap={2}>
                        {bibliography
                          .find((category) => category.id === item.category.id)
                          ?.entries.filter((entry) => entry.sourceUrl)
                          .slice(0, 2)
                          .map((entry) => (
                            <Link
                              key={entry.citation}
                              href={entry.sourceUrl!}
                              isExternalLink
                              newTabLabel="Открывается в новой вкладке"
                            >
                              {entry.citation}
                            </Link>
                          ))}
                      </VStack>
                    )}
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
  const urgent = calculateAssessment(record).urgent;
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
