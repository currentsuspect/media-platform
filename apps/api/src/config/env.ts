import { config } from "dotenv";
import { z } from "zod";
import { appDefaults } from "@media/config";

config();

const envSchema = z.object({
  API_PORT: z.coerce.number().default(appDefaults.apiPort),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  MEDIA_ROOT: z.string().min(1),
  TMDB_API_KEY: z.string().optional(),
  JWT_SECRET: z.string().min(1)
});

export const env = envSchema.parse(process.env);

