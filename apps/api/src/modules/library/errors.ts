export class LibraryPathConflictError extends Error {
  constructor(path: string) {
    super(`Library path already exists: ${path}`);
    this.name = "LibraryPathConflictError";
  }
}

