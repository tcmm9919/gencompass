'use client';
import {
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Compass,
  Info,
  ArrowRight,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
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

export function PatientContext({
  record,
  onChange,
}: {
  record: Assessment;
  onChange: (r: Assessment) => void;
}) {
  const patient = record.patient;
  const visit = record.visit;
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
    <>
      <section className="patient-card panel">
        <div className="section-title">
          <UserRound size={18} />
          <h2>Данные пациента</h2>
        </div>
        <div className="patient-fields patient-demographics">
          <label>
            Фамилия
            <input
              autoComplete="off"
              placeholder="Введите фамилию"
              maxLength={80}
              value={patient.lastName}
              onChange={(e) => changePatient('lastName', e.target.value)}
            />
          </label>
          <label>
            Имя
            <input
              autoComplete="off"
              placeholder="Введите имя"
              maxLength={80}
              value={patient.firstName}
              onChange={(e) => changePatient('firstName', e.target.value)}
            />
          </label>
          <label>
            Отчество
            <input
              autoComplete="off"
              placeholder="При наличии"
              maxLength={80}
              value={patient.middleName}
              onChange={(e) => changePatient('middleName', e.target.value)}
            />
          </label>
          <label>
            № медицинской карты
            <input
              placeholder="Номер карты пациента"
              maxLength={60}
              value={patient.recordNumber}
              onChange={(e) => changePatient('recordNumber', e.target.value)}
            />
          </label>
          <label>
            Дата рождения
            <input
              type="date"
              min="1906-01-01"
              max={visit.date || localDate()}
              value={patient.birthDate}
              onChange={(e) => changePatient('birthDate', e.target.value)}
              onInput={(e) => changePatient('birthDate', e.currentTarget.value)}
            />
          </label>
          <div className="field-control">
            <span id="sex-label">Пол</span>
            <Select
              value={patient.sex}
              onValueChange={(value) =>
                changePatient('sex', String(value ?? ''))
              }
            >
              <SelectTrigger
                aria-labelledby="sex-label"
                className="clinical-select"
              >
                <SelectValue>
                  {
                    (
                      {
                        '': 'Не указан',
                        female: 'Женский',
                        male: 'Мужской',
                        unknown: 'Не определён',
                      } as Record<string, string>
                    )[patient.sex]
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Не указан</SelectItem>
                <SelectItem value="female">Женский</SelectItem>
                <SelectItem value="male">Мужской</SelectItem>
                <SelectItem value="unknown">Не определён</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label>
            Возраст{' '}
            {patient.birthDate && (
              <span className="calculated-tag">Рассчитан по дате рождения</span>
            )}
            <input
              readOnly={!!patient.birthDate}
              type={patient.birthDate ? 'text' : 'number'}
              min="0"
              max="120"
              placeholder="Полных лет"
              value={
                patient.birthDate
                  ? ageLabel(patient.birthDate, visit.date || localDate())
                  : record.age
              }
              onChange={(e) => onChange({ ...record, age: e.target.value })}
            />
          </label>
          <label>
            Код оценки
            <input
              placeholder="Присваивается при сохранении"
              value={record.code}
              onChange={(e) => onChange({ ...record, code: e.target.value })}
              maxLength={40}
            />
          </label>
        </div>
      </section>
      <section className="patient-card encounter-card panel">
        <div className="section-title">
          <Stethoscope size={18} />
          <h2>Данные приёма</h2>
        </div>
        <div className="patient-fields">
          <label>
            Дата оценки
            <input
              type="date"
              max={localDate()}
              value={visit.date}
              onChange={(e) => changeVisit('date', e.target.value)}
              onInput={(e) => changeVisit('date', e.currentTarget.value)}
            />
          </label>
          <div className="field-control">
            <span id="visit-type-label">Тип приёма</span>
            <Select
              value={visit.type}
              onValueChange={(value) =>
                changeVisit('type', String(value ?? 'initial'))
              }
            >
              <SelectTrigger
                aria-labelledby="visit-type-label"
                className="clinical-select"
              >
                <SelectValue>
                  {visit.type === 'initial' ? 'Первичный' : 'Повторный'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initial">Первичный</SelectItem>
                <SelectItem value="followup">Повторный</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label>
            Лечащий врач
            <input
              autoComplete="off"
              placeholder="ФИО врача"
              maxLength={160}
              value={visit.clinician}
              onChange={(e) => changeVisit('clinician', e.target.value)}
            />
          </label>
          <label>
            Специальность
            <input
              placeholder="Например, педиатр"
              maxLength={100}
              value={visit.specialty}
              onChange={(e) => changeVisit('specialty', e.target.value)}
            />
          </label>
          <label className="wide-field">
            Медицинская организация
            <input
              placeholder="Название клиники или отделения"
              maxLength={180}
              value={visit.clinic}
              onChange={(e) => changeVisit('clinic', e.target.value)}
            />
          </label>
          <label className="wide-field">
            Предварительный диагноз / причина оценки
            <input
              placeholder="Диагноз, код МКБ или ведущий клинический синдром"
              maxLength={500}
              value={visit.diagnosis}
              onChange={(e) => changeVisit('diagnosis', e.target.value)}
            />
          </label>
        </div>
      </section>
    </>
  );
}
export function CriteriaForm({
  record,
  onChange,
}: {
  record: Assessment;
  onChange: (r: Assessment) => void;
}) {
  const result = calculate(record.answers);
  const answer = (c: Category, id: string) =>
    onChange({ ...record, answers: toggleCriterion(record.answers, c, id) });
  return (
    <TooltipProvider delay={200}>
      <div className="criteria-heading">
        <h2>Клинические признаки</h2>
        <span>{result.reviewed} из 8 категорий</span>
      </div>
      <Progress
        value={(result.reviewed / 8) * 100}
        aria-label="Просмотрено категорий"
        locale="ru-RU"
        aria-valuetext={result.reviewed + ' из 8 категорий'}
        className="category-progress"
      />
      {categories.map((cat, index) => {
        const current = record.answers[cat.id];
        const count = current?.selected.length ?? 0;
        return (
          <section
            className="category panel question-section"
            key={cat.id}
            aria-labelledby={'heading-' + cat.id}
          >
            <div className="category-header">
              <span
                className={'category-number ' + (current ? 'reviewed' : '')}
              >
                {current ? (
                  <Check size={15} />
                ) : (
                  String(index + 1).padStart(2, '0')
                )}
              </span>
              <div>
                <h3 id={'heading-' + cat.id}>{cat.title}</h3>
                <p>
                  {cat.mode === 'single'
                    ? 'Выберите один подходящий вариант'
                    : 'Отметьте все выявленные признаки'}
                </p>
              </div>
              {current && (
                <span className="category-status">
                  {current.status === 'none'
                    ? 'Не выявлены'
                    : current.status === 'unknown'
                      ? 'Нет данных'
                      : count + ' выбрано'}
                </span>
              )}
            </div>
            <div className="category-body">
              <p className="choice-hint">
                {cat.mode === 'multi'
                  ? 'Вклад категории — максимальный вес выбранного признака.'
                  : 'Варианты взаимоисключающие.'}
              </p>
              {cat.mode === 'single' ? (
                <RadioGroup
                  aria-label={cat.title}
                  value={current?.selected[0] ?? ''}
                  onValueChange={(id) => id && answer(cat, String(id))}
                  className="criterion-group"
                >
                  {cat.criteria.map((item) => (
                    <div
                      key={item.id}
                      className={
                        'criterion ' +
                        (current?.selected.includes(item.id) ? 'selected' : '')
                      }
                    >
                      <RadioGroupItem id={item.id} value={item.id} />
                      <label htmlFor={item.id}>{item.label}</label>
                      <Tooltip>
                        <TooltipTrigger
                          aria-label={'Определение: ' + item.label}
                          className="info-button"
                        >
                          <Info size={15} />
                        </TooltipTrigger>
                        <TooltipContent className="clinical-tooltip">
                          {item.description}
                        </TooltipContent>
                      </Tooltip>
                      <b>+{item.points}</b>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                cat.criteria.map((item) => (
                  <div
                    key={item.id}
                    className={
                      'criterion ' +
                      (current?.selected.includes(item.id) ? 'selected' : '')
                    }
                  >
                    <Checkbox
                      id={item.id}
                      checked={current?.selected.includes(item.id) ?? false}
                      onCheckedChange={() => answer(cat, item.id)}
                    />
                    <label htmlFor={item.id}>{item.label}</label>
                    <Tooltip>
                      <TooltipTrigger
                        aria-label={'Определение: ' + item.label}
                        className="info-button"
                      >
                        <Info size={15} />
                      </TooltipTrigger>
                      <TooltipContent className="clinical-tooltip">
                        {item.description}
                      </TooltipContent>
                    </Tooltip>
                    <b>+{item.points}</b>
                  </div>
                ))
              )}
              <div className="category-options">
                {(['none', 'unknown'] as const).map((status) => (
                  <button
                    key={status}
                    className={current?.status === status ? 'chosen' : ''}
                    aria-pressed={current?.status === status}
                    onClick={() =>
                      onChange({
                        ...record,
                        answers: {
                          ...record.answers,
                          [cat.id]: { status, selected: [] },
                        },
                      })
                    }
                  >
                    {current?.status === status && <Check size={12} />}{' '}
                    {status === 'none'
                      ? cat.id === 'onset'
                        ? 'Симптомы не выявлены'
                        : 'Признаки не выявлены'
                      : 'Данных недостаточно'}
                  </button>
                ))}
                {current && (
                  <button
                    className="reset-category"
                    onClick={() => {
                      const next = { ...record.answers };
                      delete next[cat.id];
                      onChange({ ...record, answers: next });
                    }}
                  >
                    Сбросить
                  </button>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </TooltipProvider>
  );
}

export function ScoreCard({
  record,
  onResult,
  final = false,
}: {
  record: Assessment;
  onResult?: () => void;
  final?: boolean;
}) {
  const r = calculate(record.answers);
  return (
    <section className="score-panel panel">
      <div className="score-heading">
        <Compass size={18} />
        <h2>{final ? 'Результат оценки' : 'Предварительный результат'}</h2>
        <span className="live-dot" />
      </div>
      <div
        className={'score-value' + (!r.hasData ? ' is-empty' : '')}
        aria-live="polite"
        aria-atomic="true"
      >
        {r.hasData ? r.score : 'Нет данных'}
        {r.hasData && <span>из 100</span>}
      </div>
      {r.hasData && (
        <div className={'score-state ' + r.zone}>{zoneNames[r.zone]}</div>
      )}
      <div
        className={'risk-track ' + (!r.hasData ? 'inactive' : '')}
        aria-label={
          'Демонстрационная шкала: ' +
          (r.hasData ? r.score + ' из 100' : 'нет данных')
        }
      >
        {r.hasData && <i style={{ left: r.score + '%' }} />}
      </div>
      <div className="risk-labels">
        <span>0–24 · Низкий</span>
        <span>25–49</span>
        <span>50–100 · Высокий</span>
      </div>
      <p className="score-description">
        {r.hasData
          ? 'Результат по известным данным: ' +
            r.known +
            ' из 8 категорий. Незаполненные категории не считаются отрицательным ответом.'
          : 'Отметьте клинические признаки. Результат обновляется по мере заполнения.'}
      </p>
      {onResult && (
        <button
          className="button primary full"
          onClick={onResult}
          disabled={!r.hasData}
        >
          Посмотреть результат
          <ArrowRight size={16} />
        </button>
      )}
      <p className="model-note">
        Демонстрационная модель · не валидирована.
        <br />
        Индекс не является вероятностью диагноза.
      </p>
    </section>
  );
}
export function Explainability({
  record,
  expanded = false,
}: {
  record: Assessment;
  expanded?: boolean;
}) {
  const r = calculate(record.answers);
  const items = r.contributions
    .filter((c) => c.selected.length)
    .sort((a, b) => b.points - a.points);
  return (
    <section className="explanation-card panel">
      <div className="section-title">
        <BookOpen size={18} />
        <h2>Что влияет на оценку</h2>
      </div>
      {!items.length ? (
        <div className="explanation-empty">
          <ClipboardList size={24} />
          <p>Здесь появятся выбранные признаки и их вклад в результат.</p>
        </div>
      ) : (
        <div className="contributions">
          {items.map((item) => (
            <details key={item.category.id} open={expanded || undefined}>
              <summary>
                <span>{item.category.title}</span>
                <b>+{item.points}</b>
                <ChevronDown size={14} />
              </summary>
              <div className="contribution-content">
                {item.selected.map((c) => (
                  <p key={c.id}>
                    {c.label} <span>(вес {c.points})</span>
                  </p>
                ))}
                <p className="contribution-rule">
                  Учитывается максимальный вес: {item.points} баллов.
                </p>
                {sources
                  .filter((s) => item.category.sourceIds.includes(s.id))
                  .map((s) => (
                    <a key={s.id} href={s.url} target="_blank" rel="noreferrer">
                      {s.organization} ↗
                    </a>
                  ))}
              </div>
            </details>
          ))}
        </div>
      )}
      <div className="explain-footer">
        <CircleHelp size={15} />
        <span>Источники описывают признаки, а не веса.</span>
      </div>
    </section>
  );
}
export function UrgentFlags({ record }: { record: Assessment }) {
  const r = calculate(record.answers);
  return r.urgent.length > 0 ? (
    <div className="urgent-flags">
      {r.urgent.map((c) => (
        <div key={c.id} className="urgent-note">
          <Info size={18} />
          <p>
            <strong>{c.label}</strong>
            {c.urgent?.split(' Источник:')[0]}{' '}
            <a
              href="https://www.rch.org.au/clinicalguide/guideline_index/Metabolic_Disorders/"
              target="_blank"
              rel="noreferrer"
            >
              Рекомендации RCH ↗
            </a>
          </p>
        </div>
      ))}
    </div>
  ) : null;
}
