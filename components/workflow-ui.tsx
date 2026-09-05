'use client';
import type { ComponentProps, ReactNode } from 'react';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Section } from '@astryxdesign/core/Section';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Stepper, Step } from '@astryxdesign/core/Stepper';

export function InterfaceRegion({
  children,
  className = '',
  ...props
}: Pick<
  ComponentProps<typeof Section>,
  'children' | 'className' | 'aria-label' | 'aria-labelledby'
>) {
  return (
    <Section
      {...props}
      variant="transparent"
      padding={0}
      className={`relative min-w-0 rounded-lg border border-border bg-surface p-4 sm:p-6 ${className}`}
    >
      {children}
    </Section>
  );
}

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
      <VStack gap={1} className="min-w-0" maxWidth={640}>
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
      variant="transparent"
      padding={0}
      className="sticky top-12 md:top-0 z-20 border-b border-border bg-body py-4 [&_.astryx-step>div:last-child]:px-0"
    >
      <HStack gap={5} justify="between" className="min-w-0">
        <Stepper
          activeStep={active}
          density="compact"
          label="Этапы оценки"
          className="min-w-0 w-full justify-between gap-2 lg:hidden"
        >
          <Step step={0} label="Признаки" indicator="number" />
          <Step step={1} label="Результат" indicator="number" />
          <Step step={2} label="Направление" indicator="number" />
        </Stepper>
        <Stepper
          activeStep={active}
          density="compact"
          label="Этапы оценки"
          className="hidden min-w-0 gap-4 lg:flex"
        >
          <Step
            step={0}
            label="Клинические признаки"
            indicator="number"
            endContent={
              <ChevronRight
                className="size-4 ml-3 text-secondary"
                aria-hidden="true"
              />
            }
          />
          <Step
            step={1}
            label="Результат и обоснование"
            indicator="number"
            endContent={
              <ChevronRight
                className="size-4 ml-3 text-secondary"
                aria-hidden="true"
              />
            }
          />
          <Step step={2} label="Направление" indicator="number" />
        </Stepper>
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
