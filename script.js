const API_URL =
  'https://export.arxiv.org/api/query?search_query=cat:astro-ph*&sortBy=submittedDate&sortOrder=descending&max_results=50';

// const API_URL =
//   'https://export.arxiv.org/api/query?search_query=cat:astro-ph*&sortBy=lastUpdatedDate&sortOrder=descending&max_results=50';

async function fetchPapers() {
  try {
    const res = await fetch(API_URL);
    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'application/xml');
    const entries = Array.from(xml.querySelectorAll('entry'));

    const clusterEntries = entries.filter(entry => {
      const title = entry.querySelector('title').textContent.toLowerCase();
      const summary = entry.querySelector('summary').textContent.toLowerCase();
      return title.includes('open cluster') || summary.includes('cluster');
    });

    const list = document.getElementById('papers');
    clusterEntries.forEach(entry => {
      const li = document.createElement('li');
      li.className = 'paper';

      const title = entry.querySelector('title').textContent.trim();
      const link = entry.querySelector('id').textContent.trim();
      const authors = Array.from(entry.querySelectorAll('author > name'))
        .map(a => a.textContent)
        .join(', ');
      const updated = new Date(entry.querySelector('updated').textContent).toLocaleDateString();
      const abstract = entry.querySelector('summary').textContent.trim();

      li.innerHTML = `
        <a class="title" href="${link}" target="_blank">${title}</a>
        <div class="meta">${authors} — ${updated}</div>
        <p class="abstract">${abstract}</p>
      `;

      list.appendChild(li);
    });
  } catch (err) {
    console.error('Error fetching or parsing arXiv data:', err);
  }
}

window.addEventListener('DOMContentLoaded', fetchPapers);