import { Hono } from 'hono';
import { db, profiles } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { nanoid } from '../utils/nanoid.js';

const router = new Hono();

// POST /profiles — create or return existing profile
// Body: { nickname, band, avatar }
router.post('/', async (c) => {
  const body = await c.req.json<{ nickname?: string; band?: string; avatar?: string }>();
  const { nickname, band, avatar } = body;

  if (!nickname || !band || !avatar) {
    return c.json({ error: 'nickname, band and avatar are required' }, 400);
  }
  const validBands = ['sprouts', 'builders', 'investors'];
  if (!validBands.includes(band)) {
    return c.json({ error: 'band must be sprouts, builders, or investors' }, 400);
  }

  const id = nanoid();
  await db.insert(profiles).values({
    id,
    nickname: nickname.slice(0, 20), // cap length
    band,
    avatar,
    practiceDollars: 1000,
    createdAt: new Date(),
  });

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
  return c.json(profile, 201);
});

// GET /profiles/:id
router.get('/:id', async (c) => {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, c.req.param('id')));
  if (!profile) return c.json({ error: 'not found' }, 404);
  return c.json(profile);
});

export default router;
