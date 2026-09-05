'use client';
import { useState, type ReactNode } from 'react';
import {
  BookOpen,
  Code2,
  Compass,
  FileClock,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
  WandSparkles,
} from 'lucide-react';
import { AppShell as AstryxAppShell } from '@astryxdesign/core/AppShell';
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav';
import { Theme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { InternationalizationProvider } from '@astryxdesign/core/i18n';
import ru from '@astryxdesign/core/locales/ru-RU.json';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { LayerProvider } from '@astryxdesign/core/Layer';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { browserStorageMode } from '@/lib/persistence';

export type View = 'assessment' | 'result' | 'history' | 'methodology';

export function AppShell({
  children,
  view,
  onNavigate,
  onFillPreview,
  onRestorePreview,
  previewDisabled,
}: {
  children: ReactNode;
  view: View;
  onNavigate: (v: View) => void;
  onFillPreview: () => void;
  onRestorePreview?: () => void;
  previewDisabled: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const closeAndRun = (action: () => void) => {
    action();
    setMobileOpen(false);
  };
  return (
    <InternationalizationProvider locale="ru-RU" messages={{ 'ru-RU': ru }}>
      <Theme theme={neutralTheme} mode={mode}>
        <LayerProvider>
          <AstryxAppShell
            className="[&_.astryx-app-shell-header]:bg-surface [&_[role=main]]:bg-body"
            height="auto"
            variant="section"
            contentPadding={0}
            mobileNav={{
              breakpoint: 'md',
              isOpen: mobileOpen,
              onOpenChange: setMobileOpen,
            }}
            sideNav={
              <SideNav
                header={
                  <SideNavHeading
                    icon={<Compass />}
                    heading="GenCompass"
                    subheading="Клинический скрининг"
                  />
                }
                footer={
                  <VStack gap={6} padding={4}>
                    <VStack gap={3} aria-label="Dev tools">
                      <HStack gap={2}>
                        <Code2 className="size-4" />
                        <Text weight="semibold">Dev tools</Text>
                      </HStack>
                      <Text color="secondary">
                        Тестовые данные · все вопросы
                      </Text>
                      <Button
                        label="Заполнить всё"
                        icon={<WandSparkles className="size-4" />}
                        isDisabled={previewDisabled}
                        onClick={() => closeAndRun(onFillPreview)}
                      />
                      {onRestorePreview && (
                        <Button
                          label="Вернуть форму"
                          variant="ghost"
                          isDisabled={previewDisabled}
                          onClick={() => closeAndRun(onRestorePreview)}
                        />
                      )}
                    </VStack>
                    <VStack gap={2}>
                      <HStack gap={2}>
                        <StatusDot
                          variant="neutral"
                          label="Демонстрационный режим"
                        />
                        <Text type="supporting">
                          {browserStorageMode
                            ? 'Демо · данные в браузере'
                            : 'Демонстрационный режим'}
                        </Text>
                      </HStack>
                      <Text type="supporting">GenCompass · v0.1</Text>
                    </VStack>
                  </VStack>
                }
                footerIcons={
                  <IconButton
                    label={
                      mode === 'light'
                        ? 'Включить тёмную тему'
                        : 'Включить светлую тему'
                    }
                    tooltip={
                      mode === 'light'
                        ? 'Включить тёмную тему'
                        : 'Включить светлую тему'
                    }
                    icon={
                      mode === 'light' ? (
                        <Moon className="size-4" />
                      ) : (
                        <Sun className="size-4" />
                      )
                    }
                    variant="ghost"
                    onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
                  />
                }
              >
                <SideNavSection title="Рабочее пространство">
                  {(
                    [
                      { id: 'assessment', label: 'Новая оценка', Icon: Plus },
                      {
                        id: 'history',
                        label: 'История оценок',
                        Icon: FileClock,
                      },
                      {
                        id: 'methodology',
                        label: 'Методология',
                        Icon: BookOpen,
                      },
                    ] as const
                  ).map(({ id, label, Icon }) => (
                    <SideNavItem
                      key={id}
                      label={label}
                      icon={<Icon />}
                      isSelected={
                        view === id ||
                        (view === 'result' && id === 'assessment')
                      }
                      isDisabled={previewDisabled}
                      onClick={() => closeAndRun(() => onNavigate(id))}
                    />
                  ))}
                </SideNavSection>
              </SideNav>
            }
          >
            <VStack
              id="main-content"
              tabIndex={-1}
              gap={6}
              className="min-w-0 w-full mx-auto px-4 py-6 md:px-8 md:py-8"
              maxWidth={1440}
            >
              {children}
              <Section
                variant="transparent"
                dividers={['top']}
                paddingBlock={5}
                paddingInline={0}
              >
                <HStack gap={3} wrap="wrap" justify="between">
                  <Text type="supporting">
                    GenCompass · Для специалистов здравоохранения
                  </Text>
                  <HStack gap={2}>
                    <ShieldCheck className="size-4 text-secondary" />
                    <Text type="supporting">
                      Поддержка клинического решения
                    </Text>
                  </HStack>
                </HStack>
              </Section>
            </VStack>
          </AstryxAppShell>
        </LayerProvider>
      </Theme>
    </InternationalizationProvider>
  );
}
