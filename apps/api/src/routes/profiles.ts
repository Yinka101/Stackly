/** Legacy profiles route — superseded by auth + learner system. Kept as a stub to avoid import errors. */
import { Hono } from 'hono';
const router = new Hono();
router.all('*', (c) => c.json({ error: 'Use /auth endpoints instead' }, 410));
export default router;
