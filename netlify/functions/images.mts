import type { Config, Context } from '@netlify/functions';
import { rejectUnlessCritic } from '../lib/auth';
import { detectImageType, readableImages, writableImages } from '../lib/imageStore';

// 함수 요청 본문 한도(6MB)에서 base64가 늘리는 몫을 뺀 값입니다. 브라우저에서 미리 줄여 올리므로 보통 넘지 않습니다.
const MAX_BYTES = 4.4 * 1024 * 1024;

async function upload(req: Request, context: Context) {
  const rejected = await rejectUnlessCritic(req, context);
  if (rejected) return rejected;

  const input = (await req.json().catch(() => null)) as { data?: unknown } | null;
  if (typeof input?.data !== 'string' || !input.data)
    return Response.json({ error: 'invalid' }, { status: 400 });

  const bytes = Buffer.from(input.data, 'base64');
  if (bytes.byteLength > MAX_BYTES) return Response.json({ error: 'too_large' }, { status: 413 });
  const image = detectImageType(bytes);
  if (!image) return Response.json({ error: 'unsupported_type' }, { status: 415 });

  const key = `${crypto.randomUUID()}.${image.ext}`;
  await writableImages(context).set(
    key,
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    { metadata: { type: image.type } },
  );
  return Response.json({ url: `/api/images/${key}` }, { status: 201 });
}

async function read(context: Context) {
  const { key } = context.params;
  for (const store of readableImages(context)) {
    const entry = await store.getWithMetadata(key, { type: 'arrayBuffer' });
    if (entry) {
      return new Response(entry.data, {
        headers: {
          'Content-Type': String(entry.metadata.type),
          // 파일 이름이 내용마다 달라 바뀌지 않습니다.
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }
  }
  return new Response('Not found', { status: 404 });
}

export default async (req: Request, context: Context) => {
  if (req.method === 'POST' && !context.params.key) return upload(req, context);
  if (req.method === 'GET' && context.params.key) return read(context);
  return new Response('Method not allowed', { status: 405 });
};

export const config: Config = { path: ['/api/images', '/api/images/:key'] };
