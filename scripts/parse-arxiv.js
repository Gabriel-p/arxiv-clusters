async function fetchPapers() {
  try {
    // Fetch the pre‑built JSON instead of the XML API feed
    const res = await fetch('/data/arxiv.json');
    const data = await res.json();
    const entries = Array.isArray(data) ? data : [data];

    const keywords = ['open cluster', 'star cluster', 'stellar cluster'];

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

    const list = document.getElementById('papers');
    sortedEntries.forEach(entry => {
      const li = document.createElement('li');
      li.className = 'paper';

      const title = entry.title.trim();
      const link = entry.id.trim();
      const authors = entry.author.map(a => a.name).join(', ');
      const updated = new Date(entry.updated).toLocaleDateString();
      const abstract = entry.summary.trim();

      // const score = entry.score; // Include the score for display (optional)
      // <div class="meta">${authors} — ${updated} — Score: ${score}</div>

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
