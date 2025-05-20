const userCardTemplate = document.querySelector("[data-user-template]");
const userCardContainer = document.querySelector("[data-user-cards-container]");
const searchInput = document.querySelector("[data-search]");

//
function findMinimumDistance(e, t) {
    let r = 1 / 0;
    for (const a of t.split(";")) {
        const t = stringDifference(e, a);
        r = Math.min(r, t)
    }
    return r
}

// Function to calculate minimum distance between strings
function stringDifference(e, t) {
    if (e === t) return 0;

    // Lengths of both strings
    const r = e.length, a = t.length;

    // Absolute distance between lengths
    const n = Math.abs(r - a);

    // Max length
    const s = Math.max(r, a);

    // Counts different characters
    let o = 0;
    for (let i = 0; i < Math.min(r, a); i++) e[i] !== t[i] && o++;

    // Normalized measure of the difference between two strings:
    // 0 == equal
    // 1 == completely different
    const l = (n + o) / s;

    // 2D matrix of dimensions (r + 1) x (a + 1) (rows and columns), all elements are 0
    const c = Array.from({length: r + 1}, (() => Array(a + 1).fill(0)));

    // Normalized edit distance (Levenshtein) between strings e and t
    for (let e = 0; e <= r; e++) c[e][0] = e;
    for (let e = 0; e <= a; e++) c[0][e] = e;
    for (let i = 1; i <= r; i++)
        for (let r = 1; r <= a; r++) {
            const a = e[i - 1] === t[r - 1] ? 0 : 1;
            c[i][r] = Math.min(c[i - 1][r] + 1, c[i][r - 1] + 1, c[i - 1][r - 1] + a)
        }

    // The value c[r][a] is the value in the bottom-right cell of the matrix,
    // representing the minimum edit distance between the two strings.
    //
    // The '1.01' value is a small penalty designed to ensure that the minimum distance
    // between for example 'NGC 251' matches first with 'NGC 2516' over 'NGC 2251'
    const u = c[r][a] / s * 1.01;

    return Math.min(l, u)
}

//
searchInput.addEventListener("input", (e) => {
    results = [];
    userCardContainer.innerHTML = "";
    const t = e.target.value.toLowerCase();

    if (parseFloat(t.length) >= 4) {
        users.forEach((e) => {
            const r = t.split(" ");
            var dist;
            var n = false;
            var s = false;
            var o = false;

            if (r[0].match(/^\d/)) {
                dist = Math.sqrt(
                    Math.pow(parseFloat(r[0]) - parseFloat(e.RA), 2) +
                    Math.pow(parseFloat(r[1]) - parseFloat(e.DEC), 2)
                );
                o = true;
            } else if (r[0] === "g") {
                dist = Math.sqrt(
                    Math.pow(parseFloat(r[1]) - parseFloat(e.GLON), 2) +
                    Math.pow(parseFloat(r[2]) - parseFloat(e.GLAT), 2)
                );
                s = true;
            } else {
                let rClean = t
                    .replace(/\s/g, "")
                    .replace("_", "")
                    .replace("-", "")
                    .replace("+", "p")
                    .replace(".", "");
                if (e.fnames.includes(rClean.slice(0, 3))) {
                    dist = findMinimumDistance(rClean, e.fnames);
                    n = true;
                }
            }

            if (dist < 5) {
                e.distance = dist;
                e.show_e_1 = n;
                e.show_e_2 = s;
                e.show_e_3 = o;
                results.push(e);
            }
        });

        results.sort((e, t) => e.distance - t.distance);
        results = results.slice(0, 9);

        // console.log(results);

        results.forEach((e) => {
            if (e.show_e_1) {
                userCardContainer.append(e.element_1);
            } else if (e.show_e_2) {
                userCardContainer.append(e.element_2);
            } else if (e.show_e_3) {
                userCardContainer.append(e.element_3);
            }
        });
    }
})

// Fetch and decompress data
fetch("clusters.json.gz")
    .then(e => e.arrayBuffer())
    .then(e => {
        const t = pako.ungzip(new Uint8Array(e), {to: "string"});
        const r = JSON.parse(t);

        users = r.map(e => {
            const t = userCardTemplate.content.cloneNode(!0).children[0];
            const r = userCardTemplate.content.cloneNode(!0).children[0];
            const a = userCardTemplate.content.cloneNode(!0).children[0];

            const n = t.querySelector("[data-header]");
            const s = r.querySelector("[data-header]");
            const o = a.querySelector("[data-header]");

            const l = t.querySelector("[data-body_1]");
            const c = r.querySelector("[data-body_2]");
            const u = a.querySelector("[data-body_3]");

            const i = e.F.split(";")[0];
            t.querySelector("a").setAttribute("href", "./_clusters/" + i);
            r.querySelector("a").setAttribute("href", "./_clusters/" + i);
            a.querySelector("a").setAttribute("href", "./_clusters/" + i);

            n.textContent = e.N;
            s.textContent = e.N;
            o.textContent = e.N;

            l.textContent = e.F.split(";").slice(1, 3);
            c.textContent = "G (" + e.L + ", " + e.B + ")";
            u.textContent = "E (" + e.R + ", " + e.D + ")";

            console.log(e.F)

            return {
                fnames: e.F,
                GLON: e.L,
                GLAT: e.B,
                RA: e.R,
                DEC: e.D,
                element_1: t,
                element_2: r,
                element_3: a
            };
        });
    })
    .catch(e => console.error("Error fetching or decompressing file:", e));
