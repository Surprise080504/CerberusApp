import { StableBond, LPBond, NetworkID, CustomBond, BondType } from "src/lib/Bond";
import { addresses } from "src/constants";
import axios from "axios";

import { ReactComponent as DaiImg } from "src/assets/tokens/DAI.svg";
import { ReactComponent as DogWethImg } from "src/assets/tokens/3DOG-WETH.svg";
import { ReactComponent as FraxImg } from "src/assets/tokens/SHIB.svg";
import { ReactComponent as OhmLusdImg } from "src/assets/tokens/OHM-LUSD.svg";
import { ReactComponent as wETHImg } from "src/assets/tokens/wETH.svg";
import { ReactComponent as LusdImg } from "src/assets/tokens/LUSD.svg";

import { abi as BondDogEthContract } from "src/abi/bonds/OhmEthContract.json";

import { abi as DaiBondContract } from "src/abi/bonds/DaiContract.json";
import { abi as ReserveOhmLusdContract } from "src/abi/reserves/OhmLusd.json";
import { abi as ReserveDogEthContract } from "src/abi/bonds/ReserveDogEthContract.json";

import { abi as ShibBondContract } from "src/abi/bonds/ShibBondContract.json";
import { abi as LusdBondContract } from "src/abi/bonds/LusdContract.json";
import { abi as EthBondContract } from "src/abi/bonds/EthContract.json";

import { abi as ierc20Abi } from "src/abi/IERC20.json";
import { getBondCalculator, getSpecialBondCalculator } from "src/helpers/BondCalculator";
import { BigNumberish } from "ethers";
import { getDogPrice, getEthPrice, getMarketPrice } from "src/helpers";

// TODO(zx): Further modularize by splitting up reserveAssets into vendor token definitions
//   and include that in the definition of a bond
export const dai = new StableBond({
  name: "dai",
  displayName: "DAI",
  bondToken: "DAI",
  isAvailable: { [NetworkID.Mainnet]: true, [NetworkID.Testnet]: true },
  bondIconSvg: DaiImg,
  bondContractABI: DaiBondContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x575409F8d77c12B05feD8B455815f0e54797381c",
      reserveAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0x57680ADD6cEBE4746CBe241180e5a585D06B7530",
      reserveAddress: "0xfACDF811DD0ECB621Fe35d5883e0F10A5Bc7711E",
    },
  },
});

async function getShibPrice() {
  try {
    let shibPrice = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=shiba-inu&vs_currencies=usd`);
    return shibPrice.data['shiba-inu'].usd;
  } catch (e) {
    console.log("coingecko api error: ", e);
  }
}


export const shib = new CustomBond({
  name: "shib",
  displayName: "SHIB",
  lpUrl: "",
  bondType: BondType.StableAsset,
  bondToken: "SHIB",
  isAvailable: { [NetworkID.Mainnet]: true, [NetworkID.Testnet]: true },
  bondIconSvg: FraxImg,
  bondContractABI: ShibBondContract,
  reserveContract: ierc20Abi, // The Standard ierc20Abi since they're normal tokens
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x5F50d0f427228F48665fB790685c450328995C0D",
      reserveAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xca7b90f8158A4FAA606952c023596EE6d322bcf0",
      reserveAddress: "0xc778417e063141139fce010982780140aa0cd5ab",
    },
  },
  customTreasuryBalanceFunc: async function (this: CustomBond, networkID, provider) {
    const shibBondContract = this.getContractForBond(networkID, provider);
    let shibPrice: BigNumberish = await getShibPrice();
    shibPrice = Number(shibPrice.toString()) / Math.pow(10, 8);
    const token = this.getContractForReserve(networkID, provider);
    let shibAmount: BigNumberish = await token.balanceOf(addresses[networkID].TREASURY_ADDRESS);
    shibAmount = Number(shibAmount.toString()) / Math.pow(10, 18);
    return shibAmount * shibPrice;
  },
});

export const eth = new CustomBond({
  name: "eth",
  displayName: "wETH",
  lpUrl: "",
  bondType: BondType.StableAsset,
  bondToken: "wETH",
  isAvailable: { [NetworkID.Mainnet]: true, [NetworkID.Testnet]: true },
  bondIconSvg: wETHImg,
  bondContractABI: EthBondContract,
  reserveContract: ierc20Abi, // The Standard ierc20Abi since they're normal tokens
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0xE6295201CD1ff13CeD5f063a5421c39A1D236F1c",
      reserveAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xca7b90f8158A4FAA606952c023596EE6d322bcf0",
      reserveAddress: "0xc778417e063141139fce010982780140aa0cd5ab",
    },
  },
  customTreasuryBalanceFunc: async function (this: CustomBond, networkID, provider) {
    const ethBondContract = this.getContractForBond(networkID, provider);
    let ethPrice: BigNumberish = await ethBondContract.assetPrice();
    ethPrice = Number(ethPrice.toString()) / Math.pow(10, 8);
    const token = this.getContractForReserve(networkID, provider);
    let ethAmount: BigNumberish = await token.balanceOf(addresses[networkID].TREASURY_ADDRESS);
    ethAmount = Number(ethAmount.toString()) / Math.pow(10, 18);
    return ethAmount * ethPrice;
  },
});

export const lusd = new StableBond({
  name: "lusd",
  displayName: "LUSD",
  bondToken: "LUSD",
  isAvailable: { [NetworkID.Mainnet]: false, [NetworkID.Testnet]: true },
  bondIconSvg: LusdImg,
  bondContractABI: LusdBondContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x10C0f93f64e3C8D0a1b0f4B87d6155fd9e89D08D",
      reserveAddress: "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0x3aD02C4E4D1234590E87A1f9a73B8E0fd8CF8CCa",
      reserveAddress: "0x45754dF05AA6305114004358eCf8D04FF3B84e26",
    },
  },
});

// export const ohm_lusd = new LPBond({
//   name: "ohm_lusd_lp",
//   displayName: "OHM-LUSD LP",
//   bondToken: "LUSD",
//   isAvailable: { [NetworkID.Mainnet]: false, [NetworkID.Testnet]: true },
//   bondIconSvg: DogWethImg,
//   bondContractABI: BondOhmLusdContract,
//   reserveContract: ReserveOhmLusdContract,
//   networkAddrs: {
//     [NetworkID.Mainnet]: {
//       bondAddress: "0xFB1776299E7804DD8016303Df9c07a65c80F67b6",
//       reserveAddress: "0xfDf12D1F85b5082877A6E070524f50F6c84FAa6b",
//     },
//     [NetworkID.Testnet]: {
//       // NOTE (appleseed-lusd): using ohm-dai rinkeby contracts
//       bondAddress: "0xcF449dA417cC36009a1C6FbA78918c31594B9377",
//       reserveAddress: "0x8D5a22Fb6A1840da602E56D1a260E56770e0bCE2",
//     },
//   },
//   lpUrl:
//     "https://app.sushi.com/add/0x383518188C0C6d7730D91b2c03a03C837814a899/0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
// });

export const dog_eth = new CustomBond({
  name: "dog_eth_lp",
  displayName: "3DOG-wETH LP",
  bondToken: "wETH",
  isAvailable: { [NetworkID.Mainnet]: true, [NetworkID.Testnet]: true },
  bondIconSvg: DogWethImg,
  bondContractABI: BondDogEthContract,
  reserveContract: ReserveDogEthContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0xd2E0BD64B3e6fbc4d09f9a11e5852bf9A46A6731",
      reserveAddress: "0xB5B6C3816C66Fa6BC5b189F49e5b088E2dE5082a",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0x39B8E79de8201C46cCBad64767B7208d9C41A9dB",
      reserveAddress: "0xB5B6C3816C66Fa6BC5b189F49e5b088E2dE5082a",
    },
  },
  bondType: BondType.LP,
  lpUrl:
    "https://app.uniswap.org/#/add/0x8a14897eA5F668f36671678593fAe44Ae23B39FB/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  customTreasuryBalanceFunc: async function (this: CustomBond, networkID, provider) {
    if (networkID === NetworkID.Mainnet) {
      const ethBondContract = this.getContractForBond(networkID, provider);
      let ethPrice: BigNumberish = await getEthPrice();
      ethPrice = Number(ethPrice.toString()) / Math.pow(10, 8);
      const token = this.getContractForReserve(networkID, provider);
      const tokenAddress = this.getAddressForReserve(networkID);
      const tokenAmount = await token.balanceOf(addresses[networkID].TREASURY_ADDRESS);
      const lpTokenSupply = await token.totalSupply()
      let reserves = await token.getReserves()
      let reserves0 = Number(reserves[0].toString())
      let reserves1 = Number(reserves[1].toString())
      let dPrice = await getDogPrice()
      let wethPrice = await getEthPrice()
      let lpValue = (dPrice*(reserves0 * Math.pow(10, -9))) + ((wethPrice*reserves1 * Math.pow(10, -18)))
     
      const lpSupply =  Number(tokenAmount.toString())*Math.pow(10, -18)
      let lpTokenValue =  lpValue / Number(lpTokenSupply.toString()) * Math.pow(10, 16)

      return lpTokenValue / lpSupply;

    } else {
      // NOTE (appleseed): using OHM-DAI on rinkeby
      const token = this.getContractForReserve(networkID, provider);
      const tokenAddress = this.getAddressForReserve(networkID);
      const bondCalculator = getBondCalculator(networkID, provider);
      const tokenAmount = await token.balanceOf(addresses[networkID].TREASURY_ADDRESS);
      const valuation = await bondCalculator.valuation(tokenAddress, tokenAmount);
      const markdown = await bondCalculator.markdown(tokenAddress);
      let tokenUSD =
        (Number(valuation.toString()) / Math.pow(10, 9)) * (Number(markdown.toString()) / Math.pow(10, 18));
      return tokenUSD;
    }
  },
});

// HOW TO ADD A NEW BOND:
// Is it a stableCoin bond? use `new StableBond`
// Is it an LP Bond? use `new LPBond`
// Add new bonds to this array!!
export const allBonds = [shib, dog_eth];
export const allBondsMap = allBonds.reduce((prevVal, bond) => {
  return { ...prevVal, [bond.name]: bond };
}, {});

// Debug Log
//console.log(allBondsMap);
export default allBonds;
