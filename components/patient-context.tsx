'use client';

import { Stethoscope, UserRound } from 'lucide-react';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { DateInput } from '@astryxdesign/core/DateInput';
import { Field } from '@astryxdesign/core/Field';
import { FormLayout } from '@astryxdesign/core/FormLayout';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { Selector } from '@astryxdesign/core/Selector';
import { TextInput } from '@astryxdesign/core/TextInput';
import { VStack } from '@astryxdesign/core/VStack';
import type { ISODateString } from '@astryxdesign/core/utils';
import { BirthDateInput } from '@/components/birth-date-input';
import { InterfaceRegion } from '@/components/workflow-ui';
import type { Assessment } from '@/lib/model';
import { ageAt, localDate, type Patient, type Visit } from '@/lib/patient';

type FormProps = {
  record: Assessment;
  onChange: (record: Assessment) => void;
  disabled?: boolean;
};

const iso = (date: string) => (date ? (date as ISODateString) : undefined);
const displayDate = (date: ISODateString) =>
  date.split('-').reverse().join('.');

function identitySummary(patient: Patient) {
  const initials = [patient.firstName, patient.middleName]
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => `${Array.from(name)[0]}.`)
    .join('');
  return (
    [patient.lastName.trim(), initials].filter(Boolean).join(' ') || 'не указан'
  );
}

export function PatientContext({
  record,
  onChange,
  disabled = false,
}: FormProps) {
  const { patient, visit } = record;
  const age = ageAt(patient.birthDate, visit.date || localDate());
  const hasClinicianProfile = Boolean(
    visit.clinician.trim() || visit.specialty.trim() || visit.clinic.trim(),
  );

  const changePatient = (field: keyof Patient, value: string) => {
    if (disabled) return;
    const next = { ...patient, [field]: value };
    const nextAge = ageAt(next.birthDate, visit.date || localDate());
    onChange({
      ...record,
      patient: next,
      age: nextAge ? String(nextAge.years) : '',
    });
  };
  const changeVisit = (field: keyof Visit, value: string) => {
    if (disabled) return;
    const next = { ...visit, [field]: value };
    const nextAge = ageAt(patient.birthDate, next.date || localDate());
    onChange({
      ...record,
      visit: next,
      age: nextAge ? String(nextAge.years) : '',
    });
  };

  return (
    <VStack gap={4}>
      <InterfaceRegion aria-labelledby="patient-heading">
        <VStack gap={4}>
          <HStack gap={3} align="center">
            <UserRound
              className="size-5 shrink-0 text-secondary"
              aria-hidden="true"
            />
            <Heading level={2} id="patient-heading">
              Данные пациента
            </Heading>
          </HStack>
          <FormLayout defaultOptionality="optional" className="gap-4">
            <Grid columns={{ minWidth: 220, max: 3 }} gap={4}>
              <BirthDateInput
                value={patient.birthDate || undefined}
                max={iso(visit.date || localDate())}
                onChange={(value) => changePatient('birthDate', value ?? '')}
                isRequired
                isDisabled={disabled}
              />
              <Selector
                label="Пол"
                value={patient.sex}
                onChange={(value) => changePatient('sex', value)}
                options={[
                  { value: 'female', label: 'Женский' },
                  { value: 'male', label: 'Мужской' },
                  { value: 'unknown', label: 'Не определён' },
                ]}
                placeholder="Выберите пол"
                isRequired
                isDisabled={disabled}
                size="lg"
                width="100%"
              />
              <TextInput
                label="Возраст, полных лет"
                labelTooltip="Рассчитан по дате рождения на дату оценки"
                value={age ? String(age.years) : ''}
                placeholder="По дате рождения"
                isReadOnly
                isDisabled={disabled}
                size="lg"
                width="100%"
              />
            </Grid>
            <Collapsible
              key={`identity-${record.id}`}
              trigger={`Пациент: ${identitySummary(patient)}`}
              defaultIsOpen={false}
              isDisabled={disabled}
            >
              <Grid columns={{ minWidth: 220, max: 2 }} gap={4}>
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
              </Grid>
            </Collapsible>
          </FormLayout>
        </VStack>
      </InterfaceRegion>
      <InterfaceRegion aria-labelledby="visit-heading">
        <VStack gap={4}>
          <HStack gap={3} align="center">
            <Stethoscope
              className="size-5 shrink-0 text-secondary"
              aria-hidden="true"
            />
            <Heading level={2} id="visit-heading">
              Данные приёма
            </Heading>
          </HStack>
          <FormLayout defaultOptionality="optional" className="gap-4">
            <TextInput
              label="Предварительный диагноз / причина оценки"
              placeholder="Диагноз, код МКБ или ведущий клинический синдром"
              value={visit.diagnosis}
              onChange={(value) =>
                changeVisit('diagnosis', value.slice(0, 500))
              }
              isRequired
              isDisabled={disabled}
              size="lg"
              width="100%"
            />
            <Collapsible
              key={`visit-${record.id}`}
              trigger="Показать дополнительные поля приёма"
              defaultIsOpen={!hasClinicianProfile}
              isDisabled={disabled}
            >
              <FormLayout defaultOptionality="optional" className="gap-4">
                <Grid columns={{ minWidth: 220, max: 2 }} gap={4}>
                  <DateInput
                    format={displayDate}
                    label="Дата оценки"
                    value={iso(visit.date)}
                    max={iso(localDate())}
                    onChange={(value) =>
                      changeVisit('date', value ?? localDate())
                    }
                    isDisabled={disabled}
                    size="lg"
                    width="100%"
                  />
                  <Field
                    label="Тип приёма"
                    inputID="visit-type"
                    isGroupLabel
                    isDisabled={disabled}
                  >
                    <SegmentedControl
                      id="visit-type"
                      label="Тип приёма"
                      value={visit.type}
                      onChange={(value) => changeVisit('type', value)}
                      isDisabled={disabled}
                      size="lg"
                      layout="fill"
                    >
                      <SegmentedControlItem value="initial" label="Первичный" />
                      <SegmentedControlItem
                        value="followup"
                        label="Повторный"
                      />
                    </SegmentedControl>
                  </Field>
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
                  onChange={(value) =>
                    changeVisit('clinic', value.slice(0, 180))
                  }
                  isDisabled={disabled}
                  size="lg"
                  width="100%"
                />
              </FormLayout>
            </Collapsible>
          </FormLayout>
        </VStack>
      </InterfaceRegion>
    </VStack>
  );
}
