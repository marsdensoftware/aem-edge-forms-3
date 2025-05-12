This document discusses two approaches to paging search results.

# Plain JS paging

We could implement paging logic ourselves in plain JavaScript. A complete working proof of concept of this can be made live by using the Universal Editor to add a "Custom Search" block to the edge-forms-oscar site in AEM. The PoC includes AJAX paging and optional infinite scroll but does not address some usability concerns.

There are essentially zero obstacles to this approach; creating a model and block in AEM and adding code for that block works as intended. However, rven a simple feature like paging requires a significant amount of boilerplate. The more code we write, the more potential for errors - average bugs per line of code is usually roughly constant.

In general, we should look at avoiding unecessary page renders by creating and managing DOM elements outside the page hierarchy and then adding them when they are ready. Specific to paging, depending on the scope of use, we may have to implement virtual paging to acheive high performance.

The new(ish) Observer API makes implementing basic infinite scroll fairly easy. It's not clear whether the use of a dummy element at the bottom of the page of a `:last-child` selector is better from a technical perspective.

There are some usability concerns, for example device/browser support, screen reader support with dynamically injected elements, and resuming the user's last page position. The PoC does not cover these, but note that they would have to be manually ensured by us in a plain JavaScript approach.

In the case of resuming page position on reload, there is no standardised approach. One option is to store the current view position in query parameters and dynamically load content in both directions (up/down the page). This depends somewhat on the backend API available.

# React

In principle, using React would avoid some usability and compatibility concerns, allow us to leverage existing UI libraries that implement common functionality, and reduce the developer effort involved.

In practice, I ran into a number of technical issues trying to integrate React.

Headful and hybrid AEM don't allow access to the main HTML page element, and replacing it with React would remove all AEM content. So, where should our React root be? There are two initial options:

1. In a custom block that contains only the content to be handled by React.
2. In a custom block similar to 1., except the block is hidden and the content is rendered out of line using React portal.

Both of these options allow for anyone with authoring access in the UE to break the page by removing the React block.

Further, this is not typically how React is used and is likely to cause compatibility issues with some React libraries. We would have to be careful to maintain the normal page flow with a combination of React and styling supported by AEM.


We wouldn't be able to rely on the AEM workflow, we have to transpile JSX ahead of time in our own build step. This is not a signficant issue on its own, but it means that we have to find somewhere to inject an input map to allow each page to load React.

At the moment, injecting an import map into the AEM head HTML does not work - perhaps it is getting stripped. We need to find somewhere else to successfully inject this for a React-based approach to work.

### Misc technical comments

* We can use ordinary imports
* The AEM script calls `decorate()` once per block instance, but I haven't worked out exactly when yet
* `decorate()` can be `async`
* Some modern looping features like `for .. of ..` trigger an esbuild error over performance concerns and require changes to the project config
