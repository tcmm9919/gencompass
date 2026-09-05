import { patientName, ageLabel } from './patient';
import {
  calculate,
  categories,
  sources,
  type Assessment,
  zoneNames,
} from './model';
export function reportText(record: Assessment, referral = false, comment = '') {
  const r = calculate(record.answers);
  const ids = new Set(
    r.contributions
      .filter((c) => c.selected.length)
      .flatMap((c) => c.category.sourceIds),
  );
  return [
    referral ? 'ШАБЛОН НАПРАВЛЕНИЯ К ГЕНЕТИКУ' : 'РЕЗУЛЬТАТ ОЦЕНКИ GENCOMPASS',
    'Lumen Genomics · Демонстрационный прототип',
    '',
    'ВНИМАНИЕ: учебный пример. Баллы и пороги не валидированы для клинических решений. Не является диагнозом или вероятностью заболевания.',
    '',
    'Пациент: ' + (patientName(record.patient) || 'Не указан'),
    'Дата рождения: ' + (record.patient.birthDate || 'Не указана'),
    'Пол: ' +
      {
        female: 'Женский',
        male: 'Мужской',
        unknown: 'Не определён',
        '': 'Не указан',
      }[record.patient.sex],
    '№ медицинской карты: ' + (record.patient.recordNumber || 'Не указан'),
    'Дата оценки: ' + (record.visit.date || 'Не указана'),
    'Тип приёма: ' +
      (record.visit.type === 'initial' ? 'Первичный' : 'Повторный'),
    'Врач: ' + (record.visit.clinician || 'Не указан'),
    'Специальность: ' + (record.visit.specialty || 'Не указана'),
    'Медицинская организация: ' + (record.visit.clinic || 'Не указана'),
    'Предварительный диагноз / причина оценки: ' +
      (record.visit.diagnosis || 'Не указаны'),
    '',
    'Код случая: ' + (record.code || 'Не указан'),
    'Возраст: ' +
      (record.patient.birthDate
        ? ageLabel(record.patient.birthDate, record.visit.date || undefined)
        : record.age === ''
          ? 'Не указан'
          : record.age + ' лет'),
    'Дата формирования: ' + new Date().toLocaleDateString('ru-RU'),
    'Модель: demo-0.1',
    'Демо-индекс: ' +
      (r.hasData
        ? r.score + '/100 · ' + zoneNames[r.zone]
        : 'Недостаточно данных'),
    'Известные данные: ' +
      r.known +
      ' из 8 категорий; просмотрено: ' +
      r.reviewed +
      ' из 8.',
    '',
    'КЛИНИЧЕСКИЕ ПРИЗНАКИ',
    ...categories.map((c) => {
      const item = r.contributions.find((x) => x.category.id === c.id)!;
      const a = record.answers[c.id];
      return (
        c.title +
        ': ' +
        (!a
          ? 'Не заполнено'
          : a.status === 'unknown'
            ? 'Данных недостаточно'
            : a.status === 'none'
              ? 'Признаки не выявлены'
              : item.selected
                  .map((s) => s.label + ' (демовес ' + s.points + ')')
                  .join('; ') +
                '; вклад категории ' +
                item.points)
      );
    }),
    '',
    'Вклады внутри категории не суммируются: используется максимальный выбранный вес. Пороги 25/50 — демонстрационные. Незаполненное и неизвестное не равно отсутствию признаков.',
    ...r.urgent.map((c) => 'КЛИНИЧЕСКОЕ ПРИМЕЧАНИЕ: ' + c.urgent),
    ...(record.notes ? ['', 'Примечание к случаю: ' + record.notes] : []),
    ...(referral
      ? [
          '',
          'ЦЕЛЬ КОНСУЛЬТАЦИИ',
          'Оценка возможной генетической этиологии с учётом перечисленных клинических признаков. Показания и срочность направления определяются лечащим врачом независимо от демо-индекса.',
          ...(comment ? ['Дополнения врача: ' + comment] : []),
          '',
          'Врач: ' +
            (record.visit.clinician || '____________________') +
            '    Подпись: ____________________',
        ]
      : []),
    '',
    'ИСТОЧНИКИ (подтверждают контекст признаков, не веса)',
    ...sources
      .filter((s) => ids.has(s.id))
      .map((s) => s.organization + '. ' + s.title + '. ' + s.url),
    '',
    'GenCompass не заменяет клиническое решение и консультацию генетика.',
  ].join('\n');
}
export function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(
    new Blob(['\ufeff' + text], { type: 'text/plain;charset=utf-8' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
