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
import { ArrowRight, Save } from 'lucide-react';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { TextArea } from '@astryxdesign/core/TextArea';
import { useToast } from '@astryxdesign/core/Toast';
import {
  InterfaceRegion,
  PageHeading,
  WorkflowSteps,
  ClinicalNote,
} from '@/components/workflow-ui';
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
  const clearNotice = useCallback(
    (expected: string) =>
      setNotice((current) => (current === expected ? '' : current)),
    [],
  );
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
        <NoticeToast message={notice} onClear={clearNotice} />
        {error && (
          <Banner
            status="error"
            title={error}
            isDismissable
            onDismiss={() => setError('')}
            dismissLabel="Закрыть ошибку"
            collapsible={false}
          />
        )}
        {view === 'assessment' && (
          <>
            <PageHeading
              title={
                record.updatedAt && record.code
                  ? 'Уточнение оценки'
                  : 'Новая оценка'
              }
              description="Оцените клинические признаки, чтобы обосновать консультацию генетика."
              actions={
                <VStack gap={2}>
                  <Button
                    label="Сохранить черновик"
                    icon={<Save className="size-4" />}
                    onClick={() => void save('draft')}
                    isDisabled={saving || !ready}
                    isLoading={saving}
                    size="lg"
                  />
                  <Text type="supporting">
                    {dirty
                      ? 'Есть несохранённые изменения'
                      : record.updatedAt && record.code
                        ? 'Сохранено в истории'
                        : 'Можно заполнить частично'}
                  </Text>
                </VStack>
              }
            />
            <WorkflowSteps />
            <VStack className="xl:hidden">
              <ScoreCard record={record} disabled={saving || !ready} />
            </VStack>
            {/* Below xl the score moves above the form, and supporting details follow it.
              At xl the form and 340px summary rail share the content region. */}
            <Grid
              gap={4}
              className="grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]"
              align="start"
            >
              <VStack gap={4} className="min-w-0" aria-busy={saving}>
                <PatientContext
                  record={record}
                  onChange={update}
                  disabled={saving || !ready}
                />
                <CriteriaForm
                  record={record}
                  onChange={update}
                  disabled={saving || !ready}
                />
                <InterfaceRegion>
                  <TextArea
                    label="Примечание к случаю"
                    isOptional
                    value={record.notes}
                    onChange={(notes) =>
                      update({ ...record, notes: notes.slice(0, 2000) })
                    }
                    maxLength={2000}
                    placeholder="Жалобы, анамнез и дополнительные клинические сведения…"
                    rows={4}
                    description="Дополнительные сведения будут включены в результат и направление."
                    isDisabled={saving || !ready}
                    width="100%"
                    size="lg"
                  />
                </InterfaceRegion>
                <HStack justify="between" gap={4} wrap="wrap">
                  <Text color="secondary">
                    Известные данные: {r.known} из 8 категорий
                  </Text>
                  <Button
                    label="Посмотреть результат"
                    variant="primary"
                    size="lg"
                    endContent={<ArrowRight className="size-4" />}
                    onClick={() => void showResult()}
                    isDisabled={!r.hasData || saving || !ready}
                    isLoading={saving}
                  />
                </HStack>
              </VStack>
              <VStack
                as="aside"
                gap={4}
                className="min-w-0 xl:sticky xl:top-24"
              >
                <VStack className="hidden xl:flex">
                  <ScoreCard
                    record={record}
                    onResult={() => void showResult()}
                    disabled={saving || !ready}
                  />
                </VStack>
                <UrgentFlags record={record} />
                <Explainability record={record} />
                <ClinicalNote />
              </VStack>
            </Grid>
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
        <Dialog
          isOpen={!!pending}
          onOpenChange={(open) => {
            if (!open && !busyRef.current) setPending(null);
          }}
          purpose={saving ? 'required' : 'form'}
          role="alertdialog"
          aria-label="Сохранить текущую оценку?"
          aria-describedby="unsaved-description"
          width={520}
        >
          <Layout
            height="auto"
            padding={6}
            header={<DialogHeader title="Сохранить текущую оценку?" />}
            content={
              <LayoutContent>
                <Text id="unsaved-description">
                  В текущем случае есть изменения. Сохраните их, чтобы вернуться
                  к ним из истории.
                </Text>
              </LayoutContent>
            }
            footer={
              <LayoutFooter>
                <HStack gap={3} justify="end" wrap="wrap">
                  <Button
                    label="Остаться"
                    onClick={() => setPending(null)}
                    isDisabled={saving}
                    data-autofocus
                  />
                  <Button
                    label="Не сохранять"
                    variant="ghost"
                    onClick={() => pending?.()}
                    isDisabled={saving}
                  />
                  <Button
                    label="Сохранить"
                    variant="primary"
                    isLoading={saving}
                    onClick={async () => {
                      const next = pending;
                      if (next && (await save('draft'))) next();
                    }}
                  />
                </HStack>
              </LayoutFooter>
            }
          />
        </Dialog>
      </AppShell>
      <section id="print-output" className="print-view">
        <header className="print-brand">GenCompass · LUMEN GENOMICS</header>
        <pre>{printContent}</pre>
      </section>
    </>
  );
}

function NoticeToast({
  message,
  onClear,
}: {
  message: string;
  onClear: (expected: string) => void;
}) {
  const showToast = useToast();
  useEffect(() => {
    if (message)
      showToast({
        body: message,
        autoHideDuration: 6000,
        uniqueID: 'gencompass-notice',
        onHide: () => onClear(message),
      });
  }, [message, onClear, showToast]);
  return null;
}

function historyReplace(view: View) {
  if (location.hash !== '#' + view)
    window.history.pushState(null, '', '#' + view);
}
