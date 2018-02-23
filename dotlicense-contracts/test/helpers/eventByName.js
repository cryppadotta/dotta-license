import { chain } from 'lodash/chain';
export default (logs, eventName, nth = 0) => {
  return _.chain(logs)
    .filter(l => l.event === eventName)
    .get(nth)
    .value();
};
