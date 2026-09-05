'use client';
/* eslint-disable react/react-compiler -- Browser draft restoration intentionally synchronizes session storage and URL state after SSR. */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Info,
  LoaderCircle,
  Save,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AppShell, type View } from '@/components/app-shell';
import {
  PatientContext,
  CriteriaForm,
  ScoreCard,
  Explainability,
  UrgentFlags,
} from '@/components/assessment';
import {
  HistoryView,
  ResultView,
  MethodologyView,
} from '@/components/secondary-views';
import { ReferralDialog } from '@/components/referral';
import {
  calculate,
  newAssessment,
  type Assessment,
  type Answers,
} from '@/lib/model';
import { validateAssessment } from '@/lib/validation';
import { reportText, downloadText } from '@/lib/report';
import { emptyPatient, emptyVisit } from '@/lib/patient';
import { registerClinicalTools } from '@/lib/webmcp';
import { fullPreviewAssessment } from '@/lib/demo';
import { loadSavedAssessments, persistAssessment } from '@/lib/persistence';
const initial: Assessment = {
  id: '',
  code: '',
  age: '',
  notes: '',
  patient: { ...emptyPatient },
  visit: { ...emptyVisit },
  answers: {},
  status: 'draft',
  updatedAt: '',
  modelVersion: 'demo-0.1',
};
const stashKey = 'gencompass-temporary-draft-v1';
const signature = (r: Assessment) =>
  JSON.stringify([r.id, r.code, r.age, r.notes, r.patient, r.visit, r.answers]);
type PreviewBackup = {
  record: Assessment;
  baseline: string;
  previewId?: string;
};

export default function Home() {
  const [view, setView] = useState<View>('assessment');
  const [storedRecord, setRecord] = useState<Assessment>(initial);
  const record = useMemo(
    () => ({
      ...storedRecord,
      patient: storedRecord.patient ?? { ...emptyPatient },
      visit: storedRecord.visit ?? { ...emptyVisit },
    }),
    [storedRecord],
  );
  const [ready, setReady] = useState(false);
  const [baseline, setBaseline] = useState('');
  const [previewBackup, setPreviewBackup] = useState<PreviewBackup | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [history, setHistory] = useState<Assessment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [referral, setReferral] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const [printContent, setPrintContent] = useState('');
  const stateRef = useRef(record);
  const busyRef = useRef(false);
  useLayoutEffect(() => {
    stateRef.current = record;
  }, [record]);
  const dirty = ready && signature(record) !== baseline;
  const backupDirty =
    previewBackup !== null &&
    signature(previewBackup.record) !== previewBackup.baseline;
  const r = calculate(record.answers);
  const go = useCallback((v: View) => {
    setView(v);
    historyReplace(v);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  useEffect(() => {
    let draft = newAssessment();
    let clean = signature(draft);
    try {
      const saved = sessionStorage.getItem(stashKey);
      if (saved) {
        const stored = JSON.parse(saved);
        draft = validateAssessment(stored.record, { recoverDraft: true });
        try {
          validateAssessment(draft);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : 'Проверьте восстановленные данные.',
          );
        }
        clean = typeof stored.baseline === 'string' ? stored.baseline : '';
        if (stored.previewBackup) {
          try {
            setPreviewBackup({
              previewId:
                typeof stored.previewBackup.previewId === 'string'
                  ? stored.previewBackup.previewId
                  : undefined,
              record: validateAssessment(stored.previewBackup.record, {
                recoverDraft: true,
              }),
              baseline:
                typeof stored.previewBackup.baseline === 'string'
                  ? stored.previewBackup.baseline
                  : '',
            });
          } catch {
            // Keep a usable draft even if an older preview backup is invalid.
          }
        }
        setNotice('Восстановлен незавершённый ввод.');
      }
    } catch {
      setNotice(
        'Не удалось восстановить временный черновик. Создана новая оценка.',
      );
    }
    setRecord(draft);
    setBaseline(clean);
    setReady(true);
    const readHash = () => {
      const hash = location.hash.slice(1);
      if (['assessment', 'history', 'methodology', 'result'].includes(hash))
        setView(
          hash === 'result' &&
            !calculate((stateRef.current.id ? stateRef.current : draft).answers)
              .hasData
            ? 'assessment'
            : (hash as View),
        );
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(
        stashKey,
        JSON.stringify({ record, baseline, previewBackup }),
      );
    } catch {
      setNotice(
        'Временный ввод не сохранён на устройстве. Используйте «Сохранить черновик».',
      );
    }
  }, [record, baseline, previewBackup, ready]);
  useEffect(() => {
    if (!dirty && !backupDirty) return;
    const leave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [dirty, backupDirty]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 6000);
    return () => clearTimeout(t);
  }, [notice]);
  const update = (next: Assessment) => {
    setRecord({ ...next, status: 'draft' });
    setError('');
  };
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      setHistory(await loadSavedAssessments());
    } catch (e) {
      setHistoryError(
        e instanceof Error
          ? e.message
          : 'Проверьте соединение и попробуйте снова.',
      );
    } finally {
      setHistoryLoading(false);
    }
  }, []);
  useEffect(() => {
    if (view === 'history') void loadHistory();
  }, [view, loadHistory]);
  async function save(status: 'draft' | 'complete') {
    if (busyRef.current) return false;
    const rawSignature = signature(stateRef.current);
    let outgoing: Assessment;
    try {
      outgoing = validateAssessment({ ...stateRef.current, status });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Проверьте введённые данные.');
      return false;
    }
    busyRef.current = true;
    setSaving(true);
    setError('');
    try {
      const saved = await persistAssessment(outgoing);
      if (signature(stateRef.current) !== rawSignature) return false;
      setRecord(saved);
      setBaseline(signature(saved));
      setNotice(
        status === 'draft'
          ? 'Черновик сохранён. Он доступен в истории оценок.'
          : 'Оценка сохранена в истории.',
      );
      return true;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Не удалось сохранить. Проверьте соединение.',
      );
      return false;
    } finally {
      busyRef.current = false;
      setSaving(false);
    }
  }
  async function showResult() {
    if (!r.hasData) return;
    if (await save('complete')) go('result');
  }
  function activate(next: Assessment) {
    setRecord(next);
    setBaseline(signature(next));
    setError('');
    setPending(null);
    go(next.status === 'complete' ? 'result' : 'assessment');
  }
  function requestOpen(next: Assessment) {
    if (busyRef.current) return;
    if (dirty) setPending(() => () => activate(next));
    else activate(next);
  }
  function fillPreview() {
    if (!ready || busyRef.current) return;
    const demo = fullPreviewAssessment();
    const apply = () => {
      setPreviewBackup((current) => ({
        ...(current ?? { record: stateRef.current, baseline }),
        previewId: demo.id,
      }));
      setRecord(demo);
      setBaseline('');
      setPending(null);
      setError('');
      setNotice('Заполнены тестовые данные и все 8 категорий.');
      go('assessment');
    };
    if (previewBackup && previewBackup.previewId !== record.id && dirty)
      setPending(() => apply);
    else apply();
  }
  function restorePreview() {
    if (!ready || !previewBackup || busyRef.current) return;
    const apply = () => {
      setRecord(previewBackup.record);
      setBaseline(previewBackup.baseline);
      setPreviewBackup(null);
      setPending(null);
      setError('');
      setNotice('Восстановлена форма до автозаполнения.');
      go('assessment');
    };
    if (previewBackup.previewId !== record.id && dirty) setPending(() => apply);
    else apply();
  }
  function openExample() {
    const demo = newAssessment();
    demo.code = 'GC-DEMO-01';
    demo.age = '4';
    demo.notes =
      'Учебный случай: задержка развития, сочетание врождённых особенностей и семейный анамнез.';
    demo.answers = {
      onset: { status: 'selected', selected: ['onset-infancy'] },
      family: { status: 'selected', selected: ['family-similar'] },
      consanguinity: { status: 'none', selected: [] },
      multisystem: { status: 'selected', selected: ['multisystem-two'] },
      dysmorphology: {
        status: 'selected',
        selected: ['dysmorphology-congenital'],
      },
      neurodevelopment: {
        status: 'selected',
        selected: ['neurodevelopment-delay'],
      },
      treatment: { status: 'unknown', selected: [] },
      laboratory: { status: 'none', selected: [] },
    };
    requestOpen(demo);
  }
  function print(text: string) {
    flushSync(() => setPrintContent(text));
    window.print();
  }
  useEffect(
    () =>
      registerClinicalTools(
        () => stateRef.current,
        (answers: Answers) => {
          if (busyRef.current) throw new Error('Сохранение ещё выполняется.');
          flushSync(() => {
            setRecord((current) => ({ ...current, answers, status: 'draft' }));
            setView('assessment');
          });
        },
      ),
    [],
  );
  return (
    <>
      <AppShell
        view={view}
        onFillPreview={fillPreview}
        onRestorePreview={previewBackup ? restorePreview : undefined}
        previewDisabled={saving || !ready}
        onNavigate={(v) => {
          if (busyRef.current) return;
          if (v === 'assessment') requestOpen(newAssessment());
          else go(v);
        }}
      >
        {notice && (
          <output className="toast-message">
            <Check size={17} />
            <span>{notice}</span>
            <button
              aria-label="Закрыть уведомление"
              onClick={() => setNotice('')}
            >
              <X size={15} />
            </button>
          </output>
        )}
        {error && (
          <div className="save-error" role="alert">
            <Info size={18} />
            <span>{error}</span>
            <button aria-label="Закрыть ошибку" onClick={() => setError('')}>
              <X size={16} />
            </button>
          </div>
        )}
        {view === 'assessment' && (
          <>
            <div className="page-heading">
              <div>
                <div className="eyebrow">ОТ ПРИЗНАКОВ К РЕШЕНИЮ</div>
                <h1>
                  {record.updatedAt && record.code
                    ? 'Уточнение оценки'
                    : 'Новая оценка'}
                </h1>
                <p>
                  Оцените клинические признаки, чтобы обосновать консультацию
                  генетика.
                </p>
              </div>
              <div className="save-area">
                <button
                  className="button secondary"
                  onClick={() => void save('draft')}
                  disabled={saving || !ready}
                >
                  {saving ? (
                    <LoaderCircle size={16} className="spinning" />
                  ) : (
                    <Save size={16} />
                  )}
                  Сохранить черновик
                </button>
                <small>
                  {dirty
                    ? 'Есть несохранённые изменения'
                    : record.updatedAt && record.code
                      ? 'Сохранено в истории'
                      : 'Можно заполнить частично'}
                </small>
              </div>
            </div>
            <div className="workflow">
              <div className="step current">
                <span>01</span>Клинические признаки
              </div>
              <ChevronRight size={15} />
              <div className="step">
                <span>02</span>Результат и обоснование
              </div>
              <ChevronRight size={15} />
              <div className="step">
                <span>03</span>Направление
              </div>
              <div className="time-estimate">
                <Clock3 size={15} />
                3–5 минут
              </div>
            </div>
            <fieldset className="assessment-grid" disabled={saving || !ready}>
              <div>
                <PatientContext record={record} onChange={update} />
                <CriteriaForm record={record} onChange={update} />
                <section className="case-notes panel">
                  <label htmlFor="case-notes">
                    Примечание к случаю <span>Необязательно</span>
                  </label>
                  <textarea
                    id="case-notes"
                    value={record.notes}
                    onChange={(e) =>
                      update({ ...record, notes: e.target.value })
                    }
                    maxLength={2000}
                    placeholder="Жалобы, анамнез и дополнительные клинические сведения…"
                    rows={3}
                  />
                  <small>
                    Дополнительные сведения будут включены в результат и
                    направление.
                  </small>
                </section>
                <div className="assessment-actions">
                  <span>{r.known} из 8 категорий с известными данными</span>
                  <button
                    className="button primary"
                    onClick={() => void showResult()}
                    disabled={!r.hasData || saving}
                  >
                    Посмотреть результат
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
              <aside className="result-column">
                <ScoreCard record={record} onResult={() => void showResult()} />
                <UrgentFlags record={record} />
                <Explainability record={record} />
                <div className="clinical-note">
                  <ShieldCheck size={18} />
                  <p>
                    Инструмент не ставит диагноз и не заменяет консультацию
                    генетика.
                  </p>
                </div>
              </aside>
            </fieldset>
          </>
        )}
        {view === 'result' && (
          <ResultView
            record={record}
            onEdit={() => go('assessment')}
            onRefer={() => setReferral(true)}
            onPrint={() => print(reportText(record))}
            onExport={() =>
              downloadText(
                reportText(record),
                'GenCompass-' + (record.code || 'result') + '.txt',
              )
            }
          />
        )}
        {view === 'history' && (
          <HistoryView
            items={history}
            loading={historyLoading}
            error={historyError}
            onRetry={() => void loadHistory()}
            onOpen={requestOpen}
            onNew={() => requestOpen(newAssessment())}
          />
        )}
        {view === 'methodology' && <MethodologyView onExample={openExample} />}
        <ReferralDialog
          key={record.id}
          open={referral}
          onOpenChange={setReferral}
          record={record}
          onPrint={print}
        />
        <AlertDialog
          open={!!pending}
          onOpenChange={(open) => {
            if (!open) setPending(null);
          }}
        >
          <AlertDialogContent className="unsaved-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Сохранить текущую оценку?</AlertDialogTitle>
              <AlertDialogDescription>
                В текущем случае есть изменения. Сохраните их, чтобы вернуться к
                ним из истории.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <button
                className="button secondary"
                onClick={() => setPending(null)}
                disabled={saving}
              >
                Остаться
              </button>
              <button
                className="text-button"
                onClick={() => pending?.()}
                disabled={saving}
              >
                Не сохранять
              </button>
              <button
                className="button primary"
                disabled={saving}
                onClick={async () => {
                  const next = pending;
                  if (next && (await save('draft'))) next();
                }}
              >
                {saving ? 'Сохраняем…' : 'Сохранить'}
              </button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AppShell>
      <div id="print-output" className="print-view">
        <div className="print-brand">
          GenCompass <span>LUMEN GENOMICS</span>
        </div>
        <pre>{printContent}</pre>
      </div>
    </>
  );
}
function historyReplace(view: View) {
  if (location.hash !== '#' + view)
    window.history.pushState(null, '', '#' + view);
}
