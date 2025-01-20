// routes/insurances.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const Insurance = require('../models/Insurance');
const User = require('../models/User');
const auth = require('../middleware/auth');
const request = require('request');
const { Types } = require('mongoose');

// const { web3, insuranceContract } = require('../contract'); // Import your contract instance

// bct
const Web3 = require('web3').default;
// const provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
const web3 = new Web3('http://127.0.0.1:7545'); // For Ganache



const abi = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../build', 'InsuranceContract_abi.json'), 'utf8'));
const contractAddress = fs.readFileSync(path.resolve(__dirname, '../build', 'InsuranceContract_address.txt'), 'utf8');
// const contract = new web3.eth.Contract(abi, contractAddress);

const insuranceContract = new web3.eth.Contract(abi, contractAddress);



// Get All Insurances
router.get('/', async (req, res) => {
  try {
    const insurances = await Insurance.find();
    res.json(insurances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Insurance (Admin only)
router.post('/', async (req, res) => {
  // Implement admin check if necessary
  const { title, description, price, rainfallThreshold, termsAndConditions } = req.body;

  const insurance = new Insurance({
    title,
    description,
    price,
    rainfallThreshold,
    termsAndConditions,
  });

  try {
    const newInsurance = await insurance.save();
    res.status(201).json(newInsurance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// View Insurance Details
router.get('/:id', async (req, res) => {
  try {
    const insurance = await Insurance.findById(req.params.id);
    if (!insurance) return res.status(404).json({ message: 'Insurance not found' });
    res.json(insurance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Purchase Insurance
// Purchase Insurance
router.post('/:id/purchase', auth, async (req, res) => {
  try {
    const insurance = await Insurance.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!insurance) return res.status(404).json({ message: 'Insurance not found' });

    // Temporary payment simulation
    const paymentSuccess = true; // Simulate success

    if (paymentSuccess) {
      // Update user's purchased insurances
      // if (user.purchasedInsurances.includes(insurance._id)) {
      //   return res.status(400).json({ message: 'You already purchased this insurance' });
      // }
      user.purchasedInsurances.push(insurance._id);
      insurance.purchasedBy.push(user._id);

      await user.save();
      await insurance.save();

      // Now, interact with the smart contract
      const accounts = await web3.eth.getAccounts();
      const fromAddress = accounts[0]; // For simplicity, use the first account


      // we combine with user id to generate
      // unique hash id of efverypurchase [insurancID + userID] hash
      const insuranceIdHash = web3.utils.sha3(insurance._id.toString() + user._id.toString());

      const userIdBuffer = Buffer.from(new Types.ObjectId(req.user.id).id) //get raw bytes


      const humidityThreshold = insurance.rainfallThreshold;

      // Call purchaseInsurance function on the contract
    //   if (!insuranceIdHash || typeof humidityThreshold !== 'number') {
    //     return res.status(400).json({ message: 'Invalid data provided for contract interaction' });
    // }
    // console.log({ insuranceIdHash, humidityThreshold, fromAddress });
    // console.log('Contract Address:', contractAddress);
    // console.log('Contract ABI:', abi);
    

      await insuranceContract.methods.purchaseInsurance(
        insuranceIdHash,
        '0x' + userIdBuffer.toString('hex'),
        humidityThreshold
      ).send({
        from: fromAddress,
        gas: 200000
      });

      

      res.json({ message: 'Insurance purchased successfully' });
    } else {
      res.status(400).json({ message: 'Payment failed' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


function getWeatherData() {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: 'https://open-weather13.p.rapidapi.com/city/nashik/EN',
      headers: {
        'x-rapidapi-key': '7c459437b5mshb60e08f5a211dbcp1582a7jsn05db932d4db2',
        'x-rapidapi-host': 'open-weather13.p.rapidapi.com',
      },
    };

    request(options, function (error, response, body) {
      if (error) return reject(error);

      try {
        const data = JSON.parse(body);
        resolve(data); // Resolve parsed weather data
      } catch (parseError) {
        reject(parseError); // Handle JSON parsing errors
      }
    });
  });
}

// Claim Insurance

// Claim Insurance
// Claim Insurance
router.post('/:id/claim', auth, async (req, res) => {
  try {
    const insurance = await Insurance.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!insurance) return res.status(404).json({ message: 'Insurance not found' });

    // Check if the user has purchased the insurance
    if (!user.purchasedInsurances.includes(insurance._id)) {
      return res.status(403).json({ message: 'You have not purchased this insurance' });
    }

    // Fetch weather data (humidity)
    const weatherData = await getWeatherData();
    const currentHumidity = weatherData.main.humidity; // Extract humidity

    const accounts = await web3.eth.getAccounts();  
    const fromAddress = accounts[0]; // Use the first account for transactions

    const userIdBuffer = Buffer.from(new Types.ObjectId(req.user.id).id); // Get the raw bytes

    // we combine with user id to generate
      // unique hash id of efverypurchase [insurancID + userID] hash
      const insuranceIdHash = web3.utils.sha3(insurance._id.toString() + user._id.toString());

    // Call claimInsurance function on the contract
    const txReceipt = await insuranceContract.methods.claimInsurance(
      insuranceIdHash,
      '0x' + userIdBuffer.toString('hex'), // Convert to hex string
      currentHumidity
    ).send({
      from: fromAddress,
      gas: 200000
    });

    // Extract events from receipt
    const events = txReceipt.events;
    if (events && events.ClaimResult) {
      const claimEvent = events.ClaimResult;
      const approved = claimEvent.returnValues.approved;
      // Convert BigInt values to strings
      const currentHumidity = claimEvent.returnValues.currentHumidity.toString();
      const humidityThreshold = claimEvent.returnValues.humidityThreshold.toString();
      if (approved) {
        res.json({ message: 'Claim approved', currentHumidity,
          humidityThreshold });
      } else {
        res.json({
          message: 'Claim denied due to humidity threshold',
          currentHumidity,
          humidityThreshold
        });
      }
    } else {
      res.status(500).json({ message: 'No ClaimResult event found in transaction receipt' });
    }
  } catch (err) {
    console.error('Error in claim insurance:', err);
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;




// router.post('/:id/claim', async (req, res) => {
//   try {
//     const insurance = await Insurance.findById(req.params.id);
//     const user = await User.findById("6789d1da7d809030ce0c67d1");

//     if (!insurance) return res.status(404).json({ message: 'Insurance not found' });

//     // Check if the user has purchased the insurance
//     if (!user.purchasedInsurances.includes(insurance._id)) {
//       return res.status(403).json({ message: 'You have not purchased this insurance' });
//     }

//     // Fetch weather data (humidity)
//     const weatherData = await getWeatherData();
//     const currentHumidity = weatherData.main.humidity; // Extract humidity
//     const humidityThreshold = insurance.rainfallThreshold; // Use rainfallThreshold to represent humidityThreshold

//     if (currentHumidity >= humidityThreshold) {
//       res.json({ message: 'Claim approved', humidity: currentHumidity });
//     } else {
//       res.json({
//         message: 'Claim denied due to humidity threshold',
//         currentHumidity,
//         humidityThreshold,
//       });
//     }
//   } catch (err) {
//     console.error('Error in claim insurance:', err.message);
//     res.status(500).json({ message: err.message });
//   }
// });



// router.post('/:id/purchase', auth, async (req, res) => {
//   try {
//     const insurance = await Insurance.findById(req.params.id);
//     const user = await User.findById(req.user.id);

//     if (!insurance) return res.status(404).json({ message: 'Insurance not found' });

//     // Temporary payment simulation
//     // In a real application, integrate with a payment gateway
//     const paymentSuccess = true; // Simulate success

//     if (paymentSuccess) {
//       // Update user's purchased insurances
//       user.purchasedInsurances.push(insurance._id);
//       insurance.purchasedBy.push(user._id);

//       await user.save();
//       await insurance.save();

//       res.json({ message: 'Insurance purchased successfully' });
//     } else {
//       res.status(400).json({ message: 'Payment failed' });
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
