import { z } from "zod";

export const catalogIdParamSchema = z.object({
  id: z.string().uuid()
});

