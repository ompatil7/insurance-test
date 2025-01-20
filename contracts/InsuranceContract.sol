// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InsuranceContract {

    struct Insurance {
        bytes12 mongoDB_userId; // Store MongoDB ObjectId (12 bytes)
        uint256 humidityThreshold;
        bool claimed;
    }

    mapping(bytes32 => Insurance) public insurances;

    event InsurancePurchased(bytes12 indexed mongoDB_userId, bytes32 insuranceId);
    event ClaimResult(bytes12 indexed mongoDB_userId, bytes32 insuranceId, bool approved, uint256 currentHumidity, uint256 humidityThreshold);  

    function purchaseInsurance(bytes32 insuranceId, bytes12 mongoDB_userId, uint256 humidityThreshold) public {
        require(humidityThreshold > 0, "Invalid humidity threshold");
        require(insuranceId != bytes32(0), "Invalid insurance ID");
        require(insurances[insuranceId].mongoDB_userId == bytes12(0), "Insurance already purchased");

        Insurance storage insurance = insurances[insuranceId];
        insurance.mongoDB_userId = mongoDB_userId;
        insurance.humidityThreshold = humidityThreshold;
        insurance.claimed = false;

        emit InsurancePurchased(mongoDB_userId, insuranceId);
    }

    function claimInsurance(bytes32 insuranceId, bytes12 mongoDB_userId, uint256 currentHumidity) public {
        Insurance storage insurance = insurances[insuranceId];
        require(insurance.mongoDB_userId == mongoDB_userId, "You have not purchased this insurance");
        require(!insurance.claimed, "Insurance already claimed");

        bool approved = false;
        if (currentHumidity >= insurance.humidityThreshold) {
            approved = true;
            insurance.claimed = true; // Mark as claimed
        }

        

        emit ClaimResult(mongoDB_userId, insuranceId, approved, currentHumidity, insurance.humidityThreshold);
    }
}