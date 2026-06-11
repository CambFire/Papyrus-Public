# Functional Testing Checklist

| Scenario | Expected result | Status |
|---|---|---|
| Open Home | A featured popular movie is displayed | Passed, 10 June 2026 |
| Open Popular | Popular movies load from TMDB | Passed, 10 June 2026 |
| Open Recent | Movies are sorted by release date and exclude future releases | Passed, 10 June 2026 |
| Open Search with no query | No movie results are shown until a query is entered | Passed, 10 June 2026 |
| Search by movie title | Matching results appear | Passed using `Interstellar`, 10 June 2026 |
| Select one or more genres | Results are filtered using TMDB genre IDs | Passed using `Drama`, 10 June 2026 |
| Select all genres | The unnecessary genre restriction is removed | Passed during code/build verification |
| Open a movie card | Details, genres and cast appear in the modal | Passed using `Obsession`, 10 June 2026 |
| Close details | Modal closes via close button, backdrop and Escape | Passed, 10 June 2026 |
| Add to Favorites | Movie appears in Favorites | Passed using `Obsession`, 10 June 2026 |
| Refresh after favoriting | Favorite remains saved | Passed, 10 June 2026 |
| Missing poster | Local fallback poster is configured | Passed during source/build verification |
| Mobile viewport | Navigation, grid and modal remain usable | Passed at 390 × 844, 10 June 2026 |

## Technical verification

- `npm run lint`: passed with no errors.
- `npm run build`: passed with no errors.
- Dependency audit: 0 vulnerabilities.
- Browser console during tested scenarios: no warnings or errors.
