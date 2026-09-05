'use client';
import { useState, type ReactNode } from 'react';
import {
  BookOpen,
  Code2,
  Compass,
  FileClock,
  Moon,
  Plus,
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
import { gencompassNeutralTheme } from '@/lib/generated/gencompass-neutral.js';
import { InternationalizationProvider } from '@astryxdesign/core/i18n';
import ru from '@astryxdesign/core/locales/ru-RU.json';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { LayerProvider } from '@astryxdesign/core/Layer';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';

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
      <Theme theme={gencompassNeutralTheme} mode={mode}>
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
                    icon={<Compass className="size-6 md:size-8" />}
                    heading="GenCompass"
                    subheading="КЛИНИЧЕСКИЙ СКРИНИНГ"
                    className="md:px-4 md:py-8"
                  />
                }
                footer={
                  <VStack gap={3} padding={4}>
                    <VStack
                      gap={3}
                      aria-label="Dev tools"
                      className="rounded-lg border border-dashed border-border p-3"
                    >
                      <HStack gap={2}>
                        <Code2 className="size-4" />
                        <Text weight="semibold">Dev tools</Text>
                      </HStack>
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
                <SideNavSection title="Рабочее пространство" isHeaderHidden>
                  <VStack gap={1}>
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
                        icon={<Icon className="size-5" />}
                        isSelected={
                          view === id ||
                          (view === 'result' && id === 'assessment')
                        }
                        isDisabled={previewDisabled}
                        onClick={() => closeAndRun(() => onNavigate(id))}
                      />
                    ))}
                  </VStack>
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
            </VStack>
          </AstryxAppShell>
        </LayerProvider>
      </Theme>
    </InternationalizationProvider>
  );
}
