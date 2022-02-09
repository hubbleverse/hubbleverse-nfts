import "hardhat/console.sol";

contract E1155 {
    uint public a;

    function yo() public virtual {
        console.log("in E1155");
        a++;
    }
}

contract MinterPauser is E1155 {
    // uint public a;

    function yo() public virtual override {
        console.log("in MinterPauser");
        super.yo();
        a += 3;
    }
}

contract TotalSupply is E1155 {
    function yo() public virtual override {
        console.log("in TotalSupply");
        super.yo();
        a += 7;
    }
}


contract Try is TotalSupply, MinterPauser {
    function yo() public override(TotalSupply, MinterPauser) {
        console.log("in Try");
        super.yo();
        // TotalSupply.yo();
        // a += 11;
    }
}
