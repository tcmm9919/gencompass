import {
  categories,
  calculateAssessment,
  type Assessment,
  type Answers,
} from './model';
import { validateAssessment } from './validation';
type Tool = {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
};
type Context = {
  registerTool: (
    tool: Tool,
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
};
function publishedResult(record: Assessment) {
  const result = calculateAssessment(record);
  if (!result.scoringPending) return result;
  return {
    ...result,
    familyModifier: { ...result.familyModifier, points: null, bonus: null },
    contributions: result.contributions.map((item) => ({
      ...item,
      points: null,
      category: {
        ...item.category,
        criteria: item.category.criteria.map((c) => ({ ...c, points: null })),
      },
      selected: item.selected.map((c) => ({ ...c, points: null })),
    })),
    urgent: result.urgent.map((c) => ({ ...c, points: null })),
  };
}

export function registerClinicalTools(
  read: () => Assessment,
  update: (a: Answers) => void,
  context: Context | undefined = typeof document === 'undefined'
    ? undefined
    : (document as Document & { modelContext?: Context }).modelContext,
) {
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  const toolList: Tool[] = [
    {
      name: 'get_gencompass_assessment',
      title: 'Прочитать текущую оценку',
      description:
        'Return the current demo assessment, available categories, allowed criterion IDs and versioned result. Pending models return no numerical score; legacy demo scores are not clinically validated.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute(input) {
        if (
          !input ||
          typeof input !== 'object' ||
          Array.isArray(input) ||
          Object.keys(input).length
        )
          throw new Error('Expected empty object.');
        const record = read();
        return {
          assessment: record,
          result: publishedResult(record),
          categories: categories.map((c) => ({
            ...c,
            criteria: c.criteria.map((item) => ({
              ...item,
              points: record.modelVersion === 'demo-0.1' ? item.points : null,
            })),
          })),
        };
      },
    },
    {
      name: 'stage_gencompass_answers',
      title: 'Заполнить клинические признаки',
      description:
        'Replace the current unsaved answers and show them in the assessment form. Does not persist, finalize, diagnose, or send a referral. Use only demo case data.',
      inputSchema: {
        type: 'object',
        properties: {
          answers: {
            type: 'object',
            description:
              'Category IDs mapped to {status:selected|none|unknown|normal (normal is laboratory-only in review-0.2), selected:criterionId[]}.',
          },
        },
        required: ['answers'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (
          !input ||
          typeof input !== 'object' ||
          Array.isArray(input) ||
          Object.keys(input).some((k) => k !== 'answers')
        )
          throw new Error('Expected answers.');
        const candidate = validateAssessment({
          ...read(),
          answers: (input as { answers: unknown }).answers,
          status: 'draft',
        });
        update(candidate.answers);
        return { staged: true, result: publishedResult(read()) };
      },
    },
  ];
  for (const tool of toolList) {
    try {
      void Promise.resolve(
        context.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {}
  }
  return () => lifecycle.abort();
}
