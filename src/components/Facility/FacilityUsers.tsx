import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import CountBlock from "@/CAREUI/display/Count";

import Page from "@/components/Common/Page";
import UserListView from "@/components/Users/UserListAndCard";

import useFilters from "@/hooks/useFilters";

import { RESULTS_PER_PAGE_LIMIT } from "@/common/constants";

import routes from "@/Utils/request/api";
import query from "@/Utils/request/query";

export default function FacilityUsers(props: { facilityId: number }) {
  const { t } = useTranslation();
  const { qParams, updateQuery, Pagination } = useFilters({
    limit: RESULTS_PER_PAGE_LIMIT,
    cacheBlacklist: ["username"],
  });
  const [activeTab, setActiveTab] = useState(0);
  const { facilityId } = props;
  const { username } = qParams;

  const { data: userListData, isLoading: userListLoading } = useQuery({
    queryKey: ["facilityUsers", facilityId, qParams],
    queryFn: query(routes.facility.getUsers, {
      pathParams: { facility_id: facilityId },
      queryParams: {
        username,
        limit: qParams.limit,
        offset: (qParams.page - 1) * qParams.limit,
      },
    }),
    enabled: !!facilityId,
  });

  if (!userListData) {
    return <div>{t("no_users_found")}</div>;
  }

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
        users={userListData?.results ?? []}
        onSearch={(username) => updateQuery({ username })}
        searchValue={username || ""}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <Pagination totalCount={userListData.count} />
    </Page>
  );
}
