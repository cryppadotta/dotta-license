
watchtest:
	echo "Run tsc-watch in another tab"
	nodemon --verbose --ext js,ts,sol --exec "truffle test --network test"

# Note, if you want to run a specific test, you have to tell truffle to run the *transpiled* file, not the .ts file, like this:
# nodemon --verbose --ext js,ts,sol --exec "truffle test transpiled/test/ts/LicenseInventory.test.js --network test"

# truffle build
#	truffle migrate --network geth
# docker run ethereum/solc:stable solc --version

build-abi:
	docker run -v "$$PWD/contracts":/contracts ethereum/solc:stable --combined-json abi,devdoc,userdoc --pretty-json /contracts/LicenseCore.sol /contracts/Affiliate/AffiliateProgram.sol > ../dot-license-cli/lib/Dotlicense.abi.json

gas-estimates:
	docker run -v "$$PWD/contracts":/contracts ethereum/solc:stable --gas /contracts/LicenseCore.sol /contracts/Affiliate/AffiliateProgram.sol

compile:
	npm run compile

transpile:
	npm run transpile

migrate-ropsten: compile transpile
	NODE_ENV=ropsten truffle migrate --network ropsten

migrate-rinkeby: compile transpile
	NODE_ENV=rinkeby truffle migrate --network rinkeby

remixd:
	remixd -s contracts/

# flatten_source:
# 	source $HOME/anaconda/bin/activate py27 cd contracts && solidity_flattener LicenseCore.sol

# note: use --reset if you want to start migrate from the beginning
