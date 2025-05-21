const userCardTemplate = document.querySelector("[data-user-template]");


document.addEventListener("DOMContentLoaded", () => {
    fetch("clusters.json.gz")
        .then(response => response.arrayBuffer())
        .then(buffer => {
            const decompressed = pako.ungzip(new Uint8Array(buffer), { to: "string" });
            const data = JSON.parse(decompressed);

            users = data.map(entry => {
                const template = userCardTemplate.content.cloneNode(true);
                const elements = ["element_1", "element_2", "element_3"].map((key, i) => {
                    const clone = template.cloneNode(true).children[0];
                    const header = clone.querySelector("[data-header]");
                    const body = clone.querySelector(`[data-body_${i + 1}]`);
                    const href = `./_clusters/${entry.F.split(";")[0]}`;
                    
                    clone.querySelector("a").setAttribute("href", href);
                    header.textContent = entry.N;

                    if (i === 0) body.textContent = entry.F.split(";").slice(1, 3).join(", ");
                    if (i === 1) body.textContent = `G (${entry.L}, ${entry.B})`;
                    if (i === 2) body.textContent = `E (${entry.R}, ${entry.D})`;

                    return { key, element: clone };
                });

                return {
                    fnames: entry.F,
                    GLON: entry.L,
                    GLAT: entry.B,
                    RA: entry.R,
                    DEC: entry.D,
                    ...Object.fromEntries(elements.map(({ key, element }) => [key, element]))
                };
            });
        })
        .catch(error => console.error("Error fetching or decompressing data:", error));
});
