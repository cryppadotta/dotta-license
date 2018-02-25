const Transport = require('@ledgerhq/hw-transport-node-hid').default;
const AppEth = require('@ledgerhq/hw-app-eth').default;
const getAddress = async () => {
  console.log('Testing Ledger Hardware...');
  console.log('supported:', await Transport.isSupported());
  console.log('Devices:');
  console.log(await Transport.list());
  const transport = await Transport.create();
  const eth = new AppEth(transport);

  // note: this path matches MEWs: m/44'/60'/0'
  const result = await eth.getAddress("m/44'/60'/0'/0");
  return result;
};
getAddress().then(a => console.log(a));
