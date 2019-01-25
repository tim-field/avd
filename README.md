get a copy of `.env` from someone

`yarn install`

`npm run dev`

### style notes
For future reference...
#### UI MODE
- currently set with an ugly button but should be more subtle, and use state
- if we keep track of user would be nice to store their stetting if they change it. (local storage?)
- only pseudo themable at this point, as colours are set in the _variables.scss file.

#### style notes
- currently using scss but NOT modules, so classes are globally scoped
- sizes derive from base rem unit set in 'html'
- css variables are set byt default, then again by the data-theme attribute on html. CHanging this (ie, via js) will apply the them variables.
- thus, colours need to be applied using a css variable. eg:  `var(--textColor)`
- I'm using a mixin to apply a fallback if the css variabl doesnt exist.