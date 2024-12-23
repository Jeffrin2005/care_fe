import { useCallback, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

import CircularProgress from "@/components/Common/CircularProgress";
import Loading from "@/components/Common/Loading";
import Page from "@/components/Common/Page";
import {
  InvestigationGroup,
  InvestigationType,
} from "@/components/Facility/Investigations";
import ReportTable from "@/components/Facility/Investigations/Reports/ReportTable";
import {
  Investigation,
  InvestigationResponse,
} from "@/components/Facility/Investigations/Reports/types";
import AutocompleteMultiSelectFormField from "@/components/Form/FormFields/AutocompleteMultiselect";
import { FieldChangeEvent } from "@/components/Form/FormFields/Utils";

import * as Notification from "@/Utils/Notifications";
import routes from "@/Utils/request/api";
import request from "@/Utils/request/request";
import { PaginatedResponse } from "@/Utils/request/types";
import useTanStackQueryInstead from "@/Utils/request/useQuery";
import { formatPatientAge } from "@/Utils/utils";

const RESULT_PER_PAGE = 14;
interface InitialState {
  investigationGroups: InvestigationGroup[];
  selectedGroup: string[];
  investigations: InvestigationType[];
  selectedInvestigations: any[];
  investigationTableData: InvestigationResponse;
  isLoading: {
    investigationLoading: boolean;
    investigationGroupLoading: boolean;
    tableData: boolean;
  };
}

const initialState: InitialState = {
  investigationGroups: [],
  selectedGroup: [],
  investigations: [],
  selectedInvestigations: [],
  investigationTableData: [],
  isLoading: {
    investigationLoading: false,
    investigationGroupLoading: false,
    tableData: false,
  },
};

const investigationReportsReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case "set_investigation_groups":
      return {
        ...state,
        investigationGroups: action.payload,
      };
    case "set_selected_group":
      return {
        ...state,
        selectedGroup: action.payload,
      };
    case "set_investigations":
      return {
        ...state,
        investigations: action.payload,
      };
    case "set_selected_investigations":
      return {
        ...state,
        selectedInvestigations: action.payload,
      };
    case "set_investigation_table_data":
      return {
        ...state,
        investigationTableData: action.payload,
      };
    case "set_loading":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

const InvestigationReports = ({ id }: any) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [sessionPage, setSessionPage] = useState(1);
  const [isNextSessionDisabled, setIsNextSessionDisabled] = useState(false);
  const [state, dispatch] = useReducer(
    investigationReportsReducer,
    initialState,
  );

  const {
    investigationGroups,
    investigations,
    investigationTableData,
    isLoading,
    selectedGroup,
    selectedInvestigations,
  } = state as InitialState;

  const clearSelectedInvestigations = () => {
    dispatch({ type: "set_selected_investigations", payload: [] });
  };

  const fetchInvestigationsData = useCallback(
    async (
      onSuccess: (
        data: PaginatedResponse<Investigation>,
        pageNo: number,
      ) => void,
      curPage = 1,
      curSessionPage = 1,
    ) => {
      dispatch({
        type: "set_loading",
        payload: { ...isLoading, investigationLoading: true },
      });
      const pageStart = ((curPage || 1) - 1) * RESULT_PER_PAGE;
      const investigationsParams = (
        selectedInvestigations.length
          ? selectedInvestigations.map((i) => i.external_id)
          : investigations.map((i) => i.external_id)
      )
        .slice(pageStart, pageStart + RESULT_PER_PAGE)
        .join(",");

      if (investigationsParams.length === 0) {
        Notification.Error({
          msg: "No more reports to load",
        });
        dispatch({
          type: "set_loading",
          payload: { ...isLoading, investigationLoading: false },
        });
        return;
      }
      const data = await request(routes.getPatientInvestigation, {
        pathParams: { patient_external_id: id },
        query: {
          investigations: investigationsParams,
          session_page: curSessionPage,
        },
      });
      dispatch({
        type: "set_loading",
        payload: { ...isLoading, investigationLoading: false },
      });
      if (data && data.data?.results) {
        onSuccess(data.data, curPage);
        setPage(curPage + 1);
      }
    },
    [id, investigations, isLoading, selectedInvestigations],
  );

  const fetchInvestigation = useCallback(async () => {
    dispatch({
      type: "set_loading",
      payload: { ...isLoading, investigationLoading: true },
    });

    const data = await Promise.all(
      selectedGroup.map((group) =>
        request(routes.listInvestigations, {
          query: { group: group },
        }),
      ),
    );

    const investigationList = Array.from(
      data
        .flatMap((i) => i?.data?.results || [])
        .map((i) => ({
          ...i,
          name: `${i.name} ${i.groups[0].name ? " | " + i.groups[0].name : ""}`,
        }))
        .reduce((map, item) => map.set(item.external_id, item), new Map())
        .values(),
    );

    dispatch({ type: "set_investigations", payload: investigationList });
    dispatch({
      type: "set_loading",
      payload: { ...isLoading, investigationLoading: false },
    });
  }, [isLoading, selectedGroup]);

  useTanStackQueryInstead(routes.listInvestigationGroups, {
    onResponse: (res) => {
      if (res && res.data) {
        dispatch({
          type: "set_investigation_groups",
          payload: res.data.results,
        });
      }
    },
  });

  const { data: patientData, loading: patientLoading } =
    useTanStackQueryInstead(routes.getPatient, {
      pathParams: { id: id },
    });

  const handleGroupSelect = ({ value }: FieldChangeEvent<string[]>) => {
    dispatch({ type: "set_investigations", payload: [] });
    dispatch({ type: "set_investigation_table_data", payload: [] });
    dispatch({ type: "set_selected_investigations", payload: [] });
    dispatch({ type: "set_loading", payload: initialState.isLoading });
    dispatch({ type: "set_selected_group", payload: value });
  };

  const handleLoadMore = () => {
    const onSuccess = (
      data: PaginatedResponse<Investigation>,
      pageNo: number,
    ) => {
      if (data.results.length === 0 && pageNo + 1 <= totalPage) {
        fetchInvestigationsData(onSuccess, pageNo + 1, sessionPage);
      } else {
        dispatch({
          type: "set_investigation_table_data",
          payload: [...state.investigationTableData, ...data.results],
        });
      }
    };
    fetchInvestigationsData(onSuccess, page, sessionPage);
  };

  const handleGenerateReports = useCallback(
    (curSessionPage = 1) => {
      const onSuccess = (data: PaginatedResponse<Investigation>) => {
        if (curSessionPage > 1 && !data.results.length) {
          setSessionPage(curSessionPage - 1);
          setIsNextSessionDisabled(true);
        } else {
          setIsNextSessionDisabled(false);
          if (!data.results.length) {
            handleLoadMore();
          } else {
            dispatch({
              type: "set_investigation_table_data",
              payload: data.results,
            });
          }
        }
        document.getElementById("reports_section")?.scrollIntoView();
      };
      fetchInvestigationsData(onSuccess, 1, curSessionPage);
    },
    [fetchInvestigationsData],
  );

  const totalPage = Math.ceil(
    (selectedInvestigations.length || investigations.length) / RESULT_PER_PAGE,
  );

  const handleSessionPage = (go: "NEXT" | "PREV") => {
    const count = go === "PREV" ? sessionPage + 1 : sessionPage - 1;
    setSessionPage(count);
    handleGenerateReports(count);
  };

  const loadMoreDisabled = page - 1 >= totalPage || isLoading.tableData;
  const getTestDisabled =
    !selectedGroup.length ||
    isLoading.tableData ||
    isLoading.investigationLoading ||
    isLoading.investigationGroupLoading;
  const generateReportDisabled =
    !selectedGroup.length ||
    isLoading.tableData ||
    isLoading.investigationLoading;
  const prevSessionDisabled = sessionPage <= 1 || isLoading.tableData;
  const nextSessionDisabled = isNextSessionDisabled || isLoading.tableData;

  const buttonPrimary = "bg-green-500 text-white px-4 py-2 rounded";
  const buttonSecondary = "bg-gray-100 text-gray-500 px-4 py-2 rounded";

  if (patientLoading) {
    return <Loading />;
  }

  return (
    <Page
      title={t("investigation_reports")}
      crumbsReplacements={{
        patient: { style: "pointer-events-none" },
        [id]: { name: patientData?.name },
      }}
    >
      {!isLoading.investigationGroupLoading ? (
        <>
          <div className="mt-5">
            <AutocompleteMultiSelectFormField
              id="investigation-group-select"
              name="investigation-group-select"
              label={t("select_investigation_groups")}
              options={investigationGroups}
              value={selectedGroup}
              onChange={handleGroupSelect}
              optionLabel={(option) => option.name}
              optionValue={(option) => option.external_id}
              isLoading={isLoading.investigationLoading}
              placeholder={t("select_groups")}
              selectAll
            />
          </div>
          {!isLoading.investigationLoading && (
            <Button
              onClick={() => fetchInvestigation()}
              disabled={getTestDisabled}
              className={`my-2.5 ${buttonPrimary}`}
            >
              {t("get_tests")}
            </Button>
          )}
          {!!isLoading.investigationLoading && (
            <CircularProgress className="text-primary-500" />
          )}
          {!!investigations.length && (
            <>
              <div className="mt-5">
                <AutocompleteMultiSelectFormField
                  id="investigation-select"
                  name="investigation-select"
                  label={t("select_investigation")}
                  value={selectedInvestigations}
                  options={investigations}
                  onChange={({ value }) =>
                    dispatch({
                      type: "set_selected_investigations",
                      payload: value,
                    })
                  }
                  optionLabel={(option) => option.name}
                  optionValue={(option) => option.external_id}
                  isLoading={isLoading.investigationLoading}
                  placeholder={t("select_investigations")}
                  selectAll={true}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    setSessionPage(1);
                    handleGenerateReports(1);
                  }}
                  disabled={generateReportDisabled}
                  className={`my-2.5 ${buttonPrimary}`}
                >
                  {t("generate_report")}
                </Button>
                <Button
                  onClick={clearSelectedInvestigations}
                  disabled={!selectedInvestigations.length}
                  className={`my-2.5 ${buttonSecondary}`}
                >
                  {t("clear")}
                </Button>
              </div>
            </>
          )}
          {isLoading.tableData && (
            <div className="flex w-full justify-center">
              <CircularProgress className="text-primary-500" />
            </div>
          )}
          <section id="reports_section">
            {!!investigationTableData.length && (
              <>
                <div className="my-2.5">
                  <Button
                    onClick={() => handleSessionPage("NEXT")}
                    disabled={prevSessionDisabled}
                  >
                    {isLoading.tableData ? "Loading..." : t("next_sessions")}
                  </Button>
                  <Button
                    onClick={() => handleSessionPage("PREV")}
                    disabled={nextSessionDisabled}
                    className="ml-3"
                  >
                    {isLoading.tableData ? "Loading..." : t("prev_sessions")}
                  </Button>
                </div>

                <ReportTable
                  investigationData={investigationTableData}
                  title={t("report")}
                  patientDetails={{
                    name: patientData?.name || "",
                    age: patientData ? formatPatientAge(patientData, true) : "",
                    hospitalName: patientData?.facility_object?.name || "",
                  }}
                />

                {!loadMoreDisabled && (
                  <Button
                    disabled={loadMoreDisabled}
                    onClick={handleLoadMore}
                    className={`my-2.5 w-full${buttonPrimary}`}
                  >
                    {t("load_more")}
                  </Button>
                )}
              </>
            )}
          </section>
        </>
      ) : (
        <Loading />
      )}
    </Page>
  );
};

export default InvestigationReports;
