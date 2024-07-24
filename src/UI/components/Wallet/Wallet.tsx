// Packages
import { useEffect, useState } from "react";
import { useAppStore } from "@/UI/lib/zustand/store";

// Components
import ConnectWalletIcon from "../Icons/ConnectWalletIcon";
import ChevronDown from "../Icons/ChevronDown";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// Utils
import mixPanel from "@/services/mixpanel";
import ModalAcknowledgeTerms from "../ModalAcknowledgeTerms/ModalAcknowledgeTerms";
import LocationRestrictedModal from "../LocationRestricted/LocationRestrictedModal";

// Styles
import styles from "./Wallet.module.scss";

const Wallet = () => {
  const { ithacaSDK, isAuthenticated, isLocationRestricted } = useAppStore();

  const [showModal, setShowModal] = useState(false);
  const [showLocationRestrictedModal, setShowLocationRestrictedModal] = useState(false);
  const getSession = async () => {
    if (isAuthenticated) {
      const result = await ithacaSDK.auth.getSession();
      if (!result?.accountInfos?.tc_confirmation) {
        setShowModal(true);
      }
    }
  };

  useEffect(() => {
    getSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleAgreeAndContinue = async () => {
    try {
      const response = await ithacaSDK.points.addAccountData("tc_confirmation", "true");
      // POINTS_EVENTS: Account created - service connected
      mixPanel.track("Account created");
      if (response.result === "OK") {
        setShowModal(false);
      }
    } catch (error) {
      setShowModal(false);
    }
  };

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              className: styles.container,
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} type='button' className={styles.connectWallet}>
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type='button' className={styles.wrongNetwork}>
                    Wrong network
                    <ChevronDown color='#fff' />
                  </button>
                );
              }

              // Has to be last to allow for connecting
              if (isLocationRestricted) {
                return (
                  <>
                    <LocationRestrictedModal
                      isOpen={showLocationRestrictedModal}
                      onCloseModal={() => setShowLocationRestrictedModal(false)}
                    />
                    <button
                      onClick={() => setShowLocationRestrictedModal(true)}
                      type='button'
                      className={`${styles.wrongNetwork} ${styles.locationRestricted}`}
                    >
                      Location Restricted
                    </button>
                  </>
                );
              }

              return (
                <div className={styles.termsContainer}>
                  <ModalAcknowledgeTerms
                    isOpen={showModal && connected}
                    onCloseModal={() => setShowModal(false)}
                    onDisconnectWallet={openAccountModal}
                    onAgreeAndContinue={handleAgreeAndContinue}
                  />

                  <button onClick={openAccountModal} type='button' className={styles.connectedWallet}>
                    <span className={styles.displayName}>{account.displayName}</span>
                    <ConnectWalletIcon />
                    <ChevronDown className={styles.chevron} />
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default Wallet;
