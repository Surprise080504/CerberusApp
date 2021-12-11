import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import useDebounce from "../../hooks/Debounce";
import BondLogo from "../../components/BondLogo";
import { DisplayBondPrice, DisplayBondDiscount } from "../Bond/Bond";
import {
  Box,
  Button,
  Link,
  Paper,
  Typography,
  TableRow,
  TableCell,
  SvgIcon,
  Slide,
} from "@material-ui/core";
import { ReactComponent as ArrowUp } from "../../assets/icons/arrow-up.svg";
import { NavLink } from "react-router-dom";
import "./choosebond.scss";
import { calcBondDetails } from "../../slices/BondSlice";
import { Skeleton } from "@material-ui/lab";
import useBonds from "src/hooks/Bonds";
import { useWeb3Context } from "../../hooks/web3Context";

export function BondDataCard({ bond }) {
  const SECONDS_TO_REFRESH = 60;
  const dispatch = useDispatch();
  const { provider, address, chainID } = useWeb3Context();

  const [quantity, setQuantity] = useState("");
  const [secondsToRefresh, setSecondsToRefresh] = useState(SECONDS_TO_REFRESH);

  const currentBlock = useSelector((state) => {
    return state.app.currentBlock;
  });

  const isBondLoading = useSelector((state) => state.bonding.loading ?? true);
  const bondDetailsDebounce = useDebounce(quantity, 1000);

  useEffect(() => {
    let interval = null;
    if (secondsToRefresh > 0) {
      interval = setInterval(() => {
        setSecondsToRefresh((secondsToRefresh) => secondsToRefresh - 1);
      }, 1000);
    } else {
      clearInterval(interval);
      dispatch(
        calcBondDetails({ bond, value: quantity, provider, networkID: chainID })
      );
      setSecondsToRefresh(SECONDS_TO_REFRESH);
    }
    return () => clearInterval(interval);
  }, [secondsToRefresh, quantity]);

  useEffect(() => {
    dispatch(
      calcBondDetails({ bond, value: quantity, provider, networkID: chainID })
    );
  }, [bondDetailsDebounce]);

  const treasuryBalance = useSelector((state) => {
    if (state.bonding.loading == false) {
      let bal = state.bonding["shib"].purchased * 100000000;
      return bal;
    }
  });

  return (
    <Slide direction="up" in={true}>
      <Paper id={`${bond.name}--bond`} className="bond-data-card ohm-card">
        <div className="bond-pair">
          <BondLogo bond={bond} />
          <div className="bond-name">
            <Typography>{bond.displayName}</Typography>
            {bond.isLP && (
              <div>
                <Link href={bond.lpUrl} target="_blank">
                  <Typography variant="body1">
                    View Contract
                    <SvgIcon component={ArrowUp} htmlColor="#A3A3A3" />
                  </Typography>
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="data-row">
          <Typography>Price</Typography>
          <Typography className="bond-price">
            <>
              {isBondLoading ? (
                <Skeleton width="50px" />
              ) : (
                <DisplayBondPrice key={bond.name} bond={bond} />
              )}
            </>
          </Typography>
        </div>
        <div className="data-row">
          <Typography>ROI</Typography>
          <Typography>
            {isBondLoading ? (
              <Skeleton width="50px" />
            ) : (
              <DisplayBondDiscount key={bond.name} bond={bond} />
            )}
          </Typography>
        </div>

        <div className="data-row">
          <Typography>Purchased</Typography>
          <Typography>
            {isBondLoading ? (
              <Skeleton width="80px" />
            ) : (
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
              }).format(10)
            )}
          </Typography>
        </div>
        <Link component={NavLink} to={`/bonds/${bond.name}`}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            disabled={!bond.isAvailable[chainID]}
          >
            <Typography variant="h5">
              {!bond.isAvailable[chainID]
                ? "Sold Out"
                : `Bond ${bond.displayName}`}
            </Typography>
          </Button>
        </Link>
      </Paper>
    </Slide>
  );
}

export function BondTableData({ bond }) {
  const SECONDS_TO_REFRESH = 5;
  const dispatch = useDispatch();
  const { provider, address, chainID } = useWeb3Context();

  const [quantity, setQuantity] = useState("");
  const [secondsToRefresh, setSecondsToRefresh] = useState(SECONDS_TO_REFRESH);
  const [counter, setCounter] = useState(2);
  const currentBlock = useSelector((state) => {
    return state.app.currentBlock;
  });

  const isBondLoading = useSelector((state) => state.bonding.loading ?? true);
  const bondDetailsDebounce = useDebounce(quantity, 1000);

  useEffect(() => {
    let interval = null;
    if (secondsToRefresh > 0) {
      interval = setInterval(() => {
        setSecondsToRefresh((secondsToRefresh) => secondsToRefresh - 1);
      }, 1000);
    } else {
      clearInterval(interval);
      dispatch(
        calcBondDetails({ bond, value: quantity, provider, networkID: chainID })
      );
      if (counter < 0) {
        setSecondsToRefresh(3);
        setCounter(counter - 1);
      } else {
        setSecondsToRefresh(0);
      }
    }
    return () => clearInterval(interval);
  }, [secondsToRefresh, quantity]);

  useEffect(() => {
    dispatch(
      calcBondDetails({ bond, value: quantity, provider, networkID: chainID })
    );
  }, []);

  const treasuryBalance = useSelector((state) => {
    if (!isBondLoading) {
      if (bond.name === "shib") {
        let bal = bond.purchased * 100000000;
        return bal;
      } else if (bond.name === "dog_eth_lp") {
        // console.log(bond.purchased * Math.pow(10, 18))
        let bal = bond.purchased * Math.pow(10, 1);
        //  console.log(bal)
        return bal;
      }
    }
  });

  return (
    <TableRow id={`${bond.name}--bond`}>
      <TableCell align="left" className="bond-name-cell">
        <BondLogo bond={bond} />
        <div className="bond-name">
          <Typography variant="body1">{bond.displayName}</Typography>
          {bond.isLP && (
            <Link color="primary" href={bond.lpUrl} target="_blank">
              <Typography variant="body1">
                View Contract
                <SvgIcon component={ArrowUp} htmlColor="#A3A3A3" />
              </Typography>
            </Link>
          )}
        </div>
      </TableCell>
      <TableCell align="left">
        <Typography>
          <>
            {isBondLoading ? (
              <Skeleton width="50px" />
            ) : (
              <DisplayBondPrice key={bond.name} bond={bond} />
            )}
          </>
        </Typography>
      </TableCell>
      <TableCell align="left">
        {" "}
        {isBondLoading ? (
          <Skeleton width="50px" />
        ) : (
          <DisplayBondDiscount key={bond.name} bond={bond} />
        )}
      </TableCell>
      <TableCell align="right">
        {isBondLoading ? (
          <Skeleton />
        ) : (
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
          }).format(treasuryBalance)
        )}
      </TableCell>
      <TableCell>
        <Link component={NavLink} to={`/bonds/${bond.name}`}>
          <Button
            variant="outlined"
            color="primary"
            disabled={!bond.isAvailable[chainID]}
          >
            <Typography variant="h6">
              {!bond.isAvailable[chainID] ? "Sold Out" : "Bond"}
            </Typography>
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
}
