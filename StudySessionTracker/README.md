# Overview

As a software engineer, I wanted to strengthen my command of core JavaScript by building something small but complete, from the logic all the way to the user interface. My goal was to practice writing clean functions, working with arrays and objects, and connecting code to a web page.

**Study Session Tracker** is a web app written in plain JavaScript. It lets you log how long you studied each subject, see your total study time, and see a summary of minutes per subject. Sessions can be added and deleted, and the data is saved in the browser (localStorage), so it is still there after the page is refreshed. The logic lives in `tracker.js` (no browser code, so it can be tested with Node.js), and `app.js` connects that logic to the page using the DOM and events.

I created this software to learn how JavaScript handles functions, array methods (`map`, `filter`, `reduce`, `sort`), objects, DOM manipulation, event handling and browser storage, and to practice separating logic from the user interface. To run it, open `index.html` in any browser, fill in the subject, minutes and date, and click **Add session**.

[Software Demo Video](http://REPLACE-WITH-YOUR-VIDEO-LINK)

# Development Environment

* Visual Studio Code (code editor)
* Google Chrome with DevTools (running and debugging the app)
* Node.js (running the tests in `test.js` with `node test.js`)
* Git and GitHub (version control and publishing)

The software is written in **JavaScript (ES6+)**, together with plain HTML and CSS for the page layout and style. No frameworks or external libraries were used.

# Useful Websites

* [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
* [MDN - Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
* [MDN - localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
* [The Modern JavaScript Tutorial](https://javascript.info/)
* [Node.js Documentation](https://nodejs.org/en/docs)
