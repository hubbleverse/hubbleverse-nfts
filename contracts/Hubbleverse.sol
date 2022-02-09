// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import { ERC1155PresetMinterPauser } from "@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol";
import { ERC1155Supply } from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import { ERC1155 } from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

contract Hubbleverse is ERC1155Supply, ERC1155PresetMinterPauser {
    using Strings for uint256;

    constructor(string memory _uri) ERC1155PresetMinterPauser(_uri) {}

    function uri(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(
            exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        string memory baseURI = super.uri(0);
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString()))
                : "";
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override (ERC1155, ERC1155PresetMinterPauser)
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
    ) internal virtual override(ERC1155Supply, ERC1155PresetMinterPauser) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
