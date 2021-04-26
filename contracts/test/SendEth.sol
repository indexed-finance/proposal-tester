// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract SendEth {
  constructor(address target) public payable {
    assembly { selfdestruct(target) }
  }
}