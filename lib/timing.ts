// Measures how long a group of reads takes on the server. Used by Break #4 and Exercise 3.
// Lives outside the components so that React's purity lint rule does not flag the clock call.
export async function timed<T>(work: () => Promise<T>): Promise<{ value: T; ms: number }> {
  const start = performance.now();
  const value = await work();
  return { value, ms: Math.round(performance.now() - start) };
}
