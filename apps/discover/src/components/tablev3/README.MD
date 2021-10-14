# TABLE V3 - Div based table

## Changes upposed to tablev2:

- Supports min-width & max-width on columns
- Cells have an empty-state by default
- Automatically scrolling without the need of any special wrappers

## How to upgrade from Tablev2

1. Update the import: replace `tablev2` for `tablev3`.
2. Make sure that columns that should stretch have a "maxWidth" value in "fr" unit (1fr = 100%). Usually these would be the most important columns, like "name".
3. Make sure that every table has at least one column with the maxWidth set in 'fr'.
4. Check if it works 🤪.
5. Update the tests if necessary (the new table works with divs in stead of table/thead/tr/td, so selectors that target the table that way won't work).

> Tip: Check how it's done here: /src/pages/authorized/constant.ts
