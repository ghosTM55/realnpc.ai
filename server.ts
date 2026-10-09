// Vercel captures listen() at module startup. Keep the standalone/test factory reusable.
import { createSoulServer } from "./services/soul-api/server.ts";

createSoulServer(process.env).listen(Number(process.env.PORT ?? 8787));
