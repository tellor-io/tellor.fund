advanceTime = (time) => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [time],
            id: new Date().getTime()
        }, (err, result) => {
            if (err) { return reject(err); }
            return resolve(result);
        });
    });
}


module.exports = function(callback) {
	    advanceTime(864000000 * 2).then(function(){
	    		console.log("time travelling")
	    		process.exit()	
	    });


}