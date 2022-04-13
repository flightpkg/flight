# TraceError
[![Build Status](https://travis-ci.org/bluejamesbond/TraceError.js.svg?branch=master)](https://travis-ci.org/bluejamesbond/TraceError.js)

```bash
npm install trace-error --save
```

```js
import TraceError from 'trace-error';

global.TraceError = TraceError; // expose globally (optional)

throw new TraceError('Could not set status', srcError, ...otherErrors);
```

#### Compatibility
Node 0.11 -> 5.X; not tested on browsers

## Output
  
![](https://www.dropbox.com/s/gbfoh4sr9p24hsg/Screenshot%202016-03-01%2022.26.27.png?dl=1)    

## Functions

#### `TraceError#cause(index = 0)`
Get the cause at the specified `index`

#### `TraceError#causes()`
Get a list of all the causes

#### `TraceError@stack`
Get the long stack (base error with chained cause errors)

#### `TraceError@messages`
Get a list of all the messages

#### `static TraceError@globalStackProperty`
Attribute used to aggregate the long stack. Can be further customized via. inheritance and/or prototype modification

#### `static TraceError@indent`
Spaces used to indent long stack

## More Detailed Examples

More detailed examples are in the `/tests` folder

### ES5/6 Cross-compatibility
Extend the TraceError as such in order to maximize compatibility with ES5; additionally, override the `toJSON` as necessary

```js
export class MyAppTraceError extends TraceError {
  constructor(...args) {
    super(...args);

    // not ideal
    Object.defineProperty(this, 'stack', {
      get: () => super.stack
    });
  }
}
```