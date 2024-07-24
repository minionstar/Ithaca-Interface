// Components
import Button from "@/UI/components/Button/Button";
import Modal from "@/UI/components/Modal/Modal";
import Loader from "../Loader/Loader";

// Styles
import styles from "./styles.module.scss";

interface CreateApiKeyModal {
  isOpen: boolean;
  onCloseModal: () => void;
  title: string;
  apiPublicKey?: string;
  apiPrivateKey?: string;
  handleRegenerateApiKey: () => void;
  keyGenerationInProgress: boolean;
}

const CreateApiKeyModal = ({
  isOpen,
  onCloseModal,
  title,
  apiPublicKey,
  apiPrivateKey,
  handleRegenerateApiKey,
  keyGenerationInProgress,
}: CreateApiKeyModal) => {
  const handleCopy = () => {
    if (!apiPublicKey) return;
    navigator.clipboard.writeText(apiPublicKey);
  };

  const handleDownload = () => {
    if (!apiPrivateKey) return;
    const blob = new Blob([apiPrivateKey], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "private-key.pem";
    link.href = url;
    link.click();
  };

  return (
    <Modal isOpen={isOpen} title={title} onCloseModal={onCloseModal}>
      <div className={styles.modalContainer}>
        {apiPrivateKey ? (
          <>
            <div>
              <div className={styles.label}>API Public Key</div>
              <div className='flex flex-row mt-4'>
                <span className={styles.cell}>{apiPublicKey}</span>
                <button onClick={handleCopy} className={styles.copy}>
                  Copy
                </button>
              </div>
            </div>

            <div>
              <div className={styles.label}>API Security Key</div>
              <div className='flex flex-row mt-4'>
                <span className={styles.cell}>{`*`.repeat(55)}</span>
                <button onClick={handleDownload} className={styles.copy}>
                  Download
                </button>
              </div>
            </div>
          </>
        ) : keyGenerationInProgress ? (
          <div className={styles.loaderContainer}>
            <Loader type='md' />
          </div>
        ) : (
          <div>
            <div className={styles.label}>Delete API Key to Generate New API Key</div>
            <div className='flex flex-row mt-4'>
              <span className={styles.cell}>{apiPublicKey}</span>
              <button onClick={handleRegenerateApiKey} className={styles.delete}>
                Delete
              </button>
            </div>
          </div>
        )}
        <Button title='close' className='mt-10' onClick={onCloseModal}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
export default CreateApiKeyModal;
