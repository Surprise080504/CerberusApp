import { ethers, BigNumber, BigNumberish } from "ethers";
import { contractForRedeemHelper } from "../helpers";
import { getBalances, calculateUserBondDetails } from "./AccountSlice";
import { findOrLoadMarketPrice } from "./AppSlice";
import { error, info } from "./MessagesSlice";
import { clearPendingTxn, fetchPendingTxns } from "./PendingTxnsSlice";
import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { getDogPrice, getEthPrice, getMarketPrice } from "src/helpers";
import { getBondCalculator, getSpecialBondCalculator } from "src/helpers/BondCalculator";
import { RootState } from "src/store";
import {
  IApproveBondAsyncThunk,
  IBondAssetAsyncThunk,
  ICalcBondDetailsAsyncThunk,
  IJsonRPCError,
  IRedeemAllBondsAsyncThunk,
  IRedeemBondAsyncThunk,
} from "./interfaces";
import { segmentUA } from "../helpers/userAnalyticHelpers";
import axios from 'axios'

export const changeApproval = createAsyncThunk(
  "bonding/changeApproval",
  async ({ address, bond, provider, networkID }: IApproveBondAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const reserveContract = bond.getContractForReserve(networkID, signer);
    const bondAddr = bond.getAddressForBond(networkID);

    let approveTx;
    let bondAllowance = await reserveContract.allowance(address, bondAddr);

    // return early if approval already exists
    if (bondAllowance.gt(BigNumber.from("0"))) {
      dispatch(info("Approval completed."));
      dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
      return;
    }

    try {
      approveTx = await reserveContract.approve(bondAddr, ethers.utils.parseUnits("1000000000", "ether").toString());
      dispatch(
        fetchPendingTxns({
          txnHash: approveTx.hash,
          text: "Approving " + bond.displayName,
          type: "approve_" + bond.name,
        }),
      );
      await approveTx.wait();
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
        dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
      }
    }
  },
);

export interface IBondDetails {
  bond: string;
  bondDiscount: number;
  debtRatio: number;
  bondQuote: number;
  purchased: number;
  vestingTerm: number;
  maxBondPrice: number;
  bondPrice: number;
  marketPrice: number;
}

async function getShibPrice() {
  try {
    let shibPrice = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=shiba-inu&vs_currencies=usd`);
    return shibPrice.data['shiba-inu'].usd;
  } catch (e) {
    console.log("coingecko api error: ", e);
  }
}

export const calcBondDetails = createAsyncThunk(
  "bonding/calcBondDetails",
  async ({ bond, value, provider, networkID }: ICalcBondDetailsAsyncThunk, { dispatch }): Promise<IBondDetails> => {
    if (!value || value === "") {
      value = "0";
    }
    const amountInWei = ethers.utils.parseEther(value);

    let bondPrice = BigNumber.from(0),
      bondDiscount = 0,
      valuation = 0,
      bondQuote: BigNumberish = BigNumber.from(0);
    const bondContract = bond.getContractForBond(networkID, provider);
    const bondCalcContract = getBondCalculator(networkID, provider);
    const specialBondCalcContract =  getSpecialBondCalculator(networkID, provider);

    const terms = await bondContract.terms();
    const maxBondPrice = await bondContract.maxPayout();
    let shibPrice = await getShibPrice()
    let debtRatio: BigNumberish;
    // TODO (appleseed): improve this logic
    if (bond.name === "cvx") {
      debtRatio = await bondContract.debtRatio();
    } else {
      debtRatio = await bondContract.standardizedDebtRatio();
    }
    debtRatio = Number(debtRatio.toString()) / Math.pow(10, 9);
    let marketPrice: number = 0;
    try {
      const originalPromiseResult = await dispatch(
        findOrLoadMarketPrice({ networkID: networkID, provider: provider }),
      ).unwrap();
      marketPrice = originalPromiseResult?.marketPrice;
    } catch (rejectedValueOrSerializedError) {
      // handle error here
      console.error("Returned a null response from dispatch(loadMarketPrice)");
    }

    try {
      // TODO (appleseed): improve this logic
        if (bond.name === 'shib'){
        bondPrice = await bondContract.bondPriceInUSD();
        const first = (marketPrice - (Number(bondPrice.toString()) * Math.pow(10, -18))*shibPrice)
        const second = marketPrice;
        bondDiscount = first / second;
      } if (bond.name === "dog_eth_lp") {
        bondPrice = await bondContract.bondPrice();
        const token = bond.getContractForReserve(networkID, provider)  
        let reserves = await token.getReserves()
        let reserves0 = Number(reserves[0].toString())
        let reserves1 = Number(reserves[1].toString())
        let dPrice = await getDogPrice()
        let wethPrice = await getEthPrice()
        let lpValue = (dPrice*(reserves0 * Math.pow(10, -9))) + ((wethPrice*reserves1 * Math.pow(10, -18)))
        let val = await specialBondCalcContract.valuation(bond.getAddressForReserve(networkID), 1)
        const tokenAmount = await token.balanceOf("0x56D595ea5591D264bc1Ef9E073aF66685F0bFD31");
        const lpTokenSupply = await token.totalSupply()
        const lpSupply =  Number(tokenAmount.toString())*Math.pow(10, -18)
        let lpTokenValue =  lpValue / Number(lpTokenSupply.toString()) * Math.pow(10, 18)

        // console.log("(bondPrice() * lpPriceInUSD) / (1e11 * valuation(1)) ")
        // console.log("bond price usd " + Number(bondPrice.toString()))
        // console.log("LP Value " + lpTokenValue)
        // console.log("valuation " + Number(val.toString()) * Math.pow(10, 11))
        // console.log("equals: "  + (Number(bondPrice.toString()) * lpTokenValue) / (Number(val.toString()) * Math.pow(10, 11)))

        let num = (Number(bondPrice.toString()) * lpTokenValue) / (Number(val.toString()) * Math.pow(10, 11))* Math.pow(10, 18)
        let dynamic = BigNumber.from(num.toString())
        bondPrice = dynamic
        const first = (marketPrice - (Number(bondPrice.toString()) * Math.pow(10, -18)))
        const second = marketPrice;
    
        bondDiscount = first / second;
        }
      } catch (e) {
      console.log("error getting bondPriceInUSD", e);
    }

    if (Number(value) === 0) {
      // if inputValue is 0 avoid the bondQuote calls
      bondQuote = BigNumber.from(0);
    } else if (bond.isLP) {
      valuation = Number(
        (await specialBondCalcContract.valuation(bond.getAddressForReserve(networkID), amountInWei)).toString(),
      );
      bondQuote = await bondContract.payoutFor(valuation);
      if (!amountInWei.isZero() && Number(bondQuote.toString()) < 100000) {
        bondQuote = BigNumber.from(0);
        const errorString = "Amount is too small!";
        dispatch(error(errorString));
      } else {
        bondQuote = Number(bondQuote.toString()) / Math.pow(10, 9);
      }
    } else {
      // RFV = DAI
      bondQuote = await bondContract.payoutFor(amountInWei);

      if (!amountInWei.isZero() && Number(bondQuote.toString()) < 100000000000000) {
        bondQuote = BigNumber.from(0);
        const errorString = "Amount is too small!";
        dispatch(error(errorString));
      } else {
        bondQuote = Number(bondQuote.toString()) / Math.pow(10, 18);
      }
    }

    // Display error if user tries to exceed maximum.
    if (!!value && parseFloat(bondQuote.toString()) > Number(maxBondPrice.toString()) / Math.pow(10, 9)) {
      const errorString =
        "You're trying to bond more than the maximum payout available! The maximum bond payout is " +
        (Number(maxBondPrice.toString()) / Math.pow(10, 9)).toFixed(2).toString() +
        " 3DOG.";
      dispatch(error(errorString));
    }

    // Calculate bonds purchased
    let purchased = await bond.getTreasuryBalance(networkID, provider);
    if (bond.name === "shib"){
      return {
        bond: bond.name,
        bondDiscount,
        debtRatio: Number(debtRatio.toString()),
        bondQuote: Number(bondQuote.toString()),
        purchased,
        vestingTerm: Number(terms.vestingTerm.toString()),
        maxBondPrice: Number(maxBondPrice.toString()) / Math.pow(10, 9),
        bondPrice: Number(bondPrice.toString()) / Math.pow(10, 18) * shibPrice,
        marketPrice: marketPrice,
      };
    } else {
      return {
        bond: bond.name,
        bondDiscount,
        debtRatio: Number(debtRatio.toString()),
        bondQuote: Number(bondQuote.toString()),
        purchased,
        vestingTerm: Number(terms.vestingTerm.toString()),
        maxBondPrice: Number(maxBondPrice.toString()) / Math.pow(10, 9),
        bondPrice: Number(bondPrice.toString()) / Math.pow(10, 18),
        marketPrice: marketPrice,
      };
    }
  },
);

export const bondAsset = createAsyncThunk(
  "bonding/bondAsset",
  async ({ value, address, bond, networkID, provider, slippage }: IBondAssetAsyncThunk, { dispatch }) => {
    const depositorAddress = address;
    const acceptedSlippage = 0.2; // 0.5% as default
    // parseUnits takes String => BigNumber
    const valueInWei = ethers.utils.parseUnits(value.toString(), "ether");
    let balance;
    // Calculate maxPremium based on premium and slippage.
    // const calculatePremium = await bonding.calculatePremium();
    const signer = provider.getSigner();
    const bondContract = bond.getContractForBond(networkID, signer);
    const calculatePremium = await bondContract.bondPrice();
    const maxPremium = Math.round(Number(calculatePremium.toString()) * (1 + acceptedSlippage));

    // Deposit the bond
    let bondTx;
    let uaData = {
      address: address,
      value: value,
      type: "Bond",
      bondName: bond.displayName,
      approved: true,
      txHash: "",
    };
    try {
      bondTx = await bondContract.deposit(valueInWei, maxPremium, depositorAddress);
      dispatch(
        fetchPendingTxns({ txnHash: bondTx.hash, text: "Bonding " + bond.displayName, type: "bond_" + bond.name }),
      );
      uaData.txHash = bondTx.hash;
      await bondTx.wait();
      // TODO: it may make more sense to only have it in the finally.
      // UX preference (show pending after txn complete or after balance updated)

      dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
    } catch (e: unknown) {
      const rpcError = e as IJsonRPCError;
      if (rpcError.code === -32603 && rpcError.message.indexOf("ds-math-sub-underflow") >= 0) {
        dispatch(
          error("You may be trying to bond more than your balance! Error code: 32603. Message: ds-math-sub-underflow"),
        );
      } else dispatch(error(rpcError.message));
    } finally {
      if (bondTx) {
        segmentUA(uaData);
        dispatch(clearPendingTxn(bondTx.hash));
      }
    }
  },
);

export const redeemBond = createAsyncThunk(
  "bonding/redeemBond",
  async ({ address, bond, networkID, provider, autostake }: IRedeemBondAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const bondContract = bond.getContractForBond(networkID, signer);

    let redeemTx;
    let uaData = {
      address: address,
      type: "Redeem",
      bondName: bond.displayName,
      autoStake: autostake,
      approved: true,
      txHash: "",
    };
    try {
      redeemTx = await bondContract.redeem(address, autostake === true);
      const pendingTxnType = "redeem_bond_" + bond + (autostake === true ? "_autostake" : "");
      uaData.txHash = redeemTx.hash;
      dispatch(
        fetchPendingTxns({ txnHash: redeemTx.hash, text: "Redeeming " + bond.displayName, type: pendingTxnType }),
      );

      await redeemTx.wait();
      await dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));

      dispatch(getBalances({ address, networkID, provider }));
    } catch (e: unknown) {
      uaData.approved = false;
      dispatch(error((e as IJsonRPCError).message));
    } finally {
      if (redeemTx) {
        segmentUA(uaData);
        dispatch(clearPendingTxn(redeemTx.hash));
      }
    }
  },
);

export const redeemAllBonds = createAsyncThunk(
  "bonding/redeemAllBonds",
  async ({ bonds, address, networkID, provider, autostake }: IRedeemAllBondsAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const redeemHelperContract = contractForRedeemHelper({ networkID, provider: signer });

    let redeemAllTx;

    try {
      redeemAllTx = await redeemHelperContract.redeemAll(address, autostake);
      const pendingTxnType = "redeem_all_bonds" + (autostake === true ? "_autostake" : "");

      await dispatch(
        fetchPendingTxns({ txnHash: redeemAllTx.hash, text: "Redeeming All Bonds", type: pendingTxnType }),
      );

      await redeemAllTx.wait();

      bonds &&
        bonds.forEach(async bond => {
          dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
        });

      dispatch(getBalances({ address, networkID, provider }));
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
    } finally {
      if (redeemAllTx) {
        dispatch(clearPendingTxn(redeemAllTx.hash));
      }
    }
  },
);

// Note(zx): this is a barebones interface for the state. Update to be more accurate
interface IBondSlice {
  status: string;
  [key: string]: any;
}

const setBondState = (state: IBondSlice, payload: any) => {
  const bond = payload.bond;
  const newState = { ...state[bond], ...payload };
  state[bond] = newState;
  state.loading = false;
};

const initialState: IBondSlice = {
  status: "idle",
};

const bondingSlice = createSlice({
  name: "bonding",
  initialState,
  reducers: {
    fetchBondSuccess(state, action) {
      state[action.payload.bond] = action.payload;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(calcBondDetails.pending, state => {
        state.loading = true;
      })
      .addCase(calcBondDetails.fulfilled, (state, action) => {
        setBondState(state, action.payload);
        state.loading = false;
      })
      .addCase(calcBondDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error.message);
      });
  },
});

export default bondingSlice.reducer;

export const { fetchBondSuccess } = bondingSlice.actions;

const baseInfo = (state: RootState) => state.bonding;

export const getBondingState = createSelector(baseInfo, bonding => bonding);
