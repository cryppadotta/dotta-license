watchtest:
	echo "Run tsc-watch in another tab"
	nodemon --verbose --ext js,ts,sol --exec "truffle test --network test"

# Note, if you want to run a specific test, you have to tell truffle to run the *transpiled* file, not the .ts file, like this:
# nodemon --verbose --ext js,ts,sol --exec "truffle test transpiled/test/ts/LicenseInventory.test.js --network test"

docker-solc-version:
	docker run ethereum/solc:stable solc --version

build-abi:
	docker run -v "$$PWD/contracts":/contracts ethereum/solc:stable --combined-json abi,devdoc,userdoc --pretty-json /contracts/LicenseCore.sol /contracts/Affiliate/AffiliateProgram.sol > ../dot-license-cli/lib/Dotlicense.abi.json

gas-estimates:
	docker run -v "$$PWD/contracts":/contracts ethereum/solc:stable --gas /contracts/LicenseCore.sol /contracts/Affiliate/AffiliateProgram.sol

asm:
	docker run -v "$$PWD/contracts":/contracts ethereum/solc:stable --asm /contracts/LicenseCore.sol > LicenseCore.asm

compile:
	npm run compile

transpile:
	npm run transpile

# note: use --reset if you want to start migrate from the beginning
migrate-ropsten: compile transpile
	NODE_ENV=ropsten truffle migrate --network ropsten

migrate-rinkeby: compile transpile
	NODE_ENV=rinkeby truffle migrate --network rinkeby

migrate-geth: compile transpile
	truffle migrate --network geth

remixd:
	remixd -s contracts/

# To submit your code to Etherscsan:
# * make flatten_source
# * cat LicenseCore.etherscan.sol | pbcopy
# * Visit their **beta** that supports the Runs (Optimizer)
# * Contract Name should **not** have .sol at the end
# * Compiler is: cat build/contracts/LicenseCore.json  | jq -r '.compiler.version'
flatten_source:
	source $HOME/anaconda/bin/activate py35 cd contracts && solidity_flattener LicenseCore.sol > ../LicenseCore.etherscan.sol

