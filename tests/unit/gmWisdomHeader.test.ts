import { GM_WISDOM_QUOTES } from '../../src/services/chess/gmWisdom';

describe('GMWisdomHeader Quotes Repository', () => {
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
  });
});
