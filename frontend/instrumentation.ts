export function register() {
  if (
    typeof globalThis.localStorage === "undefined" ||
    typeof (globalThis.localStorage as Storage).getItem !== "function"
  ) {
    (globalThis as unknown as { localStorage: Storage }).localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    };
  }
}
