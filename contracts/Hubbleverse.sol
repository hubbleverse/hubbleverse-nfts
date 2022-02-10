// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import { ERC1155PresetMinterPauserUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/presets/ERC1155PresetMinterPauserUpgradeable.sol";
import { ERC1155SupplyUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import { ERC1155Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

contract Hubbleverse is ERC1155SupplyUpgradeable, ERC1155PresetMinterPauserUpgradeable {
    using Strings for uint256;

    bytes32 public constant SET_URI_ROLE = keccak256("SET_URI_ROLE");

    mapping(uint256 => string) _uri;

    uint256[50] private __gap;

    function initialize(string memory uri_) public override {
        super.initialize(uri_);
    }

    function uri(uint256 id)
        public
        view
        override
        returns (string memory)
    {
        return _uri[id];
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

    function setURI(uint256 id, string memory newuri) external {
        require(hasRole(SET_URI_ROLE, _msgSender()), "Hubbleverse: must have SET_URI_ROLE");
        _uri[id] = newuri;
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
