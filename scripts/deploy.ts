// We require the Hardhat Runtime Environment explicitly here
const hre = require("hardhat");

async function main() {
  // Get the deployer's address
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get the contract factory
  const RealEstateTokenFactory = await hre.ethers.getContractFactory("RealEstateTokenFactory");
  
  // Deploy the contract
  console.log("Deploying RealEstateTokenFactory...");
  const realEstateTokenFactory = await RealEstateTokenFactory.deploy();
  
  // Wait for deployment to complete (ethers v6 syntax)
  await realEstateTokenFactory.waitForDeployment();
  
  // Get the deployed contract address (ethers v6 syntax)
  const realEstateTokenFactoryAddress = await realEstateTokenFactory.getAddress();
  
  console.log("RealEstateTokenFactory deployed to:", realEstateTokenFactoryAddress);
  console.log("Contract owner (admin) is:", deployer.address);
  
  // Optional: Save the contract address to a file for frontend use
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/contracts";
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ 
      RealEstateTokenFactory: realEstateTokenFactoryAddress 
    }, undefined, 2)
  );

  console.log("Contract addresses saved to frontend/contracts/contract-address.json");
  console.log("Deployment complete! Verify with:");
  console.log(`npx hardhat verify --network <network> ${realEstateTokenFactoryAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
