import { categories, newAssessment, type Assessment } from './model';
import { ageAt } from './patient';

export function fullPreviewAssessment(): Assessment {
  const demo = newAssessment();
  demo.code = 'GC-DEMO-FULL';
  demo.patient = {
    lastName: 'Иванова',
    firstName: 'Анна',
    middleName: 'Сергеевна',
    birthDate: '2019-04-12',
    sex: 'female',
    recordNumber: 'DEMO-001',
  };
  demo.age = String(ageAt(demo.patient.birthDate, demo.visit.date)!.years);
  demo.visit = {
    ...demo.visit,
    type: 'initial',
    clinician: 'Петрова Мария Александровна',
    specialty: 'Педиатр',
    clinic: 'Демонстрационная клиника',
    diagnosis: 'Задержка развития. Множественные врождённые особенности.',
  };
  demo.notes =
    'Тестовый случай для просмотра интерфейса. Все данные вымышлены. Выбраны признаки во всех категориях.';
  demo.answers = Object.fromEntries(
    categories.map((category) => [
      category.id,
      {
        status: 'selected',
        selected:
          category.mode === 'single'
            ? [
                category.criteria.reduce((a, b) =>
                  a.points >= b.points ? a : b,
                ).id,
              ]
            : category.criteria.map((criterion) => criterion.id),
      },
    ]),
  );
  return demo;
}
