import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';

const ARXIV_URL = 'https://export.arxiv.org/api/query?search_query=cat:astro-ph*&sortBy=submittedDate&sortOrder=descending&max_results=100';

const keywords = ['open cluster', 'star cluster', 'stellar cluster'];

async function main() {
  const res = await fetch(ARXIV_URL);
  const xml = await res.text();
  const obj = await parseStringPromise(xml, { explicitArray: false });
  const entries = Array.isArray(obj.feed.entry) ? obj.feed.entry : [obj.feed.entry];

  // Calculate scores and filter entries
  const scoredEntries = entries
    .map(entry => {
      const title = entry.title.toLowerCase();
      const summary = entry.summary.toLowerCase();

      // Calculate the score
      let score = 0;
      keywords.forEach(keyword => {
        if (title.includes(keyword)) score += 2;
        if (summary.includes(keyword)) score += 1;
      });

      return { ...entry, score };
    })
    .filter(entry => entry.score > 0); // Exclude entries with score=0

  // Sort entries by score in descending order
  const sortedEntries = scoredEntries.sort((a, b) => b.score - a.score);

  // If no entries are to be saved, save a placeholder entry
  const entriesToSave = sortedEntries.length > 0 
    ? sortedEntries 
    : [{
        title: 'No articles found',
        link: 'https://arxiv.org/list/astro-ph/new',
        authors: '',
        updated: new Date().toISOString().split('T')[0],
        abstract: 'No articles matching the filters found in the current submissions.'
      }];

  await fs.mkdir('data', { recursive: true });
  await fs.writeFile(
    'data/arxiv.json',
    JSON.stringify(entriesToSave, null, 2),
    'utf-8'
  );

}

main().catch(err => {
  console.error(err);
  process.exit(1);
});