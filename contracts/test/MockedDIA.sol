// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;


import { IERC20 } from "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { IERC20Metadata } from "../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import { LibContext } from "../libraries/LibContext.sol";

/**
 * @dev Facade implementation of ERC20 token.
 * 
 * Our Diamond can deploy multiple such tokens, all backed by the same implementation within the Diamond.
 *  
 */

interface ITargetContract {


  function erc20DeployToken(string memory name, string memory symbol, uint8 decimals) external;

  /**
   * @dev Returns the name of the token.
   */
  function erc20Name() external view returns (string memory);

  /**
   * @dev Returns the symbol of the token.
   */
  function erc20Symbol() external view returns (string memory);

  /**
   * @dev Returns the decimals places of the token.
   */
  function erc20Decimals() external view returns (uint8);

  /**
   * @dev Get the total supply.
   */
  function erc20TotalSupply() external view returns (uint256);

  /**
   * @dev Get the balance of the given wallet.
   *
   * @param account The account address.
   */
  function erc20BalanceOf(address account) external view returns (uint256);

  /**
   * @dev Get the allowance of the given spender for the given owner wallet.
   *
   * @param account The account address.
   * @param spender The spender address.
   */
  function erc20Allowance(address account, address spender) external view returns (uint256);

  /**
   * @dev Approve an allowance for the given spender for the given owner wallet.
   *
   * @param account The account address.
   * @param spender The spender address.
   * @param amount The amount to approve.
   */
  function erc20Approve(address account, address spender, uint256 amount) external;

  /**
   * @dev Transfer a token.
   * @param caller The caller address.
   * @param from The from address.
   * @param to The to address.
   * @param amount The amount to transfer.
   */
  function erc20Transfer(address caller, address from, address to, uint256 amount) external;



  function mint(address from, address to, uint256 amount) external;


  function updateTotalSupply(address from) external; 


  function mintToken(address token, address from, uint256 amount) external; 


  
}


contract MockedDAI is IERC20, IERC20Metadata {
  /**
   * @dev The parent Diamond that implements the business logic.
   */
  // IERC20Facet private _parent;

  ITargetContract _parent; 


  /**
   * @dev Constructor.
   *
   * @param parent The parent Diamond that implements the business logic.
   */
  constructor(address parent) {
    _parent = ITargetContract(parent);
  }

  /*
    IERC20Metadata interface
  */


  function erc20DeployToken() external {
    _parent.erc20DeployToken("MockedDAI", "mDAI", 6);

  }



  function name() public view override returns (string memory) {
    return _parent.erc20Name();
  }

  function symbol() public view override returns (string memory) {
    return _parent.erc20Symbol();
  }  

  function decimals() public view override returns (uint8) {
    return _parent.erc20Decimals();
  }

  /*
    IERC20 interface
  */

  function totalSupply() public view override returns (uint256) {
    return _parent.erc20TotalSupply();
  }

  function balanceOf(address account) public view override returns (uint256) {
    return _parent.erc20BalanceOf(account);
  }

  function allowance(address owner, address spender) public view override returns (uint256) {
    return _parent.erc20Allowance(owner, spender);
  }

  function approve(address spender, uint256 amount) public override returns (bool) {
    _parent.erc20Approve(LibContext.msgSender(), spender, amount);
    return true;
  }

  function transfer(address recipient, uint256 amount) public override returns (bool) {
    address caller = LibContext.msgSender();
    _parent.erc20Transfer(caller, caller, recipient, amount);
    return true;
  }

  function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
    _parent.erc20Transfer(LibContext.msgSender(), sender, recipient, amount);
    return true;
  }



  function mintToken(uint256 amount) external {

    _parent.mintToken(address(this), msg.sender, amount);
 

      // emit ERC20Minted(token, to, amount);
  }  




}



