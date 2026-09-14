import assert from 'node:assert/strict';
import test from 'node:test';
import { browserAssessmentStore } from '../lib/browser-store';
import { fullPreviewAssessment } from '../lib/demo';
import { calculate, newAssessment } from '../lib/model';

function memoryStorage() {
  const entries = new Map<string, string>();
  return {
    get length() {
      return entries.size;
    },
    key: (index: number) => [...entries.keys()][index] ?? null,
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
    removeItem: (key: string) => {
      entries.delete(key);
    },
    clear: () => entries.clear(),
  } satisfies Storage;
}

test('Pages preserves full cases across reloads and upserts only the edited ID', () => {
  const storage = memoryStorage();
  storage.setItem('unrelated-app', 'keep');
  const store = browserAssessmentStore(storage);
  const original = fullPreviewAssessment();
  original.code = '';
  const first = store.save(original);
  assert.match(first.code, /^GC-[A-F0-9]{6}$/);
  assert.ok(Number.isFinite(Date.parse(first.updatedAt)));
  assert.deepEqual(browserAssessmentStore(storage).list(), [first]);
  const second = store.save(newAssessment());
  const edited = store.save({
    ...first,
    notes: 'Уточнение',
    status: 'complete',
  });
  const restored = browserAssessmentStore(storage).list();
  assert.equal(restored.length, 2);
  assert.deepEqual(
    restored.find((r) => r.id === first.id),
    edited,
  );
  assert.deepEqual(
    restored.find((r) => r.id === second.id),
    second,
  );
  assert.deepEqual(edited.patient, original.patient);
  assert.deepEqual(edited.visit, original.visit);
  assert.equal(calculate(edited.answers).score, 100);
  assert.equal(storage.getItem('unrelated-app'), 'keep');
});

test('Pages rejects invalid records before writes and propagates quota failures', () => {
  const storage = memoryStorage();
  const store = browserAssessmentStore(storage);
  const saved = store.save(fullPreviewAssessment());
  assert.throws(() =>
    store.save({ ...saved, visit: { ...saved.visit, date: 'invalid' } }),
  );
  assert.deepEqual(store.list(), [saved]);
  storage.setItem = () => {
    throw new DOMException('Full', 'QuotaExceededError');
  };
  assert.throws(() => store.save({ ...saved, notes: 'Не сохранено' }), {
    name: 'QuotaExceededError',
  });
  assert.deepEqual(store.list(), [saved]);
});

test('Pages corrupt storage cannot silently become an empty history', () => {
  const storage = memoryStorage();
  const store = browserAssessmentStore(storage);
  const saved = store.save(newAssessment());
  const key = storage.key(0)!;
  storage.setItem(key, '{broken');
  assert.throws(() => store.list());
  assert.equal(storage.getItem(key), '{broken');
  storage.setItem(key, JSON.stringify({ ...saved, id: crypto.randomUUID() }));
  assert.throws(() => store.list(), /Некорректная запись/);
});

test('new model case code is assigned by persistence and cannot be edited; legacy codes survive', () => {
  const store = browserAssessmentStore(memoryStorage());
  const draft = newAssessment();
  const saved = store.save({ ...draft, code: 'MANUALLY-ENTERED' });
  assert.equal(saved.code, 'GC-' + draft.id.slice(0, 6).toUpperCase());
  assert.equal(store.save({ ...saved, code: 'CHANGED' }).code, saved.code);
  const old = store.save({
    ...newAssessment(),
    modelVersion: 'demo-0.1',
    code: 'GC-LEGACY',
  });
  assert.equal(old.code, 'GC-LEGACY');
});
