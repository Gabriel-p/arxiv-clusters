
import { promises as fs } from 'fs';
import fetch          from 'node‑fetch';
import { parseStringPromise } from 'xml2js';

const ARXIV_URL = 'https://export.arxiv.org/api/query?search_query=cat:astro-ph*&sortBy=submittedDate&sortOrder=descending&max_results=100';

async function main() {
  const res  = await fetch(ARXIV_URL);
  const xml  = await res.text();
  const obj  = await parseStringPromise(xml, { explicitArray: false });
  // obj.feed.entry is now an array of entries
  await fs.mkdir('data', { recursive: true });
  await fs.writeFile(
    'data/arxiv.json',
    JSON.stringify(obj.feed.entry, null, 2),
    'utf‑8'
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
