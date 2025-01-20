const path = require('path');
const fs = require('fs');
const solc = require('solc'); // Now uses the installed solc@0.8.0
const Web3 = require('web3').default;

async function main() {
    try {
        console.log('Using solc version:', solc.version());
        
        // Read the contract source code
        const contractPath = path.resolve(__dirname, '..', 'contracts', 'InsuranceContract.sol');
        const source = fs.readFileSync(contractPath, 'utf8');

        console.log('Reading source file...');
        console.log('Contract source loaded successfully');

        console.log('Compiling contract...');
        const input = {
            language: 'Solidity',
            sources: {
                'InsuranceContract.sol': {
                    content: source,
                },
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['*'],
                    },
                },
                optimizer: {
                    enabled: true,
                    runs: 200,
                },
            },
        };

        const compiled = JSON.parse(solc.compile(JSON.stringify(input)));


        // console.log('Compiled with Solidity version:', compiled.compiler.version);
        // Check for compilation errors
        if (compiled.errors) {
            const hasError = compiled.errors.some(error => error.severity === 'error');
            if (hasError) {
                compiled.errors.forEach(error => {
                    console.error(error.formattedMessage);
                });
                throw new Error('Contract compilation failed');
            } else {
                console.log('Compilation warnings:');
                compiled.errors.forEach(error => {
                    console.warn(error.formattedMessage);
                });
            }
        }

        const contractFile = 'InsuranceContract.sol';
        const contractName = 'InsuranceContract';

        console.log('Getting contract binary and ABI...');
        const contract = compiled.contracts[contractFile][contractName];
        const bytecode = contract.evm.bytecode.object;
        const abi = contract.abi;

        // Save ABI and bytecode
        const buildDir = path.resolve(__dirname, '..', 'build');
        if (!fs.existsSync(buildDir)) {
            fs.mkdirSync(buildDir);
        }

        fs.writeFileSync(
            path.resolve(buildDir, 'InsuranceContract_abi.json'), 
            JSON.stringify(abi, null, 2)
        );
        fs.writeFileSync(
            path.resolve(buildDir, 'InsuranceContract_bytecode.json'), 
            bytecode
        );

        console.log('Contract artifacts saved to build directory');

        // Deploy the contract
        console.log('Connecting to network...');

        // Create Web3 provider
        const provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
        const web3 = new Web3(provider);

        // Check connection
        const isListening = await web3.eth.net.isListening();
        if (!isListening) {
            throw new Error('Could not connect to Ganache. Make sure it is running.');
        }
        console.log('Connected to network');

        const accounts = await web3.eth.getAccounts();
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found in the network');
        }

        const fromAccount = accounts[0];
        console.log('Deploying from account:', fromAccount);

        const balance = await web3.eth.getBalance(fromAccount);
        console.log('Account balance:', web3.utils.fromWei(balance, 'ether'), 'ETH');

        const insuranceContract = new web3.eth.Contract(abi);
        console.log('Deploying contract...');

        const deployedContract = await insuranceContract.deploy({
            data: '0x' + bytecode
        }).send({
            from: fromAccount,
            gas: 3000000,
            gasPrice: web3.utils.toWei('20', 'gwei')
        });

        console.log('Contract deployed successfully at address:', deployedContract.options.address);

        fs.writeFileSync(
            path.resolve(buildDir, 'InsuranceContract_address.txt'), 
            deployedContract.options.address
        );

    } catch (error) {
        console.error('Error occurred:', error);
        process.exit(1);
    }
}

main();