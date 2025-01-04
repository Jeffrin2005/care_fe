import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import CountBlock from "@/CAREUI/display/Count";

import Page from "@/components/Common/Page";
import UserListView from "@/components/Users/UserListAndCard";

import useFilters from "@/hooks/useFilters";

import routes from "@/Utils/request/api";
import query from "@/Utils/request/query";

export default function FacilityUsers(props: { facilityId: number }) {
  const { t } = useTranslation();
  const { Pagination } = useFilters({
    limit: 18,
    cacheBlacklist: ["username"],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const { facilityId } = props;

  const { data: userListData, isLoading: userListLoading } = useQuery({
    queryKey: ["facilityUsers", facilityId],
    queryFn: query(routes.facility.getUsers, {
      pathParams: { facility_id: facilityId },
    }),
    enabled: !!facilityId,
  });

  if (userListLoading) {
    return <div>Loading...</div>;
  }
  if (!userListData) {
    return <div>{t("no_users_found")}</div>;
  }

  const filteredUsers = searchTerm
    ? userListData.results.filter((user) => {
        const searchString = searchTerm.toLowerCase();
        return (
          user.username?.toLowerCase().includes(searchString) ||
          user.first_name?.toLowerCase().includes(searchString) ||
          user.last_name?.toLowerCase().includes(searchString)
        );
      })
    : userListData.results;

  return (
    <Page title={`${t("users")}`} hideBack={true} breadcrumbs={false}>
      <CountBlock
        text={t("total_users")}
        count={userListData.count}
        loading={userListLoading}
        icon="d-people"
        className="my-3 flex flex-col items-center sm:items-start"
      />

      <UserListView
        users={filteredUsers}
        onSearch={(value) => setSearchTerm(value)}
        searchValue={searchTerm}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <Pagination totalCount={userListData.count} />
    </Page>
  );
}
