// Packahes
import { useCallback, useEffect, useState } from "react";

// Components
import Button from "@/UI/components/Button/Button";
import Loader from "@/UI/components/Loader/Loader";
import CreateApiKeyModal from "./CreateApiKeyModal";
import { useAppStore } from "@/UI/lib/zustand/store";

// Styles
import styles from "./styles.module.scss";

const ApiKeyTable = () => {
  const { ithacaSDK, isAuthenticated } = useAppStore();
  const [apiPublicKey, setApiPublicKey] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [keyGenerationInProgress, setKeyGenerationInProgress] = useState(false);
  const [apiPrivateKey, setApiPrivateKey] = useState<string>();
  const [isApiKeyModalVisible, setIsApiKeyModalVisible] = useState(false);

  const handleGenerateApiKey = async () => {
    setKeyGenerationInProgress(true);
    setIsApiKeyModalVisible(true);
    try {
      const { privateKey, rsaPublicKey } = await ithacaSDK.auth.linkRSAKey();
      setApiPublicKey(rsaPublicKey);
      setApiPrivateKey(privateKey);
    } catch (error) {
      console.error("failed to link RSA key error", error);
      setIsApiKeyModalVisible(false);
    } finally {
      setKeyGenerationInProgress(false);
    }
  };

  const handleRegenerateApiKey = async () => {
    setKeyGenerationInProgress(true);
    try {
      await ithacaSDK.auth.unlinkRsaKey();
      const { privateKey, rsaPublicKey } = await ithacaSDK.auth.linkRSAKey();
      setApiPublicKey(rsaPublicKey);
      setApiPrivateKey(privateKey);
    } catch (error) {
      console.error("failed to regenerate RSA key error", error);
    } finally {
      setKeyGenerationInProgress(false);
    }
  };

  const handleDeleteKey = async () => {
    try {
      await ithacaSDK.auth.unlinkRsaKey();
      setApiPublicKey(undefined);
    } catch (error) {
      console.error("failed to unlink RSA key error", error);
    }
  };

  const handleCopy = () => {
    if (!apiPublicKey) return;
    navigator.clipboard.writeText(apiPublicKey);
  };

  const fetchApiPublicKey = useCallback(async () => {
    setIsLoading(true);
    const apiPublicKey = await ithacaSDK.auth.getLinkedRsaKey();
    setApiPublicKey(apiPublicKey);
    setIsLoading(false);
  }, [ithacaSDK]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchApiPublicKey();
  }, [fetchApiPublicKey, isAuthenticated]);

  return (
    <>
      <CreateApiKeyModal
        isOpen={isApiKeyModalVisible}
        onCloseModal={() => {
          setIsApiKeyModalVisible(false);
          setApiPrivateKey(undefined);
          setKeyGenerationInProgress(false);
        }}
        title={apiPublicKey ? "Regenerate API Key" : "Generate API Key"}
        apiPublicKey={apiPublicKey}
        apiPrivateKey={apiPrivateKey}
        handleRegenerateApiKey={handleRegenerateApiKey}
        keyGenerationInProgress={keyGenerationInProgress}
      />
      <div className={!isAuthenticated ? styles.isOpacity : ""}>
        <div className={styles.header}>
          <div className={styles.headerCell}>API Public Key</div>
          <div className={`${styles.headerCell} ${styles.cellEnd}`}>
            <Button
              size='sm'
              title='Click to generate API key'
              onClick={() => {
                if (apiPublicKey) {
                  setIsApiKeyModalVisible(true);
                } else {
                  handleGenerateApiKey();
                }
              }}
            >
              {keyGenerationInProgress ? (
                <Loader type='sm' />
              ) : apiPublicKey ? (
                "Regenerate API Key"
              ) : (
                "Generate API Key"
              )}
            </Button>
          </div>
        </div>

        <div className={styles.separator}></div>
        <div>
          {isLoading ? (
            <div className={styles.loaderContainer}>
              <Loader type='md' />
            </div>
          ) : apiPublicKey ? (
            <div className={styles.apiKeyContainer}>
              <span className={styles.cell}>{apiPublicKey}</span>
              <button className={styles.copy} onClick={handleCopy}>
                Copy
              </button>
              <button title='Click to unlink API key' className={styles.delete} onClick={handleDeleteKey}>
                Delete
              </button>
            </div>
          ) : (
            <p className={styles.emptyTable}>No API Key found</p>
          )}
        </div>
        <div className={styles.separator}></div>
      </div>
    </>
  );
};
export default ApiKeyTable;
