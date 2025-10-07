function getWordCount(text: string): Map<string, number> {
  const words = text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/);
  const wordCount = new Map<string, number>();

  for (const word of words) {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }

  return wordCount;
}

function getCosineSimilarity(text1: string, text2: string): number {
  const wordCount1 = getWordCount(text1);
  const wordCount2 = getWordCount(text2);

  const allWords = new Set([...wordCount1.keys(), ...wordCount2.keys()]);
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (const word of allWords) {
    const count1 = wordCount1.get(word) || 0;
    const count2 = wordCount2.get(word) || 0;
    dotProduct += count1 * count2;
    magnitude1 += count1 ** 2;
    magnitude2 += count2 ** 2;
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}

export function compareTitle(a: string, b: string) {
  return getCosineSimilarity(a, b);
}
