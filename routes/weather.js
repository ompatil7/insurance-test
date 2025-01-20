const express = require('express');
const router = express.Router();
const request = require('request');

function getRainfallData() {
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
        resolve(data); // Resolve the parsed API response
      } catch (parseError) {
        reject(parseError); // Handle JSON parsing errors
      }
    });
  });
}

router.get('/weather', async (req, res) => {
  try {
    // Fetch rainfall data from API
    const currentRainfall = await getRainfallData();
    console.log(currentRainfall);

    res.status(200).json({ rainfallData: currentRainfall });
  } catch (err) {
    console.error('Error fetching weather data:', err.message);
    res.status(500).json({ message: 'Failed to fetch weather data' });
  }
});

module.exports = router;
