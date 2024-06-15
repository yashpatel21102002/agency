import { getAuthUserDetails } from "@/lib/queries";
import MenuOptions from "./menu-options";

type Props = {
  id: string;
  type: "agency" | "subaccount";
};

const SideBar = async ({ id, type }: Props) => {
  const user = await getAuthUserDetails();

  //If no user then return as well as no agency also return
  if (!user) return null;
  if (!user.Agency) return null;

  //otherwise
  const details =
    type === "agency"
      ? user?.Agency
      : user?.Agency.SubAccount.find((subaccount) => subaccount.id === id);

  const isWhiteLabledAgency = user.Agency.whiteLabel;
  if (!details) return null;

  let sideBarLogo = user.Agency.agencyLogo || "/assets/plura-logo.svg";

  if (!isWhiteLabledAgency) {
    if (type === "subaccount") {
      sideBarLogo =
        user?.Agency.SubAccount.find((subaccount) => subaccount.id === id)
          ?.subAccountLogo || user.Agency.agencyLogo;
    }
  }

  const sideBarOpt =
    type === "agency"
      ? user.Agency.SidebarOption || []
      : user.Agency.SubAccount.find((subaccount) => subaccount.id === id)
          ?.SidebarOption || [];

  const subaccounts = user.Agency.SubAccount.filter((subaccount) =>
    user.Permissions.find(
      (permission) =>
        permission.subAccountId === subaccount.id && permission.access
    )
  );

  return (
    <>
      <MenuOptions
        defaultOpen={true}
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sideBarOpt}
        subAccounts={subaccounts}
        user={user}
      />
      <MenuOptions
        defaultOpen={false}
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sideBarOpt}
        subAccounts={subaccounts}
        user={user}
      />
    </>
  );
};

export default SideBar;
