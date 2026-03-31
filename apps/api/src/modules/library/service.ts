import type { AddLibraryInput } from "./schema";
import type { LibraryRecord, QueuedJobRecord } from "@media/types";
import { LibraryRepository } from "./repository";
import { LibraryScanPublisher } from "./queue";

export class LibraryService {
  constructor(
    private readonly libraryRepository: LibraryRepository,
    private readonly libraryScanPublisher: LibraryScanPublisher
  ) {}

  async list(): Promise<LibraryRecord[]> {
    return this.libraryRepository.list();
  }

  async create(input: AddLibraryInput): Promise<{
    library: LibraryRecord;
    queuedJob: QueuedJobRecord;
  }> {
    const library = await this.libraryRepository.create(input);
    const queuedJob = await this.libraryScanPublisher.enqueue(library.id);

    return {
      library,
      queuedJob
    };
  }
}
