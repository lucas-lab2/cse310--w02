# Overview

As a software engineer, I wanted to strengthen my command of core JavaScript by building something small but complete, from the logic all the way to the user interface. My goal was to practice writing clean functions, working with arrays and objects, and connecting code to a web page.

**Study Session Tracker** is a web app written in plain JavaScript. It lets you log how long you studied each subject, see your total study time, and see a summary of minutes per subject. Sessions can be added and deleted, and the data is saved in the browser (localStorage), so it is still there after the page is refreshed. The logic lives in `tracker.js` (no browser code, so it can be tested with Node.js), and `app.js` connects that logic to the page using the DOM and events.

I created this software to learn how JavaScript handles functions, native array methods (`filter`, `reduce`, `sort`), recursion, objects, DOM manipulation, event handling and browser storage, and to practice separating logic from the user interface. It also uses the Day.js library, loaded from a CDN, to format dates. To run it, open `index.html` in any browser, fill in the subject, minutes and date, and click **Start Tracking**.

[Software Demo Video](https://www.youtube.com/watch?v=uoIZ71LSc-Y)

# Development Environment

- Visual Studio Code (code editor)
- Google Chrome with DevTools (running and debugging the app)
- Node.js (running the tests in `test.js` with `node test.js`)
- Git and GitHub (version control and publishing)

The software is written in **JavaScript (ES6+)**, together with plain HTML and CSS for the page layout and style. The only external library is [Day.js](https://day.js.org/), loaded from a CDN, for date formatting. No frameworks were used.

# Useful Websites

- [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [MDN - Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN - localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [The Modern JavaScript Tutorial](https://javascript.info/)
- [Day.js Documentation](https://day.js.org/docs/en/display/format)
- [Node.js Documentation](https://nodejs.org/en/docs)
