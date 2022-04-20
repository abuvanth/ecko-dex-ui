/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react';
import styled, { css } from 'styled-components/macro';
import { throttle, debounce } from 'throttle-debounce';
import useWindowSize from '../hooks/useWindowSize';
import { useHistory } from 'react-router-dom';
import { FadeIn } from '../components/shared/animations';
import { AccountContext } from '../contexts/AccountContext';
import { GameEditionContext } from '../contexts/GameEditionContext';
import { ApplicationContext } from '../contexts/ApplicationContext';
import { ModalContext } from '../contexts/ModalContext';
import { PactContext } from '../contexts/PactContext';
import { SwapContext } from '../contexts/SwapContext';
import { WalletContext } from '../contexts/WalletContext';
import TxView from '../components/modals/TxView';
import WalletRequestView from '../components/modals/WalletRequestView';
import SwapButtonsForm from '../components/swap/SwapButtonsForm';
import SwapForm from '../components/swap/SwapForm';
import SwapResults from '../components/swap/SwapResults';
import SwapResultsGEv2 from '../components/swap/SwapResultsGEv2';
import tokenData from '../constants/cryptoCurrencies';
import { getCorrectBalance, reduceBalance } from '../utils/reduceBalance';
import TokenSelectorModalContent from '../components/modals/swap-modals/TokenSelectorModalContent';
import TokenSelectorModalContentGE from '../components/modals/swap-modals/TokenSelectorModalContentGE';
import SlippagePopupContent from '../components/layout/header/SlippagePopupContent';
import FormContainer from '../components/shared/FormContainer';
import GradientBorder from '../components/shared/GradientBorder';
import BackgroundLogo from '../components/shared/BackgroundLogo';
import ArcadeBackground from '../assets/images/game-edition/arcade-background.png';
import yellowInputBox from '../assets/images/game-edition/pixeled-box-yellow.svg';
import purpleInputBox from '../assets/images/game-edition/pixeled-box-purple.svg';
import Label from '../components/shared/Label';
import PixeledBlueContainer from '../components/game-edition-v2/components/PixeledInfoContainerBlue';
import useLazyImage from '../hooks/useLazyImage';
import LogoLoader from '../components/shared/Loader';
import { FlexContainer } from '../components/shared/FlexContainer';
import GameEditionModeButton from '../components/layout/header/GameEditionModeButton';
import { HistoryIcon } from '../assets';
import { ROUTE_MY_SWAP, ROUTE_SWAP } from '../router/routes';
import { SwapSuccessView, SwapSuccessViewGE } from '../components/modals/swap-modals/SwapSuccesTxView';
import { useInterval } from '../hooks/useInterval';

const Container = styled(FadeIn)`
  width: 100%;
  margin-top: 0px;
  position: relative;
  margin-left: auto;
  margin-right: auto;
  overflow: auto;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;

  ${({ gameEditionView }) => {
    if (gameEditionView) {
      return css`
        padding-top: 24px;
        padding-bottom: 16px;
        height: 100%;
        display: flex;
        flex-direction: column;
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        background-image: ${`url(${ArcadeBackground})`};
      `;
    } else {
      return css`
        max-width: 550px;
        overflow: visible;
      `;
    }
  }}
`;

const SvgContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  width: 32px;
  cursor: pointer;
  svg {
    height: 20px;
    width: 20px;
    path {
      fill: ${({ theme: { colors } }) => colors.white};
    }
  }
`;
const SwapContainer = () => {
  const history = useHistory();
  const [width, height] = useWindowSize();
  const pact = useContext(PactContext);
  const swap = useContext(SwapContext);
  const account = useContext(AccountContext);
  const wallet = useContext(WalletContext);
  const modalContext = useContext(ModalContext);
  const { resolutionConfiguration } = useContext(ApplicationContext);

  const { gameEditionView, openModal, closeModal, outsideToken } = useContext(GameEditionContext);
  const [tokenSelectorType, setTokenSelectorType] = useState(null);

  const [selectedToken, setSelectedToken] = useState(null);
  const [fromValues, setFromValues] = useState({
    amount: '',
    balance: '',
    coin: 'KDX',
    address: 'kaddex.kdx',
    precision: 12,
  });

  const [toValues, setToValues] = useState({
    amount: '',
    balance: account.account.balance || '',
    coin: 'KDA',
    address: 'coin',
    precision: 12,
  });

  const [inputSide, setInputSide] = useState('');
  const [fromNote, setFromNote] = useState('');
  const [toNote, setToNote] = useState('');
  const [fetchData, setFetchData] = useState(true);

  const [showTxModal, setShowTxModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingPair, setFetchingPair] = useState(false);
  const [noLiquidity, setNoLiquidity] = useState(false);
  const [priceImpact, setPriceImpact] = useState('');
  const [isLogoVisible, setIsLogoVisible] = useState(false);

  useEffect(() => {
    if (!isNaN(fromValues.amount)) {
      if (inputSide === 'from' && fromValues.amount !== '') {
        setToNote('(estimated)');
        setFromNote('');
        setInputSide(null);
        if (fromValues.coin !== '' && toValues.coin !== '' && !isNaN(pact.ratio)) {
          if (fromValues.amount.length < 5) {
            throttle(
              500,
              setToValues({
                ...toValues,
                amount: reduceBalance(
                  // fromValues.amount / pact.ratio,
                  pact.computeOut(fromValues.amount),
                  toValues.precision
                ),
              })
            );
          } else {
            debounce(
              500,
              setToValues({
                ...toValues,
                amount: reduceBalance(
                  // fromValues.amount / pact.ratio,
                  pact.computeOut(fromValues.amount),
                  toValues.precision
                ).toFixed(toValues.precision),
              })
            );
          }
        }
      }
      if (isNaN(pact.ratio) || fromValues.amount === '') {
        setToValues((prev) => ({ ...prev, amount: '' }));
      }
    }
  }, [fromValues.amount]);
  useEffect(() => {
    if (!isNaN(toValues.amount)) {
      if (inputSide === 'to' && toValues.amount !== '') {
        setFromNote('(estimated)');
        setToNote('');
        setInputSide(null);
        if (fromValues.coin !== '' && toValues.coin !== '' && !isNaN(pact.ratio)) {
          if (toValues.amount.length < 5) {
            throttle(
              500,
              setFromValues({
                ...fromValues,
                amount: reduceBalance(
                  // toValues.amount * pact.ratio,
                  pact.computeIn(toValues.amount),
                  fromValues.precision
                ),
              })
            );
            throttle(500, safeSetFrom(), fromValues.precision);
          } else {
            debounce(
              500,
              setFromValues({
                ...fromValues,
                amount: reduceBalance(
                  // toValues.amount * pact.ratio,
                  pact.computeIn(toValues.amount),
                  fromValues.precision
                ).toFixed(fromValues.precision),
              })
            );
            debounce(500, safeSetFrom(), fromValues.precision);
          }
        }
      }
      if (isNaN(pact.ratio) || toValues.amount === '') {
        setFromValues((prev) => ({ ...prev, amount: '' }));
      }
    }
  }, [toValues.amount]);
  useEffect(() => {
    if (!isNaN(pact.ratio)) {
      if (fromValues.amount !== '' && toValues.amount === '') {
        setToValues({
          ...toValues,
          amount: reduceBalance(pact.computeOut(fromValues.amount), toValues.precision),
        });
      }
      if (fromValues.amount === '' && toValues.amount !== '') {
        setFromValues({
          ...fromValues,
          amount: reduceBalance(pact.computeIn(toValues.amount), fromValues.precision),
        });
      }
      if (fromValues.amount !== '' && toValues.amount !== '') {
        setToValues({
          ...toValues,
          amount: reduceBalance(pact.computeOut(fromValues.amount), toValues.precision),
        });
      }
    }
  }, [pact.ratio]);
  useEffect(() => {
    if (!isNaN(pact.ratio)) {
      setPriceImpact(pact.computePriceImpact(Number(fromValues.amount), Number(toValues.amount)));
    } else {
      setPriceImpact('');
    }
  }, [fromValues.amount, toValues.amount, pact.ratio]);

  useEffect(() => {
    history.push(ROUTE_SWAP.concat(`?token0=${fromValues.coin}&token1=${toValues.coin}`));
  }, [fromValues.coin, toValues.coin]);

  useEffect(() => {
    const getBalance = async () => {
      if (account.account && account.fetchAccountBalance) {
        let acctOfFromValues = await account.getTokenAccount(tokenData[fromValues.coin]?.code, account.account.account, tokenSelectorType === 'from');
        let acctOfToValues = await account.getTokenAccount(tokenData[toValues.coin]?.code, account.account.account, tokenSelectorType === 'to');
        if (acctOfFromValues) {
          let balanceFrom = getCorrectBalance(acctOfFromValues.balance);
          setFromValues((prev) => ({
            ...prev,
            balance: balanceFrom,
          }));
        }
        if (acctOfToValues) {
          let balanceTo = getCorrectBalance(acctOfToValues.balance);
          setToValues((prev) => ({
            ...prev,
            balance: balanceTo,
          }));
        }
      }
    };
    getBalance();
  }, [account.fetchAccountBalance]);

  useEffect(() => {
    account.setFetchAccountBalance(true);
    return () => {
      account.setFetchAccountBalance(false);
    };
  }, []);

  /////// TOKENS RATIO LOGIC TO UPDATE INPUT BALANCE AND VALUES //////////
  useEffect(async () => {
    if (fetchData) {
      setFetchingPair(true);
      if (toValues.coin !== '' && fromValues.coin !== '') {
        await pact.getPair(fromValues.address, toValues.address);
        await pact.getReserves(fromValues.address, toValues.address);
      }
      setFetchingPair(false);
      setFetchData(false);
    }
  }, [fetchData]); //the getPair call is invoked when is selected a token

  /// POLLING ON UPDATE PACT RATIO
  useInterval(async () => {
    if (!isNaN(pact.ratio)) {
      await pact.getReserves(fromValues.address, toValues.address);
    }
  }, 10000);
  //////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (swap.walletSuccess) {
      setLoading(false);
      setFromValues({ amount: '', balance: '', coin: '', address: '' });
      setToValues({ amount: '', balance: '', coin: '', address: '' });
      pact.setWalletSuccess(false);
    }
  }, [swap.walletSuccess]);

  const swapValues = () => {
    const from = { ...fromValues };
    const to = { ...toValues };
    setFromValues({ ...to });
    setToValues({ ...from });
    if (toNote === '(estimated)') {
      setFromNote('(estimated)');
      setToNote('');
    }
    if (fromNote === '(estimated)') {
      setToNote('(estimated)');
      setFromNote('');
    }
  };
  // Check if their is enough liquidity before setting the from amount
  const safeSetFrom = () => {
    setNoLiquidity(false);
    if (0 >= pact.computeIn(toValues.amount)) {
      setNoLiquidity(true);
      setFromValues({
        ...fromValues,
        amount: 0,
      });
    } else {
      setFromValues({
        ...fromValues,
        amount: reduceBalance(pact.computeIn(toValues.amount), fromValues.precision),
      });
    }
  };
  const onTokenClick = async ({ crypto }) => {
    const side = outsideToken.tokenSelectorType || tokenSelectorType;
    let balance;
    if (crypto.code === 'coin') {
      if (account.account) {
        balance = account.account.balance;
      }
    } else {
      let acct = await account.getTokenAccount(crypto.code, account.account.account, side === 'from');
      if (acct) {
        balance = getCorrectBalance(acct.balance);
      }
    }
    if (side === 'from') {
      setFromValues((prev) => ({
        ...prev,
        balance: balance,
        coin: crypto.name,
        address: crypto.code,
        precision: crypto.precision,
      }));
    }
    if (side === 'to') {
      setToValues((prev) => ({
        ...prev,
        balance: balance,
        coin: crypto.name,
        address: crypto.code,
        precision: crypto.precision,
      }));
    }
    setFetchData(true);
  };

  const onSelectToken = async (crypto) => {
    if (tokenSelectorType === 'from' && fromValues.coin === crypto.name) return;
    if (tokenSelectorType === 'to' && toValues.coin === crypto.name) return;
    if ((tokenSelectorType === 'from' && fromValues.coin !== crypto.name) || (tokenSelectorType === 'to' && toValues.coin !== crypto.name)) {
      onTokenClick({ crypto });
    }
  };

  useEffect(() => {
    if (gameEditionView && outsideToken) {
      onSelectToken(outsideToken);
    }
  }, [outsideToken, gameEditionView]);

  useEffect(() => {
    if (tokenSelectorType === 'from') {
      if (fromValues.coin === toValues.coin) {
        setToValues({
          amount: '',
          balance: '',
          coin: '',
          address: '',
          precision: 0,
        });
      }
    }
    if (tokenSelectorType === 'to') {
      if (toValues.coin === fromValues.coin) {
        setFromValues({
          amount: '',
          balance: '',
          coin: '',
          address: '',
          precision: 0,
        });
      }
    }

    setTokenSelectorType(null);
  }, [toValues, fromValues]);

  const onWalletRequestViewModalClose = () => {
    wallet.setIsWaitingForWalletAuth(false);
    wallet.setWalletError(null);
    setLoading(false);
  };

  useEffect(() => {
    if (tokenSelectorType === 'from') return setSelectedToken(fromValues.coin);
    if (tokenSelectorType === 'to') return setSelectedToken(toValues.coin);
    return setSelectedToken(null);
  }, [tokenSelectorType]);

  // to handle token for game edition from token list
  useEffect(() => {
    if (outsideToken?.token && gameEditionView) {
      if (outsideToken?.tokenSelectorType === 'from' && fromValues.coin === outsideToken?.token.name) return;
      if (outsideToken?.tokenSelectorType === 'to' && toValues?.coin === outsideToken?.token.name) return;
      if (
        (outsideToken.tokenSelectorType === 'from' && fromValues.coin !== outsideToken?.token.name) ||
        (outsideToken.tokenSelectorType === 'to' && toValues?.coin !== outsideToken?.token.name)
      ) {
        onTokenClick({ crypto: outsideToken?.token });
        closeModal();
      }
    }
  }, [outsideToken, gameEditionView]);

  useEffect(() => {
    if (tokenSelectorType !== null) {
      handleTokenSelectorType();
    }
  }, [tokenSelectorType]);

  const handleTokenSelectorType = () => {
    if (gameEditionView) {
      openModal({
        titleFontSize: 32,
        title: 'Select',
        type: 'arcade-dark',
        onClose: () => {
          setTokenSelectorType(null);
        },
        content: (
          <FlexContainer gameEditionClassName="column w-100 h-100 justify-ce align-ce text-ce">
            <TokenSelectorModalContentGE
              selectedToken={selectedToken}
              tokenSelectorType={tokenSelectorType}
              onTokenClick={onTokenClick}
              onClose={() => {
                closeModal();
              }}
              fromToken={fromValues.coin}
              toToken={toValues.coin}
            />
          </FlexContainer>
        ),
      });
    } else {
      modalContext.openModal({
        title: 'Select',
        description: '',
        onClose: () => {
          setTokenSelectorType(null);
          modalContext.closeModal();
        },
        content: (
          <TokenSelectorModalContent
            selectedToken={selectedToken}
            token={tokenSelectorType === 'from' ? fromValues.coin : toValues.coin}
            onSelectToken={onSelectToken}
            onClose={() => {
              modalContext.closeModal();
            }}
            fromToken={fromValues.coin}
            toToken={toValues.coin}
          />
        ),
      });
    }
  };

  const sendTransaction = () => {
    setLoading(true);
    swap.swapSend();
    setShowTxModal(false);
    modalContext.closeModal();
    setLoading(false);
  };

  useEffect(() => {
    if (showTxModal) {
      if (gameEditionView) {
        openModal({
          titleFontSize: 32,
          containerStyle: { padding: 0 },
          titleContainerStyle: {
            padding: 16,
            paddingBottom: 0,
          },
          title: 'transaction details',
          onClose: () => {
            setShowTxModal(false);
            closeModal();
          },
          content: (
            <TxView
              onClose={() => {
                setShowTxModal(false);
                closeModal();
              }}
            >
              <SwapSuccessViewGE loading={loading} sendTransaction={sendTransaction} />
            </TxView>
          ),
        });
      } else {
        modalContext.openModal({
          title: 'transaction details',
          description: '',
          onClose: () => {
            setShowTxModal(false);
            modalContext.closeModal();
          },
          content: (
            <TxView
              onClose={() => {
                setShowTxModal(false);
                modalContext.closeModal();
              }}
            >
              <SwapSuccessView loading={loading} sendTransaction={sendTransaction} />
            </TxView>
          ),
        });
      }
    }
  }, [showTxModal]);

  const [loaded] = useLazyImage([ArcadeBackground, yellowInputBox, purpleInputBox]);

  return !loaded && gameEditionView ? (
    <LogoLoader />
  ) : (
    <Container gameEditionView={gameEditionView} onAnimationEnd={() => setIsLogoVisible(true)} className="scrollbar-none">
      <WalletRequestView show={wallet.isWaitingForWalletAuth} error={wallet.walletError} onClose={() => onWalletRequestViewModalClose()} />
      {!gameEditionView && isLogoVisible && <BackgroundLogo />}

      <FlexContainer
        className="justify-sb w-100"
        gameEditionClassName="justify-ce"
        style={{ marginBottom: 24 }}
        gameEditionStyle={{ marginBottom: 14 }}
      >
        <Label fontSize={32} geCenter fontFamily="syncopate" geFontSize={52} geLabelStyle={{ lineHeight: '32px' }}>
          SWAP
        </Label>
        {!gameEditionView && (
          <FlexContainer className="align-ce" gap={10}>
            <SvgContainer onClick={() => history.push(ROUTE_MY_SWAP)}>
              <HistoryIcon />
            </SvgContainer>
            <SvgContainer>
              <SlippagePopupContent />
            </SvgContainer>
            {width >= resolutionConfiguration?.width && height >= resolutionConfiguration?.height && <GameEditionModeButton />}
          </FlexContainer>
        )}
      </FlexContainer>

      <FormContainer
        gameEditionView={gameEditionView}
        footer={
          <SwapButtonsForm
            setLoading={setLoading}
            fetchingPair={fetchingPair}
            fromValues={fromValues}
            setFromValues={setFromValues}
            toValues={toValues}
            setToValues={setToValues}
            fromNote={fromNote}
            ratio={pact.ratio}
            loading={loading}
            noLiquidity={noLiquidity}
            setShowTxModal={setShowTxModal}
            showTxModal={showTxModal}
            onSelectToken={() => {
              if (!fromValues.coin) {
                setTokenSelectorType('from');
              } else {
                setTokenSelectorType('to');
              }
            }}
          />
        }
      >
        {!gameEditionView && <GradientBorder />}
        <SwapForm
          fromValues={fromValues}
          setFromValues={setFromValues}
          toValues={toValues}
          setToValues={setToValues}
          fromNote={fromNote}
          toNote={toNote}
          setTokenSelectorType={setTokenSelectorType}
          setInputSide={setInputSide}
          swapValues={swapValues}
          setShowTxModal={setShowTxModal}
        />
        {!isNaN(pact.ratio) && fromValues.amount && fromValues.coin && toValues.amount && toValues.coin ? (
          gameEditionView ? (
            <SwapResultsGEv2 priceImpact={priceImpact} fromValues={fromValues} toValues={toValues} />
          ) : (
            <SwapResults priceImpact={priceImpact} fromValues={fromValues} toValues={toValues} />
          )
        ) : (
          <>
            {gameEditionView ? (
              <PixeledBlueContainer label="Max Slippage" value={`${pact.slippage * 100}%`} style={{ marginTop: 10 }} />
            ) : (
              <FlexContainer className="w-100 justify-sb" style={{ margin: '16px 0' }}>
                <Label fontSize={13} geFontSize={20} geColor="blue">
                  Max slippage
                </Label>
                <Label fontSize={13} geFontSize={28}>{`${pact.slippage * 100}%`}</Label>
              </FlexContainer>
            )}
          </>
        )}
      </FormContainer>
    </Container>
  );
};
export default SwapContainer;
