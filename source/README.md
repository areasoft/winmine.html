Code is open source with desire for readability and performance. Any attributions are noted inline with the code.

View this current source version at its github page https://areasoft.github.io/winmine.html/source/index.html

## Debugging
The source here runs out of the box by opening `index.html` ([github link](https://areasoft.github.io/winmine.html/source/index.html))  

Download or pull and debug with browser tools or a configured IDE.

## Publishing
### Create Single File
Make `./winmine.html` with `help/create-single-file-winmine.html` ([link](https://areasoft.github.io/winmine.html/source/help/create-single-file-winmine.html)) which simply inserts a minified `style.css` and `script.js` into `index.html` and saves it as `winmine.html`.

  - CSS/JS: Always use multi-line comment syntax `/*` `*/` (no single line comment syntax `//`)
  - JS: Always use semicolons `;` (no "implicit semicolons"). Remember function declarations! `};`

#### Other
`help/svg-to-data-url.html` ([link](https://areasoft.github.io/winmine.html/source/help/svg-to-data-url.html)) was created to help turn svg sprites into `background-image:` strings for `style.css`, which needs to be updated if a svg file is modified.

## Notes
- I wanted to test using `100vh`/`100vw` with `grid-template-rows`/`grid-template-columns` to get the classic windowed minesweeper while still being squishy. The mine field is just a styled html grid.
- The counter and timer are also html grid layouts: Three 231-pixel based seven segment displays arranged next to each other (🤯 search `winmine.sevseg`)
- I tried to avoid dynamically creating html or css from javascript as much as possible, and just do it when necessary, like for the actual cell grid board.
- SVGs were used over png/whatever. General sprite preference: A UTF8 character, html/css art, svg


