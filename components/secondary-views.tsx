'use client';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Download,
  ExternalLink,
  FileClock,
  FileText,
  Plus,
  Printer,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ScoreCard,
  Explainability,
  UrgentFlags,
} from '@/components/assessment';
import { patientName, ageLabel } from '@/lib/patient';
import { calculate, categories, sources, type Assessment } from '@/lib/model';

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
  const r = calculate(record.answers);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">РЕЗУЛЬТАТ И ОБОСНОВАНИЕ</div>
          <h1>Оценка клинических признаков</h1>
          <p>
            {patientName(record.patient) || record.code || 'Новый случай'} ·{' '}
            {r.known} из 8 категорий с известными данными
          </p>
        </div>
        <button className="button secondary" onClick={onEdit}>
          <ArrowLeft size={16} />
          Уточнить данные
        </button>
      </div>
      <div className="result-layout">
        <div>
          <ScoreCard record={record} final />
          <UrgentFlags record={record} />
          <section className="action-card panel">
            <div className="section-title">
              <FileText size={19} />
              <h2>Следующий шаг</h2>
            </div>
            <h3>
              {r.score >= 25
                ? 'Подготовьте обоснование консультации'
                : 'Сопоставьте результат с клинической картиной'}
            </h3>
            <p>
              Решение о консультации и её срочности принимает врач. Даже низкий
              демо-индекс не исключает генетическое заболевание.
            </p>
            <button
              className="button primary full"
              onClick={onRefer}
              disabled={!r.hasData}
            >
              Направить к генетику
              <ArrowRight size={16} />
            </button>
            <div className="export-buttons">
              <button onClick={onPrint}>
                <Printer size={16} />
                Печать / PDF
              </button>
              <button onClick={onExport}>
                <Download size={16} />
                Скачать TXT
              </button>
            </div>
          </section>
        </div>
        <div>
          <Explainability record={record} expanded />
          <section className="coverage-card panel">
            <div className="section-title">
              <ClipboardList size={18} />
              <h2>Полнота оценки</h2>
              <span>{r.reviewed}/8</span>
            </div>
            {categories.map((c) => {
              const a = record.answers[c.id];
              return (
                <div className="coverage-row" key={c.id}>
                  <span>{c.title}</span>
                  <b className={a && a.status !== 'unknown' ? 'known' : ''}>
                    {!a
                      ? 'Не заполнено'
                      : a.status === 'unknown'
                        ? 'Нет данных'
                        : a.status === 'none'
                          ? 'Не выявлены'
                          : 'Есть данные'}
                  </b>
                </div>
              );
            })}
            <p>
              Категории без данных не считаются отрицательными. Оценку можно
              дополнить при повторном визите.
            </p>
          </section>
          {record.notes && (
            <section className="notes-display panel">
              <h2>Примечание к случаю</h2>
              <p>{record.notes}</p>
            </section>
          )}
        </div>
      </div>
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
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ПОВТОРНЫЕ ВИЗИТЫ И УТОЧНЕНИЯ</div>
          <h1>История оценок</h1>
          <p>
            Возвращайтесь к сохранённым случаям и дополняйте клинические данные.
          </p>
        </div>
        <button className="button primary" onClick={onNew}>
          <Plus size={16} />
          Новая оценка
        </button>
      </div>
      <section className="history-panel panel">
        <div className="history-toolbar">
          <h2>
            Сохранённые случаи <span>{items.length}</span>
          </h2>
          <button
            className="icon-button"
            aria-label="Обновить историю"
            onClick={onRetry}
            disabled={loading}
          >
            <RefreshCw size={17} className={loading ? 'spinning' : ''} />
          </button>
        </div>
        {error ? (
          <div className="empty-state" role="alert">
            <FileClock size={32} />
            <h3>История временно недоступна</h3>
            <p>{error}</p>
            <button className="button secondary" onClick={onRetry}>
              Повторить попытку
            </button>
          </div>
        ) : loading ? (
          <output className="empty-state">
            <RefreshCw className="spinning" size={24} />
            <p>Загружаем сохранённые оценки…</p>
          </output>
        ) : !items.length ? (
          <div className="empty-state">
            <FileClock size={39} strokeWidth={1.3} />
            <h3>Здесь будет история ваших оценок</h3>
            <p>
              Сохраните черновик или завершите первую оценку.
              <br />
              Вы сможете вернуться к ней в любой момент.
            </p>
            <button className="button primary" onClick={onNew}>
              <Plus size={16} />
              Создать оценку
            </button>
          </div>
        ) : (
          <Table className="history-table">
            <TableHeader>
              <TableRow>
                <TableHead>Пациент / код оценки</TableHead>
                <TableHead>Изменено</TableHead>
                <TableHead>Демо-индекс</TableHead>
                <TableHead>Категории</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>
                  <span className="sr-only">Действия</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const r = calculate(item.answers);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <button
                        className="case-link"
                        onClick={() => onOpen(item)}
                      >
                        {patientName(item.patient) || item.code}
                      </button>
                      {patientName(item.patient) && <small>{item.code}</small>}
                      {item.age !== '' && (
                        <small>
                          {item.patient.birthDate
                            ? ageLabel(
                                item.patient.birthDate,
                                item.visit.date || undefined,
                              )
                            : item.age + ' лет'}
                        </small>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(item.updatedAt).toLocaleDateString('ru-RU')}
                      <small>
                        {new Date(item.updatedAt).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </small>
                    </TableCell>
                    <TableCell>
                      <span className={'table-score ' + r.zone}>
                        {r.hasData ? r.score : '—'}
                        <small>/100</small>
                      </span>
                    </TableCell>
                    <TableCell>{r.reviewed} из 8</TableCell>
                    <TableCell>
                      <span className={'status-badge ' + item.status}>
                        {item.status === 'draft' ? 'Черновик' : 'Завершена'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        className="icon-button"
                        onClick={() => onOpen(item)}
                        aria-label={'Открыть ' + item.code}
                      >
                        <ArrowRight size={17} />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>
      <div className="history-note">
        <ShieldCheck size={17} />
        <p>
          Сохранённые оценки доступны в закрытом пространстве. Откройте случай,
          чтобы просмотреть результат или дополнить данные.
        </p>
      </div>
    </>
  );
}
export function MethodologyView({ onExample }: { onExample: () => void }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ПРОЗРАЧНЫЙ ПРИНЦИП ОЦЕНКИ</div>
          <h1>Методология</h1>
          <p>
            Что учитывает GenCompass и как интерпретировать результат прототипа.
          </p>
        </div>
        <button className="button secondary" onClick={onExample}>
          <BookOpen size={16} />
          Открыть учебный пример
        </button>
      </div>
      <div className="method-layout">
        <div>
          <section className="method-card panel">
            <span className="method-index">01 / ПРИНЦИП</span>
            <h2>Каждый балл можно объяснить</h2>
            <p>
              Отмеченные клинические признаки объединены в восемь категорий. В
              каждой категории учитывается только наибольший вес выбранного
              признака. Затем вклады категорий суммируются.
            </p>
            <div className="formula">
              <span>Максимум в каждой категории</span>
              <Plus size={18} />
              <span>Сумма 8 вкладов</span>
              <ArrowRight size={18} />
              <strong>0–100 баллов</strong>
            </div>
            <p>
              Неизвестный ответ и незаполненная категория не равны отсутствию
              признаков. Поэтому рядом с индексом всегда показывается полнота
              данных.
            </p>
          </section>
          <section className="method-card panel">
            <span className="method-index">02 / МОДЕЛЬ DEMO-0.1</span>
            <h2>Клинические признаки. Демонстрационные веса.</h2>
            <p>
              В исходном PRD не задана утверждённая модель скоринга. Веса и
              пороги ниже созданы для проверки интерфейса. Они не валидированы и
              не показывают вероятность генетического заболевания.
            </p>
            <div className="weights-table">
              {categories.map((c) => (
                <div key={c.id}>
                  <span>{c.title}</span>
                  <strong>
                    до {Math.max(...c.criteria.map((x) => x.points))}
                  </strong>
                </div>
              ))}
            </div>
            <div className="range-key">
              <span>
                <i className="green" />
                0–24 · низкий
              </span>
              <span>
                <i className="amber" />
                25–49 · средний
              </span>
              <span>
                <i className="red" />
                50–100 · высокий
              </span>
            </div>
            <p className="method-caveat">
              Цветовые диапазоны относятся только к демо-индексу. Низкий
              результат не исключает заболевание и не отменяет клинически
              показанную консультацию.
            </p>
          </section>
          <section className="method-card panel">
            <span className="method-index">03 / ГРАНИЦЫ ПРИМЕНЕНИЯ</span>
            <h2>Поддержка профессионального решения</h2>
            <p>
              GenCompass структурирует признаки и готовит обоснование
              консультации. Диагноз, показания к обследованию и срочность помощи
              определяет врач.
            </p>
            <p>
              TIDE — диагностический протокол, а MPSE — отдельная
              исследовательская модель для новорождённых. Их веса и показатели
              эффективности не переносятся на этот чеклист.
            </p>
            <p>
              Эта версия предназначена для демонстрации на учебных случаях.
              Интеграция с МИС, клиническая валидация и хранение реальных
              медицинских данных не входят в прототип.
            </p>
          </section>
        </div>
        <aside className="bibliography panel">
          <div className="section-title">
            <BookOpen size={18} />
            <h2>Научная библиография</h2>
          </div>
          <p className="bibliography-intro">
            Источники описывают клинический контекст. Они не подтверждают
            числовые веса GenCompass.
          </p>
          {sources.map((s, i) => (
            <article key={s.id}>
              <span className="source-number">[{i + 1}]</span>
              <div>
                <div className="source-org">
                  {s.organization}
                  {s.year ? ' · ' + s.year : ''}
                </div>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                  <ExternalLink size={12} />
                </a>
                <p>{s.description}</p>
              </div>
            </article>
          ))}
        </aside>
      </div>
    </>
  );
}
