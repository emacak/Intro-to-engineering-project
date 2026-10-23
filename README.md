# Intro-to-engineering-project

## Run from VS Code

1. Open this folder in VS Code.
2. Install the **Live Server** extension if it is not already installed.
3. In the Explorer, right-click `index.html` and select **Open with Live Server**.
4. The Hero Academy menu opens. Choose **Start**, then select **Color in the Lines**,
   **Crush the Villain**, or **Superhero Typing**. Choose Easy, Normal, or Hard above
   the exercise cards.

The page loads the p5.js library from a CDN, so an internet connection is needed.
`MasterProj.js` is the sketch loaded by `index.html`.

Choose **Superhero Typing** from the game selection to complete five typing missions using
the on-screen keyboard. Correct taps turn green; incorrect taps turn red and play a sound.
The sound toggle and volume setting control the typing feedback sounds.

The color and villain exercises run in isolated frames so their standalone sketches
can be used without interfering with the main menu. Use **Back to games** to return.

Each exercise has Easy, Normal, and Hard variations. Passing accuracy is 70% on Easy,
85% on Normal, and 95% on Hard. Accuracy measures coloring strokes inside the lines,
correct typing taps for each phrase, or average pinch-position accuracy across the
villain targets. The difficulty selector applies to all exercises. Easy coloring uses a
simple lightning-emblem hero and larger brush; Normal (medium) features Batman with
his cowl, cape, and utility belt; Hard features Spider-Man with detailed web patterns
and a smaller brush. The villain challenge
increases from one large target, to two targets, to three smaller targets. Typing
progresses from short words and phrases, to sentences, to longer rescue briefings.
The coloring hero and the villain/rescue hero also have different custom-drawn looks
at each difficulty.

Choose **Character** from the main menu to customize a female or male superhero.
Use the arrows to change shirt, pants, shoe colors, and hair or hat styles. The
preview updates immediately, and choices are kept until the page is reloaded.

In **Color in the Lines**, drag the **Thickness** slider beneath the accuracy display
to change the brush and eraser width from 4 to 50 pixels. The cursor circle previews
the selected thickness, which stays the same when switching tools or clearing the canvas.
