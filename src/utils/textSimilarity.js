const normalizeText = (text = '') => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const tokenize = (text = '') => {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  return normalized.split(' ').filter(Boolean);
};

const buildTokenFreq = (tokens = []) => {
  const freq = new Map();
  tokens.forEach((token) => {
    freq.set(token, (freq.get(token) || 0) + 1);
  });
  return freq;
};

const cosineSimilarity = (tokensA = [], tokensB = []) => {
  if (!tokensA.length || !tokensB.length) return 0;
  const freqA = buildTokenFreq(tokensA);
  const freqB = buildTokenFreq(tokensB);

  let dotProduct = 0;
  freqA.forEach((value, key) => {
    if (freqB.has(key)) {
      dotProduct += value * freqB.get(key);
    }
  });

  const magnitude = (freq) => {
    let sum = 0;
    freq.forEach((value) => {
      sum += value * value;
    });
    return Math.sqrt(sum);
  };

  const magnitudeA = magnitude(freqA);
  const magnitudeB = magnitude(freqB);

  if (!magnitudeA || !magnitudeB) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};

const jaccardSimilarity = (tokensA = [], tokensB = []) => {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = new Set([...setA].filter((token) => setB.has(token)));
  const union = new Set([...setA, ...setB]);
  if (!union.size) return 0;
  return intersection.size / union.size;
};

const keywordHitRatio = (queryTokens = [], text = '') => {
  if (!queryTokens.length) return 0;
  const normalized = normalizeText(text);
  if (!normalized) return 0;

  const hits = queryTokens.reduce((count, token) => {
    return normalized.includes(token) ? count + 1 : count;
  }, 0);

  return hits / queryTokens.length;
};

export const calculateSimilarity = (query = '', target = '') => {
  if (!query || !target) return 0;

  const queryTokens = tokenize(query);
  const targetTokens = tokenize(target);

  if (!queryTokens.length || !targetTokens.length) return 0;

  const cosine = cosineSimilarity(queryTokens, targetTokens);
  const jaccard = jaccardSimilarity(queryTokens, targetTokens);
  const hit = keywordHitRatio(queryTokens, target);

  // Weighted combination emphasizing keyword hits and cosine similarity
  return (cosine * 0.45) + (jaccard * 0.25) + (hit * 0.3);
};

export const normalizeForDisplay = normalizeText;
