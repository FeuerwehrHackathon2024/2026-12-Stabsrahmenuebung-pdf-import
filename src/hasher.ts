export async function getHash(file: any): Promise<string> {
  return "" + Bun.hash(file);
}
