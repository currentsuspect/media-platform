import { z } from "zod";

export const playbackIdParamSchema = z.object({
  id: z.string().uuid()
});

