export function mergeArrays<T>(arr1: T[], arr2: T[]): T[] {
  const mergedSet = new Set([...arr1, ...arr2]);

  return Array.from(mergedSet);
}

export function findSharedMembers<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);

  return arr1.filter((element) => set2.has(element));
}
