import { categories, calculate, type Assessment, type Answers } from './model';
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
        'Return the current demo assessment, available categories, allowed criterion IDs and demo score. Scores are not clinically validated.',
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
          result: calculate(record.answers),
          categories,
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
              'Category IDs mapped to {status:selected|none|unknown, selected:criterionId[]}.',
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
        return { staged: true, result: calculate(read().answers) };
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
