# Plain JS paging

Even a simple feature like this requires a significant amount of boilerplate, along with the associated potential for error in the details.

Depending on the scope of use, we may have to implement virtual paging to acheive high performance.

In the case of infinite scroll, there isn't a well-accepted solution to retaining the user's position on the page in case of tab reload. One option is to use query parameters and bidirectional loading - i.e. load the chunk in the window on reload, and load results up or down as the user moves around.

The new(ish) Observer API makes implementing basic infinite scroll fairly easy. It's not clear whether the use of a dummy element at the bottom of the page of a `:last-child` selector is better.



### Misc

* We can use ordinary imports
* `decorate()` gets called once per block instance, haven't worked out exactly when yet
* `decorate()` can be `async`
* Some modern looping features like `for .. of ..` trigger an esbuild error over performance concerns and require changes to the project config
