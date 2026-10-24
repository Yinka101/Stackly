/** Legacy portfolio route — superseded by /invest. Kept as a stub. */
import { Hono } from 'hono';
const router = new Hono();
router.all('*', (c) => c.json({ error: 'Use /invest endpoints instead' }, 410));
export default router;
