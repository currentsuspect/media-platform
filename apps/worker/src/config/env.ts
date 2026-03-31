import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  MEDIA_ROOT: z.string().min(1),
  TMDB_API_KEY: z.string().optional()
});

export const env = envSchema.parse(process.env);
