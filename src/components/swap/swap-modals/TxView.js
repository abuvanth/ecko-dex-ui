import React, { useContext, useState } from "react";
import styled from "styled-components/macro";
import { Transition } from "react-spring/renderprops";
import { Message, Popup, Icon } from "semantic-ui-react";
import { ErrorIcon, SuccessfullIcon } from "../../../assets";
import { extractDecimal, gasUnit } from "../../../utils/reduceBalance";
import CustomButton from "../../../shared/CustomButton";
import Backdrop from "../../../shared/Backdrop";
import ModalContainer from "../../../shared/ModalContainer";
import { SwapContext } from "../../../contexts/SwapContext";
import { GAS_PRICE } from "../../../constants/contextConstants";

const Container = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 385px;
  width: 100%;
  z-index: 5;
`;

const Label = styled.span`
  font-family: ${({ theme: { fontFamily } }) => fontFamily.bold};
  font-size: 13px;
  color: #ffffff;
`;

const RowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 15px 0px;
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const Title = styled.div`
 font-family: ${({ theme: { fontFamily } }) =>
   fontFamily.bold};  font-size: 24px;
  padding: 16px;
  color: color: #FFFFFF;
`;

const SubTitle = styled.div`
 font-family: ${({ theme: { fontFamily } }) =>
   fontFamily.bold};  font-size: 16px;
  color: color: #FFFFFF;
`;

const TransactionsDetails = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px 0px;
`;

const SpaceBetweenRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Value = styled.span`
  font-family: ${({ theme: { fontFamily } }) => fontFamily.regular};
  font-size: 13px;
  color: #ffffff;
`;

const TxView = ({ show, view, onClose, token0, token1, createTokenPair }) => {
  const swap = useContext(SwapContext);

  const [loading, setLoading] = useState(false);

  const showTicker = (ticker) => {
    if (ticker === "coin") return "KDA";
    else return ticker.toUpperCase();
  };

  const successView = () => {
    return (
      <Content>
        <SuccessfullIcon />
        <Title>Preview Successful!</Title>
        <SubTitle>Transaction Details</SubTitle>
        <TransactionsDetails>
          <SpaceBetweenRow>
            <Label>Send</Label>
            <Value>
              {`${swap.localRes.result.data[0].amount} ${showTicker(
                swap.localRes.result.data[0].token
              )}`}
            </Value>
          </SpaceBetweenRow>
          <SpaceBetweenRow style={{ padding: "16px 0px" }}>
            <Label>Receive</Label>
            <Value>
              {`${swap.localRes.result.data[1].amount} ${showTicker(
                swap.localRes.result.data[1].token
              )}`}
            </Value>
          </SpaceBetweenRow>
          <SpaceBetweenRow>
            <Label>Gas Cost</Label>
            <Value>
              <s>{`${gasUnit(GAS_PRICE * swap.localRes.gas)} KDA`}</s>
              <span style={{ marginLeft: 5, color: "#ffa900" }}>FREE!</span>
              <Popup
                trigger={
                  <Icon
                    onClick={() => {
                      window.open(
                        "https://medium.com/kadena-io/the-first-crypto-gas-station-is-now-on-kadenas-blockchain-6dc43b4b3836",
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                    name="help circle"
                    style={{ marginLeft: "2px" }}
                  />
                }
                position="top center"
              >
                <Popup.Header>Why is Gas free?</Popup.Header>
                <Popup.Content>
                  Kadena has a novel concept called gas stations that allows
                  smart contracts to pay for users' gas. This means you do not
                  need to hold KDA to trade any token pair!
                </Popup.Content>
              </Popup>
            </Value>
          </SpaceBetweenRow>
        </TransactionsDetails>
        <CustomButton
          buttonStyle={{ width: "100%" }}
          onClick={async () => {
            setLoading(true);
            swap.swapSend();
            onClose();
            setLoading(false);
          }}
          loading={loading}
        >
          Send Transaction
        </CustomButton>
      </Content>
    );
  };

  const successRemoveView = () => {
    return (
      <Content>
        <SuccessfullIcon />
        <Title>Preview Successful!</Title>
        <SubTitle>Transaction Details</SubTitle>
        <TransactionsDetails>
          <SpaceBetweenRow>
            <Label>Remove</Label>
            <Value>
              {`${extractDecimal(swap.localRes.result.data.amount0)} `}
              {showTicker(token0)}
            </Value>
          </SpaceBetweenRow>
          <SpaceBetweenRow style={{ padding: "16px 0px" }}>
            <Label>Remove</Label>
            <Value>
              {`${extractDecimal(swap.localRes.result.data.amount1)} `}
              {showTicker(token1)}
            </Value>
          </SpaceBetweenRow>
          <SpaceBetweenRow>
            <Label>Gas Cost</Label>
            <Value>
              <s>{`${gasUnit(GAS_PRICE * swap.localRes.gas)} KDA`}</s>
              <span style={{ marginLeft: 5, color: "#ffa900" }}>FREE!</span>
              <Popup
                trigger={
                  <Icon
                    onClick={() => {
                      window.open(
                        "https://medium.com/kadena-io/the-first-crypto-gas-station-is-now-on-kadenas-blockchain-6dc43b4b3836",
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                    name="help circle"
                    style={{ marginLeft: "2px" }}
                  />
                }
                position="top center"
              >
                <Popup.Header>Why is Gas free?</Popup.Header>
                <Popup.Content>
                  Kadena has a novel concept called gas stations that allows
                  smart contracts to pay for users' gas. This means you do not
                  need to hold KDA to trade any token pair!
                </Popup.Content>
              </Popup>
            </Value>
          </SpaceBetweenRow>
        </TransactionsDetails>
        <CustomButton
          buttonStyle={{ width: "100%" }}
          onClick={async () => {
            setLoading(true);
            swap.swapSend();
            onClose();
            setLoading(false);
          }}
          loading={loading}
        >
          Send Transaction
        </CustomButton>
      </Content>
    );
  };

  const successAddView = () => {
    return (
      <Content>
        <SuccessfullIcon />
        <Title>Preview Successful!</Title>
        <SubTitle>Transaction Details</SubTitle>
        <TransactionsDetails>
          <SpaceBetweenRow>
            <Label>Add</Label>
            <Value>
              {`${extractDecimal(swap.localRes.result.data.amount0)}`}
              {showTicker(token0)}
            </Value>
          </SpaceBetweenRow>
          <SpaceBetweenRow style={{ padding: "16px 0px" }}>
            <Label>Add</Label>
            <Value>
              {`${extractDecimal(swap.localRes.result.data.amount1)}`}
              {showTicker(token1)}
            </Value>
          </SpaceBetweenRow>
          <SpaceBetweenRow>
            <Label>Gas Cost</Label>
            <Value>
              <s>{`${gasUnit(GAS_PRICE * swap.localRes.gas)} KDA`}</s>
              <span style={{ marginLeft: 5, color: "#ffa900" }}>FREE!</span>
              <Popup
                trigger={
                  <Icon
                    onClick={() => {
                      window.open(
                        "https://medium.com/kadena-io/the-first-crypto-gas-station-is-now-on-kadenas-blockchain-6dc43b4b3836",
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                    name="help circle"
                    style={{ marginLeft: "2px" }}
                  />
                }
                position="top center"
              >
                <Popup.Header>Why is Gas free?</Popup.Header>
                <Popup.Content>
                  Kadena has a novel concept called gas stations that allows
                  smart contracts to pay for users' gas. This means you do not
                  need to hold KDA to trade any token pair!
                </Popup.Content>
              </Popup>
            </Value>
          </SpaceBetweenRow>
        </TransactionsDetails>
        <CustomButton
          buttonStyle={{ width: "100%" }}
          onClick={async () => {
            setLoading(true);
            if (view === "Add Liquidity") {
              swap.swapSend();
              onClose();
            } else {
              await createTokenPair();
              await swap.swapSend();
              onClose();
            }
            setLoading(false);
          }}
          loading={loading}
        >
          Send Transaction
        </CustomButton>
      </Content>
    );
  };

  const failView = () => {
    return (
      <Content>
        <ErrorIcon />
        <Title>Preview Failed!</Title>
        <SubTitle>Error Message</SubTitle>
        <TransactionsDetails>
          <Message
            color="red"
            style={{ wordBreak: "break-all", backgroundColor: "#424242" }}
          >
            <RowContainer>
              <span style={{ wordBreak: "break-all" }}>
                {swap.localRes.result.error.message}
              </span>
            </RowContainer>
          </Message>
          {swap.localRes.result.error.message.includes("insufficient") ? (
            <span style={{ wordBreak: "break-all" }}>
              TIP: Try setting a higher slippage amount
            </span>
          ) : (
            <></>
          )}
        </TransactionsDetails>
        <CustomButton
          onClick={() => {
            onClose();
          }}
        >
          Retry
        </CustomButton>
      </Content>
    );
  };

  const localError = () => {
    return (
      <Content>
        <ErrorIcon />
        <Title>Transaction Error!</Title>
        <SubTitle>Error Message</SubTitle>
        <TransactionsDetails>
          <Message
            color="red"
            style={{ wordBreak: "break-all", backgroundColor: "#424242" }}
          >
            <RowContainer>
              <span style={{ wordBreak: "break-all" }}>{swap.localRes}</span>
            </RowContainer>
          </Message>
        </TransactionsDetails>
        <CustomButton
          onClick={() => {
            onClose();
          }}
        >
          Retry
        </CustomButton>
      </Content>
    );
  };

  const renderSwitch = () => {
    if (
      swap.localRes &&
      swap.localRes.result &&
      swap.localRes.result.status === "success"
    ) {
      switch (view) {
        default:
          return () => {};
        case "Remove Liquidity":
          return successRemoveView();
        case "Add Liquidity":
          return successAddView();
        case undefined:
          return successView();
      }
    } else return failView();
  };
  // console.log(pact)
  return (
    <Transition
      items={show}
      from={{ opacity: 0 }}
      enter={{ opacity: 1 }}
      leave={{ opacity: 0 }}
    >
      {(show) =>
        show &&
        ((props) => (
          <Container style={props}>
            <Backdrop onClose={onClose} />
            <ModalContainer
              title="transaction details"
              containerStyle={{
                maxHeight: "80vh",
                maxWidth: "90vw",
              }}
              onClose={onClose}
            >
              {typeof swap.localRes === "string"
                ? localError()
                : renderSwitch()}
            </ModalContainer>
          </Container>
        ))
      }
    </Transition>
  );
};

export default TxView;
