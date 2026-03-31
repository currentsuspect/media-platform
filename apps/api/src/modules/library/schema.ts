import { z } from "zod";

export const addLibrarySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["shows", "movies"]),
  path: z.string().min(1).refine((value) => value.startsWith("/"), {
    message: "Library path must be absolute"
  })
});

export type AddLibraryInput = z.infer<typeof addLibrarySchema>;
