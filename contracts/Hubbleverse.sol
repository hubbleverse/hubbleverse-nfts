// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import { ERC1155PresetMinterPauserUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/presets/ERC1155PresetMinterPauserUpgradeable.sol";
import { ERC1155SupplyUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import { ERC1155Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

contract Hubbleverse is ERC1155SupplyUpgradeable, ERC1155PresetMinterPauserUpgradeable {
    using Strings for uint256;

    uint256[50] private __gap;

    function initialize(string memory _uri) public override {
        super.initialize(_uri);
    }

    function uri(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(
            exists(tokenId),
            "Hubbleverse: URI query for nonexistent token"
        );
        string memory baseURI = super.uri(0);
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString()))
                : "";
    }

    function mintToBatch(
        address[] memory to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "Hubbleverse: must have minter role to mint");
        for (uint i = 0; i < to.length; i++) {
            _mint(to[i], id, amount, data);
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override (ERC1155Upgradeable, ERC1155PresetMinterPauserUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function setURI(string memory newuri) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Hubbleverse: must have admin role to set uri");
        _setURI(newuri);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155SupplyUpgradeable, ERC1155PresetMinterPauserUpgradeable) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
