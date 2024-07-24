import { useAccount } from "wagmi";

// Components
import Meta from "@/UI/components/Meta/Meta";
import Container from "@/UI/layouts/Container/Container";
import Main from "@/UI/layouts/Main/Main";

// Styles
import ApiKeyTable from "@/UI/components/ApiKeyManagement/ApiKeyTable";
import Panel from "@/UI/layouts/Panel/Panel";
import styles from "./api-management.module.scss";
import DisconnectedWallet from "@/UI/components/DisconnectedWallet/DisconnectedWallet";

const ApiManagement = () => {
  const { address } = useAccount();

  return (
    <>
      <Meta />
      <Main>
        <Container>
          <div className={styles.wrapper}>
            <h1>API Management</h1>
            <Panel margin='p-desktop-30 p-mobile-16 p-16' className={styles.container}>
              <h3>API List</h3>
              <ApiKeyTable />
              {!address && <DisconnectedWallet />}
            </Panel>
          </div>
        </Container>
      </Main>
    </>
  );
};
export default ApiManagement;
