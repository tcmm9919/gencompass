'use client';
import {
  BookOpen,
  ChevronRight,
  Code2,
  Compass,
  FileClock,
  Plus,
  ShieldCheck,
  Stethoscope,
  WandSparkles,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { browserStorageMode } from '@/lib/persistence';
export type View = 'assessment' | 'result' | 'history' | 'methodology';
const names = {
  assessment: 'Новая оценка',
  result: 'Результат оценки',
  history: 'История оценок',
  methodology: 'Методология',
};
function Navigation({
  view,
  onNavigate,
}: {
  view: View;
  onNavigate: (v: View) => void;
}) {
  const { setOpenMobile } = useSidebar();
  return (
    <nav aria-label="Основная навигация">
      {(
        [
          { id: 'assessment', label: 'Новая оценка', Icon: Plus },
          { id: 'history', label: 'История оценок', Icon: FileClock },
          { id: 'methodology', label: 'Методология', Icon: BookOpen },
        ] as const
      ).map(({ id, label, Icon }) => (
        <button
          key={id}
          className={
            'nav-item ' +
            (view === id || (view === 'result' && id === 'assessment')
              ? 'active'
              : '')
          }
          aria-current={view === id ? 'page' : undefined}
          onClick={() => {
            onNavigate(id);
            setOpenMobile(false);
          }}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}
    </nav>
  );
}
function DeveloperTools({
  onFill,
  onRestore,
  disabled,
}: {
  onFill: () => void;
  onRestore?: () => void;
  disabled: boolean;
}) {
  const { setOpenMobile } = useSidebar();
  return (
    <section className="developer-tools" aria-label="Dev tools">
      <div className="developer-tools-title">
        <Code2 size={16} />
        Dev tools
      </div>
      <p>Тестовые данные · все вопросы</p>
      <button
        className="button secondary"
        disabled={disabled}
        onClick={() => {
          onFill();
          setOpenMobile(false);
        }}
      >
        <WandSparkles size={16} />
        Заполнить всё
      </button>
      {onRestore && (
        <button
          className="developer-tools-restore"
          disabled={disabled}
          onClick={() => {
            onRestore();
            setOpenMobile(false);
          }}
        >
          Вернуть форму
        </button>
      )}
    </section>
  );
}
export function AppShell({
  children,
  view,
  onNavigate,
  onFillPreview,
  onRestorePreview,
  previewDisabled,
}: {
  children: React.ReactNode;
  view: View;
  onNavigate: (v: View) => void;
  onFillPreview: () => void;
  onRestorePreview?: () => void;
  previewDisabled: boolean;
}) {
  return (
    <SidebarProvider
      style={{ '--sidebar-width': '232px' } as React.CSSProperties}
    >
      <a className="skip-link" href="#main-content">
        К содержимому
      </a>
      <Sidebar className="app-sidebar">
        <SidebarHeader>
          <div className="brand">
            <Compass size={32} strokeWidth={1.7} />
            <div>
              GenCompass<small>КЛИНИЧЕСКИЙ СКРИНИНГ</small>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="nav-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>
          <Navigation view={view} onNavigate={onNavigate} />
          <DeveloperTools
            onFill={onFillPreview}
            onRestore={onRestorePreview}
            disabled={previewDisabled}
          />
          <div className="sidebar-note">
            <ShieldCheck size={21} />
            <p>
              От клинических признаков
              <br />к обоснованному решению
            </p>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="version">
            GenCompass <span>v0.1 · прототип</span>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumbs">
            <SidebarTrigger className="mobile-trigger" />
            <span>Рабочее пространство</span>
            <ChevronRight size={14} />
            <strong>{names[view]}</strong>
          </div>
          <div className="topbar-right">
            <span className="demo-badge">
              <span />
              {browserStorageMode
                ? 'Демо · данные в браузере'
                : 'Демонстрационный режим'}
            </span>
            <div className="avatar">
              <Stethoscope size={19} />
            </div>
          </div>
        </header>
        <main id="main-content" className="workspace">
          {children}
          <footer className="workspace-footer">
            <span>GenCompass · Lumen Genomics</span>
            <span>Для специалистов здравоохранения</span>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
}
