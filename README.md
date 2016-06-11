# Pagerduty-Client
PagerDuty client API wrapper for **Node.js 6.x** (ES6)

## Installation
`npm install pagerduty-client --save`

## Usage

##### Setup
```js
const PagerDuty = require('pagerduty-client');

// Setup using integration/service key
const pager = new PagerDuty('12345678912345678912345678912345');
```

##### Trigger
```js
pager.trigger('Incident-1', 'Some description', data).then(id => {
  // Incident-1 triggered successfully
});
```

##### Acknowledge
```js
pager.acknowledge('Incident-1', 'Some description', data).then(() => {
  // Incident-1 is successfully acknowledged
});
```

##### Resolve
```js
pager.resolve('Incident-1', 'Some description', data).then(() => {
  // Incident-1 was resolved successfully
});
```

##### Catching errors
The API uses Promises, so any errors that occurs can be collected with *catch*.
Example:

```js
pager.resolve('Incident-1', 'Some description', data).then(() => {
  // Incident-1 was resolved successfully
}).catch(err => {
  // Some error occured
});
```

## Tests
Tests can be run with: `npm test`

## Licence
The MIT License (MIT)
