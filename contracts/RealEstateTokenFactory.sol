// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PropertyToken.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract RealEstateTokenFactory {
    using Strings for uint256;

    struct Property {
        string propertyAddress;
        uint256 value;
        address tokenAddress;
        string[] propertyImageURLs;
    }

    struct Listing {
        address seller;
        uint256 tokenAmount;
        uint256 pricePerToken;
    }

    struct PendingProperty {
        string propertyAddress;
        uint256 value;
        address originalOwner;
        string[] propertyImageURLs;
        bool approved;
        bool exists;
    }

    Property[] public properties;
    PendingProperty[] public pendingProperties;

    address public owner;

    // Mapping: propertyId => address => amount bought from 40% pool
    mapping(uint256 => mapping(address => uint256)) private propertyBuyers;
    // Mapping: propertyId => all unique buyers
    mapping(uint256 => address[]) private buyerList;

    // Mapping: propertyId => active listings
    mapping(uint256 => Listing[]) private listings;

    constructor() {
        owner = msg.sender;
    }

    function submitPropertyForApproval(
        string memory propertyAddress,
        uint256 valueUSD,
        string[] memory _propertyImageURLs
    ) public {
        pendingProperties.push(
            PendingProperty({
                propertyAddress: propertyAddress,
                value: valueUSD,
                originalOwner: msg.sender,
                approved: false,
                exists: true,
                propertyImageURLs: _propertyImageURLs
            })
        );
    }

    function approveAndTokenizeProperty(uint256 pendingIndex) public {
        require(msg.sender == owner, "Only admin can approve");
        require(pendingIndex < pendingProperties.length, "Invalid index");

        PendingProperty storage pending = pendingProperties[pendingIndex];
        require(
            pending.exists && !pending.approved,
            "Already handled or invalid"
        );

        // Tokenization
        uint256 tokenCount = pending.value / 50;
        string memory name = string(
            abi.encodePacked("Property ", properties.length.toString())
        );
        string memory symbol = string(
            abi.encodePacked("PROP", properties.length.toString())
        );

        PropertyToken token = new PropertyToken(
            name,
            symbol,
            tokenCount,
            pending.originalOwner
        );
        properties.push(
            Property(
                pending.propertyAddress,
                pending.value,
                address(token),
                pending.propertyImageURLs
            )
        );

        pending.approved = true;
        pending.exists = false;
    }

    function disapproveProperty(uint256 pendingIndex) public {
        require(msg.sender == owner, "Only admin can disapprove");
        require(pendingIndex < pendingProperties.length, "Invalid index");

        PendingProperty storage pending = pendingProperties[pendingIndex];
        require(pending.exists, "Property already handled");

        pending.exists = false;
    }

    function buyFromSale(
        uint256 propertyId,
        uint256 tokenAmount
    ) external payable {
        require(propertyId < properties.length, "Invalid property ID");

        PropertyToken token = PropertyToken(
            properties[propertyId].tokenAddress
        );
        uint256 cost = tokenAmount * 50 * (10 ** 18); // Assuming $50 per token in wei
        require(msg.value >= cost, "Insufficient ETH sent");

        token.transferFromSale(
            msg.sender,
            tokenAmount * (10 ** token.decimals())
        );

        // Track buyer info
        if (propertyBuyers[propertyId][msg.sender] == 0) {
            buyerList[propertyId].push(msg.sender);
        }
        propertyBuyers[propertyId][msg.sender] += tokenAmount;
    }

    function listForSale(
        uint256 propertyId,
        uint256 tokenAmount,
        uint256 pricePerToken
    ) external {
        PropertyToken token = PropertyToken(
            properties[propertyId].tokenAddress
        );
        require(
            token.balanceOf(msg.sender) >=
                tokenAmount * (10 ** token.decimals()),
            "Not enough tokens"
        );

        token.transferFrom(
            msg.sender,
            address(this),
            tokenAmount * (10 ** token.decimals())
        );

        listings[propertyId].push(
            Listing(msg.sender, tokenAmount, pricePerToken)
        );
    }

    function buyFromListing(
        uint256 propertyId,
        uint256 listingIndex
    ) external payable {
        Listing storage listing = listings[propertyId][listingIndex];
        uint256 totalCost = listing.tokenAmount * listing.pricePerToken;
        require(msg.value >= totalCost, "Not enough ETH sent");

        PropertyToken token = PropertyToken(
            properties[propertyId].tokenAddress
        );
        token.transfer(
            msg.sender,
            listing.tokenAmount * (10 ** token.decimals())
        );

        payable(listing.seller).transfer(totalCost);

        // Remove listing
        listings[propertyId][listingIndex] = listings[propertyId][
            listings[propertyId].length - 1
        ];
        listings[propertyId].pop();
    }

    // --- Getters ---

    function getProperties()
        external
        view
        returns (
            string[] memory propertyAddresses,
            uint256[] memory values,
            address[] memory tokenAddresses,
            string[][] memory propertyImageURLs
        )
    {
        uint256 propertyCount = properties.length;
        propertyAddresses = new string[](propertyCount);
        values = new uint256[](propertyCount);
        tokenAddresses = new address[](propertyCount);
        propertyImageURLs = new string[][](propertyCount);

        for (uint256 i = 0; i < propertyCount; i++) {
            Property storage property = properties[i];
            propertyAddresses[i] = property.propertyAddress;
            values[i] = property.value;
            tokenAddresses[i] = property.tokenAddress;
            propertyImageURLs[i] = property.propertyImageURLs;
        }
    }

    function getBuyers(
        uint256 propertyId
    ) external view returns (address[] memory) {
        return buyerList[propertyId];
    }

    function getBuyerInfo(
        uint256 propertyId,
        address user
    ) external view returns (uint256 tokensBought) {
        return propertyBuyers[propertyId][user];
    }

    function getListings(
        uint256 propertyId
    ) external view returns (Listing[] memory) {
        return listings[propertyId];
    }

    function getPendingProperties()
        public
        view
        returns (PendingProperty[] memory)
    {
        uint256 count;
        for (uint256 i = 0; i < pendingProperties.length; i++) {
            if (pendingProperties[i].exists && !pendingProperties[i].approved) {
                count++;
            }
        }

        PendingProperty[] memory active = new PendingProperty[](count);
        uint256 index;
        for (uint256 i = 0; i < pendingProperties.length; i++) {
            if (pendingProperties[i].exists && !pendingProperties[i].approved) {
                active[index] = pendingProperties[i];
                index++;
            }
        }

        return active;
    }
}
