import { listAssessments, saveAssessment } from '@/db/store';
import { validateAssessment } from '@/lib/validation';
const headers = { 'Cache-Control': 'no-store' };
export async function GET() {
  try {
    return Response.json({ assessments: await listAssessments() }, { headers });
  } catch {
    return Response.json(
      { error: 'Не удалось загрузить историю. Повторите попытку.' },
      { status: 503, headers },
    );
  }
}
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin)
    return Response.json(
      { error: 'Недопустимый источник запроса.' },
      { status: 403 },
    );
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return Response.json({ error: 'Ожидается JSON.' }, { status: 415 });
  if (Number(request.headers.get('content-length')) > 16000)
    return Response.json({ error: 'Слишком большой запрос.' }, { status: 413 });
  let record;
  try {
    const text = await request.text();
    if (text.length > 16000)
      return Response.json(
        { error: 'Слишком большой запрос.' },
        { status: 413 },
      );
    record = validateAssessment(JSON.parse(text));
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Некорректные данные.',
      },
      { status: 400, headers },
    );
  }
  try {
    return Response.json(
      { assessment: await saveAssessment(record) },
      { headers },
    );
  } catch {
    return Response.json(
      {
        error:
          'Не удалось сохранить оценку. Ваш ввод остаётся на экране. Повторите попытку.',
      },
      { status: 503, headers },
    );
  }
}
