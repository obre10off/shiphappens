// lib/util/timeout.ts
// Step-level timeout guard. Races a promise against a deadline; on timeout it
// resolves with a caller-supplied fallback (so a slow step degrades gracefully
// instead of stalling the whole screening). The underlying work is not aborted —
// callers pass non-throwing steps whose results are simply ignored if late.

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  onTimeout: () => T,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => resolve(onTimeout()), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}
