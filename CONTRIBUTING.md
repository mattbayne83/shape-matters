# Contributing to org-shape

Thanks for your interest in contributing! This project benefits from community-sourced organizational data and research.

## Adding a Company to the Reference Library

The most impactful contribution is adding well-sourced company data. Here's how:

### Requirements for a company submission

Every company entry needs:

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Company name |
| `era` | Yes | Year or time period for the data |
| `levels` | Yes | Number of management layers from frontline IC to CEO |
| `employees` | Yes | Total headcount |
| `industry` | Yes | Industry classification |
| `archetype` | Yes | One of: `flat`, `tech`, `flattened`, `experimental`, `energy` |
| `notes` | Yes | Brief description of why this company is interesting |
| `source` | Yes | Where the data comes from (see below) |
| `sourceUrl` | Recommended | Link to the primary source |

### Accepted data sources

We prioritize verifiable, public data:

1. **SEC filings (10-K, DEF 14A)** — Gold standard for employee counts and organizational data
2. **levels.fyi** — Reliable for tech company leveling systems
3. **Published case studies** — HBS, INSEAD, MIT Sloan, ResearchGate
4. **Company handbooks/career pages** — When they document leveling
5. **Reputable news reporting** — Fortune, WSJ, Bloomberg, CNBC for restructuring events

We do NOT accept:
- Unverified LinkedIn estimates without supporting evidence
- Glassdoor reviews as a sole source
- Personal anecdotes without corroboration

### How to count "levels"

"Levels" means **management layers from frontline individual contributor to CEO**. This is NOT:
- The number of pay grades (e.g., Microsoft's 59-67 system is ~8 management layers)
- The number of job titles
- The depth of any one function

For companies with variable depth across functions, use the **most common path** and note the variance.

### Submitting via Pull Request

1. Fork the repo
2. Add your company to `src/data/referenceCompanies.ts`
3. Place it in the correct archetype section (comments mark each section)
4. Choose a unique `id` (lowercase, hyphenated)
5. Pick a `color` that doesn't conflict with existing entries
6. Submit a PR with:
   - The company data
   - A brief explanation in the PR description of why this company is interesting for org-shape research
   - Links to your sources

### Submitting via GitHub Issue

If you don't want to write code, open an issue with the "Company Submission" label and include:
- Company name and year
- Estimated org levels (with reasoning)
- Employee count (with source)
- Why this company is interesting for the dataset

## Other Contributions

### Research articles
Articles are planned as TSX files using the `<Prose>` wrapper for typography. If you want to write about org-shape theory, open an issue first to discuss the topic.

### Bug fixes and improvements
Standard fork-and-PR workflow. Run `npm run build` and `npm run lint` before submitting.

### Feature requests
Open an issue describing the feature and why it would benefit org-shape research.

## Development

```bash
npm install
npm run dev       # Start dev server
npm run build     # TypeScript check + production build
npm run lint      # ESLint
```

## Code of Conduct

Be respectful. This is a research project — we value intellectual rigor and good-faith discussion about organizational design.
