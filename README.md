# Web Technology Assignment 4 — Markdown Slide Maker

## About the project
This is a small browser-based slide maker made with HTML, CSS and JavaScript. Slides are written in one Markdown text area. The application separates slides whenever it finds `---` on a line by itself.

## How to run
1. Extract the ZIP file.
2. Open `index.html` in Chrome, Edge or Firefox.
3. Start writing in the Markdown Editor. The Live Preview updates while you type.
4. Press **Save Slides** or use **Ctrl + S** to store the presentation in browser local storage.
5. Press **Present** to open presentation mode.

No installation or internet connection is required.

## Features included
- Create a new presentation.
- Add another slide with the **Add Slide** button.
- Edit Markdown in the editor and see a live preview.
- Save the complete Markdown presentation in `localStorage`.
- Load the saved presentation automatically when the page is opened again in the same browser.
- Present slides in a separate presentation view.
- Previous and next slide controls in both preview and presentation mode.
- Previous is disabled on the first slide; next is disabled on the last slide.
- Full-screen control with an enter/exit accessible label.
- Keyboard shortcuts: Left Arrow, Right Arrow, F11 and Ctrl + S.
- Slide counter at the bottom in `current / total` format.

## Markdown example
```md
# Welcome
## My assignment#4 for web technology course.
Write slides in Markdown on the left.

---

# Slide 2
## Some formatting
- **Bold** text
- *Italic* text
- `inline code`

---

# The End
Thank you!
```

## Storage note
The project uses the browser's `localStorage`. Saved slides remain available after closing and reopening the browser, as long as the same browser profile is used and its site data is not cleared. Browser private/incognito sessions may clear the data when closed.

## Files
- `index.html` — page structure and application controls.
- `style.css` — page layout and visual design.
- `script.js` — Markdown processing, navigation, keyboard shortcuts and browser storage.
- `sample-presentation.md` — example presentation content.
