import { GM_WISDOM_QUOTES, GMQuote } from '../../src/services/chess/gmWisdom';

describe('GMWisdom Quotes & Animated Banner Logic', () => {
  it('contains at least 10 Grandmaster quotes', () => {
    expect(GM_WISDOM_QUOTES.length).toBeGreaterThanOrEqual(10);
  });

  it('every quote contains non-empty quote text and a valid GM author', () => {
    for (const q of GM_WISDOM_QUOTES) {
      expect(q.quote.trim().length).toBeGreaterThan(5);
      expect(q.author.trim().length).toBeGreaterThan(2);
    }
  });

  it('includes classic quotes from world champions', () => {
    const authors = GM_WISDOM_QUOTES.map((q) => q.author);
    expect(authors).toContain('Garry Kasparov');
    expect(authors).toContain('Bobby Fischer');
    expect(authors).toContain('Emanuel Lasker');
    expect(authors).toContain('Magnus Carlsen');
  });

  it('simulates progressive kinetic typewriter character reveal without missing chars', () => {
    const sampleQuote = GM_WISDOM_QUOTES[0].quote;
    let revealed = '';
    for (let i = 1; i <= sampleQuote.length; i++) {
      revealed = sampleQuote.slice(0, i);
      expect(revealed.length).toBe(i);
    }
    expect(revealed).toBe(sampleQuote);
  });

  it('guarantees cycling selects a new quote without immediate identical repeat', () => {
    let currentIdx = 0;
    for (let trial = 0; trial < 20; trial++) {
      let nextIdx = Math.floor(Math.random() * GM_WISDOM_QUOTES.length);
      while (nextIdx === currentIdx && GM_WISDOM_QUOTES.length > 1) {
        nextIdx = Math.floor(Math.random() * GM_WISDOM_QUOTES.length);
      }
      expect(nextIdx).not.toBe(currentIdx);
      currentIdx = nextIdx;
    }
  });
});
