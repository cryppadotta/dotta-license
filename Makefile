
watchtest:
	nodemon --verbose --ext ts,sol --exec "truffle test --network test"

# until nodemon --verbose --ext ts,sol --exec "truffle test --network test"; do echo "Crashed $?. Respawning.." >&2; sleep 1; done
