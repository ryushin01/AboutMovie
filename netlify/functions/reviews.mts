import { getDatabase } from '@netlify/database';
import type { Config, Context } from '@netlify/functions';
import { imagePaths } from '../../src/entities/review/model/richText';
import { rejectUnlessCritic } from '../lib/auth';
import { writableImages } from '../lib/imageStore';
import { parseReviewFields } from '../lib/reviewInput';
import { createReview, deleteReview, findReview, listReviews, updateReview } from '../lib/reviewRepository';

const notFound = () => Response.json({ error: 'not_found' }, { status: 404 });

async function readFields(req: Request) {
  const input = await req.json().catch(() => null);
  return parseReviewFields(input);
}

export default async (req: Request, context: Context) => {
  const db = getDatabase().pool;
  const { id } = context.params;

  if (req.method === 'GET') {
    if (!id) return Response.json(await listReviews(db));
    const review = await findReview(db, id);
    return review ? Response.json(review) : notFound();
  }

  const rejected = await rejectUnlessCritic(req, context);
  if (rejected) return rejected;

  if (req.method === 'DELETE' && id) {
    const review = await deleteReview(db, id);
    if (!review) return notFound();
    // 함께 지우지 못한 이미지는 글이 없어 보이지 않으므로, 삭제 자체는 실패로 처리하지 않습니다.
    const images = writableImages(context);
    const keys = [review.poster, ...imagePaths(review.body)]
      .filter((path) => path.startsWith('/api/images/'))
      .map((path) => path.slice('/api/images/'.length));
    await Promise.allSettled(keys.map((key) => images.delete(key)));
    return new Response(null, { status: 204 });
  }

  if (req.method === 'POST' && !id) {
    const parsed = await readFields(req);
    if ('invalid' in parsed)
      return Response.json({ error: 'invalid', fields: parsed.invalid }, { status: 400 });
    return Response.json(await createReview(db, crypto.randomUUID(), parsed.fields), { status: 201 });
  }

  if (req.method === 'PUT' && id) {
    const parsed = await readFields(req);
    if ('invalid' in parsed)
      return Response.json({ error: 'invalid', fields: parsed.invalid }, { status: 400 });
    const review = await updateReview(db, id, parsed.fields);
    return review ? Response.json(review) : notFound();
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config: Config = { path: ['/api/reviews', '/api/reviews/:id'] };
