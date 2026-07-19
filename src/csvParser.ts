import { RateRow, MetadataRow } from './types';

/**
 * A robust RFC 4180-compliant CSV parser.
 * Handles double-quotes, commas inside quotes, escaped quotes, and different line ending formats.
 */
export function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped double quote inside quotes
          cell += '"';
          i++; // Skip the next quote
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(cell);
        cell = '';
      } else if (char === '\n' || char === '\r') {
        row.push(cell);
        cell = '';
        
        // Push row if it's not completely empty
        if (row.some(val => val !== '')) {
          result.push(row);
        }
        row = [];

        // Handle \r\n endings
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
      } else {
        cell += char;
      }
    }
  }

  // Push final trailing cell/row if exists
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    if (row.some(val => val !== '')) {
      result.push(row);
    }
  }

  return result;
}

/**
 * Converts parsed CSV rows into typed RateRow objects.
 */
export function parseRateCSV(csvText: string): RateRow[] {
  const rows = parseCSV(csvText);
  if (rows.length <= 1) return [];

  const headers = rows[0].map(h => h.trim().toLowerCase());
  const dataRows = rows.slice(1);

  return dataRows.map(row => {
    const record: Partial<RateRow> = {};
    headers.forEach((header, index) => {
      const val = row[index] ? row[index].trim() : '';
      
      if (header === 'date') {
        record.date = val;
      } else if (header === 'publication_only') {
        record.publication_only = val.toLowerCase() === 'true';
      } else if (header === 'source_file') {
        record.source_file = val;
      } else {
        // Parse numerical rates
        const num = parseFloat(val);
        record[header as keyof RateRow] = isNaN(num) ? null : (num as any);
      }
    });
    return record as RateRow;
  });
}

/**
 * Converts parsed CSV rows into typed MetadataRow objects.
 */
export function parseMetadataCSV(csvText: string): MetadataRow[] {
  const rows = parseCSV(csvText);
  if (rows.length <= 1) return [];

  const headers = rows[0].map(h => h.trim().toLowerCase());
  const dataRows = rows.slice(1);

  return dataRows.map(row => {
    const record: Partial<MetadataRow> = {};
    headers.forEach((header, index) => {
      const val = row[index] ? row[index].trim() : '';
      if (header === 'currencies_found') {
        record.currencies_found = parseInt(val, 10) || 0;
      } else {
        record[header as keyof MetadataRow] = val as any;
      }
    });
    return record as MetadataRow;
  });
}
