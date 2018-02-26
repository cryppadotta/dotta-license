
watchtest:
	nodemon --verbose --ext ts,sol --exec "truffle test --network test"

# truffle build
#	truffle migrate --network geth
# docker run ethereum/solc:stable solc --version

build-abi:
	docker run -v "$$PWD/contracts":/contracts ethereum/solc:stable --combined-json abi,devdoc,userdoc --pretty-json /contracts/LicenseCore.sol /contracts/Affiliate/AffiliateProgram.sol > ../dotlicense-cli/lib/Dotlicense.abi.json

gas-estimates:
	docker run -v "$$PWD/contracts":/contracts ethereum/solc:stable --gas /contracts/LicenseCore.sol /contracts/Affiliate/AffiliateProgram.sol

transpile:
	npm run transpile

migrate-ropsten: transpile
	NODE_ENV=ropsten truffle migrate --network ropsten

# note: use --reset if you want to start migrate from the beginning
