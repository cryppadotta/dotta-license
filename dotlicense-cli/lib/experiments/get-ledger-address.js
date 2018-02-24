const Transport = require('@ledgerhq/hw-transport-node-hid').default;
const AppEth = require('@ledgerhq/hw-app-eth').default;
const getAddress = async () => {
  console.log('Testing Ledger Hardware...');
  console.log('supported:', await Transport.isSupported());
  console.log('Devices:');
  console.log(await Transport.list());
  const transport = await Transport.create();
  const eth = new AppEth(transport);
  const result = await eth.getAddress("44'/60'/0'");
  return result;
};
getAddress().then(a => console.log(a));
