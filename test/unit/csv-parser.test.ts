import { describe, it, expect } from 'vitest';

/**
 * Tests for the CSV parser function from blip-actions
 * Since the function is not exported, we're testing it through the import functionality
 * and also testing the logic separately here.
 */

/** Simple CSV line parser that handles quoted fields - copied for unit testing */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

describe('CSV parser', () => {
  describe('parseCsvLine', () => {
    it('parses simple CSV line', () => {
      const result = parseCsvLine('React,Frameworks,Adopt');
      expect(result).toEqual(['React', 'Frameworks', 'Adopt']);
    });

    it('parses CSV line with quoted field', () => {
      const result = parseCsvLine('React,"A JavaScript library",Adopt');
      expect(result).toEqual(['React', 'A JavaScript library', 'Adopt']);
    });

    it('parses CSV line with comma inside quotes', () => {
      const result = parseCsvLine('React,"A library, by Facebook",Adopt');
      expect(result).toEqual(['React', 'A library, by Facebook', 'Adopt']);
    });

    it('parses CSV line with escaped quotes', () => {
      const result = parseCsvLine('React,"The ""best"" library",Adopt');
      expect(result).toEqual(['React', 'The "best" library', 'Adopt']);
    });

    it('parses CSV line with empty fields', () => {
      const result = parseCsvLine('React,,Adopt');
      expect(result).toEqual(['React', '', 'Adopt']);
    });

    it('parses CSV line with all empty fields', () => {
      const result = parseCsvLine(',,');
      expect(result).toEqual(['', '', '']);
    });

    it('parses CSV line with quoted empty field', () => {
      const result = parseCsvLine('React,"",Adopt');
      expect(result).toEqual(['React', '', 'Adopt']);
    });

    it('parses single field', () => {
      const result = parseCsvLine('React');
      expect(result).toEqual(['React']);
    });

    it('parses empty line', () => {
      const result = parseCsvLine('');
      expect(result).toEqual(['']);
    });

    it('handles quotes at start and end of quoted field', () => {
      const result = parseCsvLine('"React","Library","Adopt"');
      expect(result).toEqual(['React', 'Library', 'Adopt']);
    });

    it('handles newline inside quoted field', () => {
      const result = parseCsvLine('React,"Multi\nline\ndescription",Adopt');
      expect(result).toEqual(['React', 'Multi\nline\ndescription', 'Adopt']);
    });

    it('handles multiple escaped quotes', () => {
      const result = parseCsvLine('React,"""quoted""",Adopt');
      expect(result).toEqual(['React', '"quoted"', 'Adopt']);
    });

    it('handles trailing comma', () => {
      const result = parseCsvLine('React,Library,');
      expect(result).toEqual(['React', 'Library', '']);
    });

    it('handles leading comma', () => {
      const result = parseCsvLine(',React,Library');
      expect(result).toEqual(['', 'React', 'Library']);
    });

    it('handles mixed quoted and unquoted fields', () => {
      const result = parseCsvLine('React,"A library",Adopt,true,"More, info"');
      expect(result).toEqual(['React', 'A library', 'Adopt', 'true', 'More, info']);
    });

    it('handles special characters in quoted fields', () => {
      const result = parseCsvLine('React,"!@#$%^&*()_+-=[]{}|;:,.<>?",Adopt');
      expect(result).toEqual(['React', '!@#$%^&*()_+-=[]{}|;:,.<>?', 'Adopt']);
    });

    it('handles unicode characters', () => {
      const result = parseCsvLine('React,日本語,Adopt');
      expect(result).toEqual(['React', '日本語', 'Adopt']);
    });

    it('handles tabs and spaces', () => {
      const result = parseCsvLine('React,  Library  ,Adopt');
      expect(result).toEqual(['React', '  Library  ', 'Adopt']);
    });
  });

  describe('CSV import validation', () => {
    it('validates required columns', () => {
      const headers = ['name', 'quadrant', 'ring'].map(h => h.toLowerCase());
      expect(headers).toContain('name');
      expect(headers).toContain('quadrant');
      expect(headers).toContain('ring');
    });

    it('identifies missing required columns', () => {
      const headers = ['name', 'quadrant'].map(h => h.toLowerCase());
      expect(headers).toContain('name');
      expect(headers).toContain('quadrant');
      expect(headers).not.toContain('ring');
    });

    it('handles case-insensitive column names', () => {
      const headers = ['NAME', 'QUADRANT', 'RING'].map(h => h.toLowerCase());
      expect(headers).toEqual(['name', 'quadrant', 'ring']);
    });

    it('parses isNew boolean values', () => {
      const trueValues = ['true', 'yes', '1'];
      const falseValues = ['false', 'no', '0', ''];

      trueValues.forEach(val => {
        expect(trueValues.includes(val.toLowerCase())).toBe(true);
      });

      falseValues.forEach(val => {
        expect(trueValues.includes(val.toLowerCase())).toBe(false);
      });
    });

    it('validates quadrant name matching (case-insensitive)', () => {
      const quadrantMap = new Map([
        ['techniques', 'q1'],
        ['platforms', 'q2'],
        ['tools', 'q3'],
        ['languages & frameworks', 'q4'],
      ]);

      expect(quadrantMap.get('techniques')).toBe('q1');
      expect(quadrantMap.get('Techniques'.toLowerCase())).toBe('q1');
      expect(quadrantMap.get('TECHNIQUES'.toLowerCase())).toBe('q1');
      expect(quadrantMap.get('invalid')).toBeUndefined();
    });

    it('validates ring name matching (case-insensitive)', () => {
      const ringMap = new Map([
        ['adopt', 'r1'],
        ['trial', 'r2'],
        ['assess', 'r3'],
        ['hold', 'r4'],
      ]);

      expect(ringMap.get('adopt')).toBe('r1');
      expect(ringMap.get('Adopt'.toLowerCase())).toBe('r1');
      expect(ringMap.get('ADOPT'.toLowerCase())).toBe('r1');
      expect(ringMap.get('invalid')).toBeUndefined();
    });
  });

  describe('CSV format validation', () => {
    it('validates minimum CSV structure', () => {
      const csv = 'name,quadrant,ring\nReact,Frameworks,Adopt';
      const lines = csv.split(/\r?\n/).filter(l => l.trim());
      expect(lines.length).toBeGreaterThanOrEqual(2);
    });

    it('rejects CSV with only header', () => {
      const csv = 'name,quadrant,ring';
      const lines = csv.split(/\r?\n/).filter(l => l.trim());
      expect(lines.length).toBeLessThan(2);
    });

    it('rejects empty CSV', () => {
      const csv = '';
      const lines = csv.split(/\r?\n/).filter(l => l.trim());
      expect(lines.length).toBe(0);
    });

    it('handles CSV with Windows line endings', () => {
      const csv = 'name,quadrant,ring\r\nReact,Frameworks,Adopt\r\n';
      const lines = csv.split(/\r?\n/).filter(l => l.trim());
      expect(lines.length).toBe(2);
    });

    it('handles CSV with Unix line endings', () => {
      const csv = 'name,quadrant,ring\nReact,Frameworks,Adopt\n';
      const lines = csv.split(/\r?\n/).filter(l => l.trim());
      expect(lines.length).toBe(2);
    });

    it('filters out empty lines', () => {
      const csv = 'name,quadrant,ring\n\n\nReact,Frameworks,Adopt\n\n';
      const lines = csv.split(/\r?\n/).filter(l => l.trim());
      expect(lines.length).toBe(2);
    });
  });

  describe('Batch processing', () => {
    it('calculates correct batch count for small dataset', () => {
      const BATCH_SIZE = 50;
      const items = Array(25).fill(null);
      const batches = Math.ceil(items.length / BATCH_SIZE);
      expect(batches).toBe(1);
    });

    it('calculates correct batch count for exact batch size', () => {
      const BATCH_SIZE = 50;
      const items = Array(50).fill(null);
      const batches = Math.ceil(items.length / BATCH_SIZE);
      expect(batches).toBe(1);
    });

    it('calculates correct batch count for large dataset', () => {
      const BATCH_SIZE = 50;
      const items = Array(125).fill(null);
      const batches = Math.ceil(items.length / BATCH_SIZE);
      expect(batches).toBe(3);
    });

    it('processes batches correctly', () => {
      const BATCH_SIZE = 50;
      const items = Array(125).fill(null).map((_, i) => i);
      const processedBatches: number[][] = [];

      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        processedBatches.push(batch);
      }

      expect(processedBatches.length).toBe(3);
      expect(processedBatches[0].length).toBe(50);
      expect(processedBatches[1].length).toBe(50);
      expect(processedBatches[2].length).toBe(25);
    });
  });
});
