'use client';
import type { ReactNode } from 'react';
import { Clock3, ShieldCheck } from 'lucide-react';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Section } from '@astryxdesign/core/Section';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Stepper, Step } from '@astryxdesign/core/Stepper';

export function PageHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <HStack
      gap={5}
      align="start"
      justify="between"
      wrap="wrap"
      className="pt-6 md:pt-0"
    >
      <VStack gap={3} className="min-w-0" maxWidth={640}>
        <Heading level={1}>{title}</Heading>
        <Text color="secondary">{description}</Text>
      </VStack>
      {actions}
    </HStack>
  );
}

export function WorkflowSteps({ active = 0 }: { active?: number }) {
  return (
    <Section
      paddingBlock={4}
      paddingInline={0}
      dividers={['bottom']}
      className="sticky top-12 md:top-0 z-20 bg-surface"
    >
      <HStack gap={5} justify="between" className="min-w-0">
        <Stepper
          activeStep={active}
          density="compact"
          label="Этапы оценки"
          className="min-w-0 flex-1 md:hidden"
        >
          <Step step={0} label="Признаки" indicator="none" />
          <Step step={1} label="Результат" indicator="none" />
          <Step step={2} label="Направление" indicator="none" />
        </Stepper>
        <Stepper
          activeStep={active}
          density="compact"
          label="Этапы оценки"
          className="hidden min-w-0 flex-1 md:flex"
        >
          <Step step={0} label="Клинические признаки" />
          <Step step={1} label="Результат и обоснование" />
          <Step step={2} label="Направление" />
        </Stepper>
        <HStack gap={2} className="hidden xl:flex shrink-0 text-secondary">
          <Clock3 className="size-4" />
          <Text type="supporting">3–5 минут</Text>
        </HStack>
      </HStack>
    </Section>
  );
}

export function ClinicalNote() {
  return (
    <HStack gap={3} align="start">
      <ShieldCheck className="size-4 shrink-0 text-secondary" />
      <Text color="secondary">
        Инструмент не ставит диагноз и не заменяет консультацию генетика.
      </Text>
    </HStack>
  );
}
