info:
	node bin/dot-license-cli.js info --inventory

withdraw-production:
	env NODE_ENV=mainnet node bin/dot-license-cli.js withdrawBalance --ledger

create-promotional-purchase:
	echo createPromotionalPurchase <productId> <numCycles> <assignee> <attributes>
	echo node bin/dot-license-cli.js createPromotionalPurchase 1 1 <ADDRESS> <ATTRIBUTES> --ledger
