export default netId => {
  switch (`${netId}`) {
    case '1':
      return 'mainnet';
      break;
    case '2':
      return 'morden';
      break;
    case '3':
      return 'ropsten';
      break;
    case '4':
      return 'rinkeby';
      break;
    case '42':
      return 'kovan';
      break;
    default:
      return 'unknown';
  }
};
