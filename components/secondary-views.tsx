'use client';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Download,
  FileClock,
  FileText,
  Plus,
  Printer,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  proportional,
  pixel,
  type TableColumn,
} from '@astryxdesign/core/Table';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Section } from '@astryxdesign/core/Section';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Token } from '@astryxdesign/core/Token';
import { Link } from '@astryxdesign/core/Link';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Banner } from '@astryxdesign/core/Banner';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import {
  ScoreCard,
  Explainability,
  UrgentFlags,
} from '@/components/assessment';
import {
  InterfaceRegion,
  PageHeading,
  WorkflowSteps,
} from '@/components/workflow-ui';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { bibliography } from '@/lib/bibliography';
import { browserStorageMode } from '@/lib/persistence';
import { patientName, ageLabel } from '@/lib/patient';
import {
  calculateAssessment,
  categories,
  sources,
  type Assessment,
} from '@/lib/model';

export function ResultView({
  record,
  onEdit,
  onRefer,
  onPrint,
  onExport,
}: {
  record: Assessment;
  onEdit: () => void;
  onRefer: () => void;
  onPrint: () => void;
  onExport: () => void;
}) {
  const r = calculateAssessment(record);
  return (
    <>
      <PageHeading
        title="Оценка клинических признаков"
        description={`${record.code || 'Новый случай'}${patientName(record.patient) ? ' · ' + patientName(record.patient) : ''} · ${r.known} из 8 категорий с известными данными`}
        actions={
          <Button
            label="Уточнить данные"
            icon={<ArrowLeft className="size-4" />}
            onClick={onEdit}
            size="lg"
          />
        }
      />
      <WorkflowSteps active={1} />
      <Grid
        gap={8}
        align="start"
        className="grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)]"
      >
        <VStack gap={6} className="min-w-0">
          <ScoreCard record={record} final />
          <UrgentFlags record={record} />
          <InterfaceRegion>
            <VStack gap={4}>
              <HStack gap={3} align="center">
                <FileText className="size-5 shrink-0 text-secondary" />
                <Heading level={2}>Следующий шаг</Heading>
              </HStack>
              <Heading level={3}>
                {r.scoringPending || (r.score ?? 0) >= 25
                  ? 'Подготовьте обоснование консультации'
                  : 'Сопоставьте результат с клинической картиной'}
              </Heading>
              <Text color="secondary">
                Решение о консультации и её срочности принимает врач по
                клинической картине. Индекс не исключает генетическое
                заболевание.
              </Text>
              <Button
                label="Направить к генетику"
                variant="primary"
                onClick={onRefer}
                isDisabled={!r.hasData}
                size="lg"
                width="100%"
                endContent={<ArrowRight className="size-4" />}
              />
              <HStack gap={2} wrap="wrap">
                <Button
                  label="Печать / PDF"
                  icon={<Printer className="size-4" />}
                  onClick={onPrint}
                  variant="ghost"
                />
                <Button
                  label="Скачать TXT"
                  icon={<Download className="size-4" />}
                  onClick={onExport}
                  variant="ghost"
                />
              </HStack>
            </VStack>
          </InterfaceRegion>
        </VStack>
        <VStack gap={5} className="min-w-0">
          <Explainability record={record} expanded />
          <InterfaceRegion>
            <VStack gap={4}>
              <HStack gap={3} align="center">
                <ClipboardList className="size-5 shrink-0 text-secondary" />
                <Heading level={2}>Полнота оценки</Heading>
                <Text color="secondary">{r.reviewed}/8</Text>
              </HStack>
              <ProgressBar
                label="Полнота оценки"
                isLabelHidden
                value={r.reviewed}
                max={8}
                formatValueLabel={(value) => `${value} из 8 категорий`}
              />
              <Table
                density="balanced"
                dividers="rows"
                aria-label="Полнота оценки по категориям"
              >
                <TableHeader>
                  <TableRow isHeaderRow>
                    <TableHeaderCell>Категория</TableHeaderCell>
                    <TableHeaderCell>Данные</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => {
                    const answer = record.answers[cat.id];
                    const label = !answer
                      ? 'Не заполнено'
                      : answer.status === 'unknown'
                        ? 'Нет данных'
                        : answer.status === 'normal'
                          ? 'Норма на момент исследования'
                          : answer.status === 'none'
                            ? 'Не выявлены'
                            : 'Есть данные';
                    return (
                      <TableRow key={cat.id}>
                        <TableCell>
                          <Text>{cat.title}</Text>
                        </TableCell>
                        <TableCell>
                          <Token
                            label={label}
                            color={
                              answer &&
                              answer.status !== 'unknown' &&
                              answer.status !== 'normal'
                                ? 'green'
                                : 'gray'
                            }
                            size="sm"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Text color="secondary">
                Категории без данных не считаются отрицательными. Оценку можно
                дополнить при повторном визите.
              </Text>
            </VStack>
          </InterfaceRegion>
          {record.notes && (
            <InterfaceRegion>
              <VStack gap={3}>
                <Heading level={2}>Примечание к случаю</Heading>
                <Text className="whitespace-pre-wrap break-words">
                  {record.notes}
                </Text>
              </VStack>
            </InterfaceRegion>
          )}
        </VStack>
      </Grid>
    </>
  );
}

export function HistoryView({
  items,
  loading,
  error,
  onRetry,
  onOpen,
  onNew,
}: {
  items: Assessment[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onOpen: (r: Assessment) => void;
  onNew: () => void;
}) {
  const columns: TableColumn<Assessment>[] = [
    {
      key: 'patient',
      header: 'Пациент / код оценки',
      width: proportional(2, { minWidth: 260 }),
      renderCell: (item) => (
        <VStack gap={1} align="start">
          <Link
            className="text-start"
            onClick={() => onOpen(item)}
            weight="semibold"
          >
            {patientName(item.patient) || item.code}
          </Link>
          {patientName(item.patient) && (
            <Text type="supporting">{item.code}</Text>
          )}
          {item.age !== '' && (
            <Text type="supporting">
              {item.patient.birthDate
                ? ageLabel(item.patient.birthDate, item.visit.date || undefined)
                : `${item.age} лет`}
            </Text>
          )}
        </VStack>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Изменено',
      width: proportional(1, { minWidth: 140 }),
      renderCell: (item) => (
        <VStack gap={1}>
          <Text>{new Date(item.updatedAt).toLocaleDateString('ru-RU')}</Text>
          <Text type="supporting">
            {new Date(item.updatedAt).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'score',
      header: 'Индекс',
      width: proportional(1, { minWidth: 140 }),
      renderCell: (item) => {
        const r = calculateAssessment(item);
        return r.scoringPending ? (
          <Text color="secondary">Ожидает утверждения</Text>
        ) : r.hasData ? (
          <Text hasTabularNumbers weight="semibold">
            {r.score}
            <Text color="secondary"> / 100</Text>
          </Text>
        ) : (
          <Text color="secondary">Нет данных</Text>
        );
      },
    },
    {
      key: 'coverage',
      header: 'Категории',
      width: proportional(1),
      renderCell: (item) => (
        <Text>{calculateAssessment(item).reviewed} из 8</Text>
      ),
    },
    {
      key: 'status',
      header: 'Статус',
      width: proportional(1),
      renderCell: (item) => (
        <Token
          label={item.status === 'draft' ? 'Черновик' : 'Завершена'}
          color={item.status === 'draft' ? 'gray' : 'green'}
          size="sm"
        />
      ),
    },
    {
      key: 'actions',
      header: <Text className="sr-only">Действия</Text>,
      width: pixel(56),
      renderCell: (item) => (
        <IconButton
          label={'Открыть ' + item.code}
          icon={<ArrowRight className="size-4" />}
          variant="ghost"
          onClick={() => onOpen(item)}
        />
      ),
    },
  ];
  return (
    <>
      <PageHeading
        title="История оценок"
        description="Возвращайтесь к сохранённым случаям и дополняйте клинические данные."
        actions={
          <Button
            label="Новая оценка"
            icon={<Plus className="size-4" />}
            variant="primary"
            onClick={onNew}
            size="lg"
          />
        }
      />
      <InterfaceRegion>
        <VStack gap={4}>
          <HStack justify="between" gap={3}>
            <Heading level={2}>Сохранённые случаи · {items.length}</Heading>
            <IconButton
              label="Обновить историю"
              icon={<RefreshCw className="size-4" />}
              onClick={onRetry}
              isDisabled={loading}
              isLoading={loading}
              variant="ghost"
            />
          </HStack>
          {error ? (
            <Banner
              status="error"
              title="История временно недоступна"
              description={error}
              collapsible={false}
              endContent={
                <Button label="Повторить попытку" onClick={onRetry} />
              }
            />
          ) : loading ? (
            <ProgressBar
              label="Загружаем сохранённые оценки…"
              isIndeterminate
            />
          ) : !items.length ? (
            <EmptyState
              title="Здесь будет история ваших оценок"
              description="Сохраните черновик или завершите первую оценку. Вы сможете вернуться к ней в любой момент."
              icon={<FileClock />}
              actions={
                <Button
                  label="Создать оценку"
                  icon={<Plus className="size-4" />}
                  variant="primary"
                  onClick={onNew}
                />
              }
            />
          ) : (
            <Section padding={0} className="relative overflow-x-auto">
              <Table
                data={items}
                columns={columns}
                idKey="id"
                density="balanced"
                dividers="rows"
                hasHover
                aria-label="Сохранённые оценки"
              />
            </Section>
          )}
        </VStack>
      </InterfaceRegion>
      <HStack gap={3} align="start">
        <ShieldCheck className="size-4 shrink-0 text-secondary" />
        <Text color="secondary">
          {browserStorageMode
            ? 'Оценки хранятся только в этом браузере и не синхронизируются между устройствами. Очистка данных сайта удалит историю.'
            : 'Сохранённые оценки доступны в закрытом пространстве. Откройте случай, чтобы просмотреть результат или дополнить данные.'}
        </Text>
      </HStack>
    </>
  );
}

export function MethodologyView({ onExample }: { onExample: () => void }) {
  return (
    <>
      <PageHeading
        title="Методология"
        description="Что учитывает GenCompass и как интерпретировать результат прототипа."
        actions={
          <Button
            label="Открыть учебный пример"
            icon={<BookOpen className="size-4" />}
            onClick={onExample}
            size="lg"
          />
        }
      />
      <Grid
        gap={8}
        align="start"
        className="grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]"
      >
        <VStack gap={5} className="min-w-0" maxWidth={720}>
          <InterfaceRegion>
            <VStack gap={4}>
              <Text type="supporting">01 / ПРИНЦИП</Text>
              <Heading level={2}>Признаки и клинический контекст</Heading>
              <Text>
                Новые оценки используют версию review-0.2. Числовой индекс не
                рассчитывается до клинического утверждения весов, модификаторов
                и порогов. Доступны выбранные признаки, предупреждения и
                направление.
              </Text>
              <Text>
                Кровнородство учитывается в сочетании с семейным анамнезом и не
                даёт самостоятельных баллов. Для регресса требуется наибольший
                вес; возможное усиление неврологических признаков
                резистентностью к лечению ещё рассматривается.
              </Text>
              <Text>
                Пол и дата рождения обязательны при завершении новой оценки.
                Возраст вычисляется на дату оценки и не заменяет возраст дебюта
                симптомов. Влияние пола и возраста на числовую формулу не
                утверждено.
              </Text>
              <Text>
                Неизвестный ответ и незаполненная категория не равны отсутствию
                признаков. Норма лабораторных показателей на момент исследования
                — отдельное состояние и не исключает метаболическое заболевание.
                Полнота данных показывается отдельно.
              </Text>
            </VStack>
          </InterfaceRegion>
          <InterfaceRegion>
            <VStack gap={4}>
              <Text type="supporting">02 / РАСЧЁТ</Text>
              <Heading level={2}>Архивная модель demo-0.1</Heading>
              <Text>
                Эта шкала сохраняется только для ранее созданных оценок
                demo-0.1. Внутри категории используется максимальный вес, затем
                вклады суммируются. Старые результаты не пересчитываются по
                новой модели.
              </Text>
              <Table
                density="balanced"
                dividers="rows"
                aria-label="Демонстрационные веса категорий"
              >
                <TableHeader>
                  <TableRow isHeaderRow>
                    <TableHeaderCell>Категория</TableHeaderCell>
                    <TableHeaderCell>Максимальный вклад</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>
                        <Text>{cat.title}</Text>
                      </TableCell>
                      <TableCell>
                        <Text hasTabularNumbers weight="medium">
                          до{' '}
                          {Math.max(
                            ...cat.criteria.map(
                              (criterion) => criterion.points,
                            ),
                          )}
                        </Text>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <HStack gap={3} wrap="wrap">
                <Token label="0–24 · низкий" color="green" />
                <Token label="25–49 · средний" color="yellow" />
                <Token label="50–100 · высокий" color="red" />
              </HStack>
              <Text color="secondary">
                Цветовые диапазоны относятся только к демо-индексу. Низкий
                результат не исключает заболевание и не отменяет клинически
                показанную консультацию.
              </Text>
            </VStack>
          </InterfaceRegion>
          <InterfaceRegion>
            <VStack gap={4}>
              <Text type="supporting">03 / ГРАНИЦЫ ПРИМЕНЕНИЯ</Text>
              <Heading level={2}>Поддержка профессионального решения</Heading>
              <Text>
                GenCompass структурирует признаки и готовит обоснование
                консультации. Диагноз, показания к обследованию и срочность
                помощи определяет врач.
              </Text>
              <Text>
                TIDE — диагностический протокол, а MPSE — отдельная
                исследовательская модель для новорождённых. Их веса и показатели
                эффективности не переносятся на этот чеклист.
              </Text>
              <Text>
                Эта версия предназначена для демонстрации на учебных случаях.
                Интеграция с МИС, клиническая валидация и хранение реальных
                медицинских данных не входят в прототип.
              </Text>
            </VStack>
          </InterfaceRegion>
        </VStack>
        <InterfaceRegion aria-label="Научная библиография">
          <VStack as="aside" gap={4} className="min-w-0">
            <HStack gap={3} align="center">
              <BookOpen className="size-5 shrink-0 text-secondary" />
              <Heading level={2}>Научная библиография</Heading>
            </HStack>
            <Text color="secondary">
              Источники описывают клинический контекст. Они не подтверждают
              числовые веса GenCompass.
            </Text>
            <Text type="supporting">
              Аннотации предоставлены автором ТЗ. Это 56 записей; часть
              исследований повторяется в нескольких категориях. Числовые веса
              ими не валидированы.
            </Text>
            {bibliography.map((category) => (
              <Section
                key={category.id}
                padding={0}
                paddingBlock={3}
                dividers={['bottom']}
              >
                <Collapsible defaultIsOpen={false} trigger={category.title}>
                  <VStack gap={4} paddingBlockStart={4}>
                    {category.entries.map((entry, index) => (
                      <VStack key={index} gap={2}>
                        {entry.sourceUrl ? (
                          <Link
                            href={entry.sourceUrl}
                            isExternalLink
                            newTabLabel="Открывается в новой вкладке"
                          >
                            {entry.citation}
                          </Link>
                        ) : (
                          <Text weight="medium">{entry.citation}</Text>
                        )}
                        <Text color="secondary">{entry.summary}</Text>
                      </VStack>
                    ))}
                  </VStack>
                </Collapsible>
              </Section>
            ))}
            <Heading level={3}>Справочные рекомендации</Heading>
            {sources.map((source, index) => (
              <Section
                key={source.id}
                padding={0}
                paddingBlock={4}
                dividers={['bottom']}
              >
                <VStack gap={3}>
                  <Text type="supporting">
                    [{index + 1}] {source.organization}
                    {source.year ? ` · ${source.year}` : ''}
                  </Text>
                  <Link
                    href={source.url}
                    isExternalLink
                    newTabLabel="Открывается в новой вкладке"
                  >
                    {source.title}
                  </Link>
                  <Text color="secondary">{source.description}</Text>
                </VStack>
              </Section>
            ))}
          </VStack>
        </InterfaceRegion>
      </Grid>
    </>
  );
}
