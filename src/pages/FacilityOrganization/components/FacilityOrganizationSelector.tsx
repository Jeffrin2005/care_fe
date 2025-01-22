import { useQuery } from "@tanstack/react-query";
import { Building } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import CareIcon from "@/CAREUI/icons/CareIcon";

import Autocomplete from "@/components/ui/autocomplete";
import { Label } from "@/components/ui/label";

import routes from "@/Utils/request/api";
import query from "@/Utils/request/query";
import {
  FacilityOrganization,
  FacilityOrganizationResponse,
} from "@/types/facilityOrganization/facilityOrganization";

interface FacilityOrganizationSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  facilityId: string;
}

interface AutoCompleteOption {
  label: string;
  value: string;
  hasChildren?: boolean;
}

export default function FacilityOrganizationSelector(
  props: FacilityOrganizationSelectorProps,
) {
  const { t } = useTranslation();
  const { onChange, required, facilityId } = props;
  const [selectedLevels, setSelectedLevels] = useState<FacilityOrganization[]>(
    [],
  );
  const [selectedOrganization, setSelectedOrganization] =
    useState<FacilityOrganization | null>(null);

  const { data: getAllOrganizations } = useQuery<FacilityOrganizationResponse>({
    queryKey: ["organizations-root"],
    queryFn: query(routes.facilityOrganization.list, {
      pathParams: { facilityId },
      queryParams: {
        parent: "",
      },
    }),
  });

  const { data: currentLevelOrganizations } = useQuery<{
    results: FacilityOrganization[];
  }>({
    queryKey: [
      "organizations-current",
      selectedLevels[selectedLevels.length - 1]?.id,
    ],
    queryFn: query(routes.facilityOrganization.list, {
      pathParams: { facilityId },
      queryParams: {
        parent: selectedLevels[selectedLevels.length - 1]?.id,
      },
    }),
    enabled: selectedLevels.length > 0,
  });

  const handleLevelChange = (value: string, level: number) => {
    const orgList =
      level === 0
        ? getAllOrganizations?.results
        : currentLevelOrganizations?.results;

    const selectedOrg = orgList?.find((org) => org.id === value);
    if (!selectedOrg) return;

    const newLevels = selectedLevels.slice(0, level);
    newLevels.push(selectedOrg);
    setSelectedLevels(newLevels);
    setSelectedOrganization(selectedOrg);
    onChange(selectedOrg.id);
  };

  const getOrganizationOptions = (
    orgs?: FacilityOrganization[],
  ): AutoCompleteOption[] => {
    if (!orgs) return [];
    return orgs.map((org) => ({
      label: org.name + (org.has_children ? " →" : ""),
      value: org.id,
      hasChildren: org.has_children,
    }));
  };

  const handleEdit = (level: number) => {
    const newLevels = selectedLevels.slice(0, level);
    setSelectedLevels(newLevels);
    if (newLevels.length > 0) {
      const lastOrg = newLevels[newLevels.length - 1];
      setSelectedOrganization(lastOrg);
      onChange(lastOrg.id);
    } else {
      setSelectedOrganization(null);
    }
  };

  return (
    <>
      <Label className="mb-2">
        {t("select_department")}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="space-y-3">
        {selectedOrganization && (
          <div className="flex items-center gap-3 rounded-md border border-sky-100 bg-sky-50/50 p-2.5">
            <Building className="h-4 w-4 text-sky-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-sky-900 truncate">
                {selectedOrganization.name}
              </p>
              {selectedOrganization.has_children && (
                <p className="text-xs text-sky-600">
                  {t("Has Sub-departments")}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="space-y-1.5">
          {selectedLevels.map((org, index) => (
            <div key={org.id} className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 flex-1">
                {index > 0 && (
                  <CareIcon
                    icon="l-arrow-right"
                    className="h-3.5 w-3.5 text-gray-400 flex-shrink-0"
                  />
                )}
                <div
                  className="flex items-center justify-between flex-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm shadow-sm cursor-pointer hover:bg-gray-50"
                  onClick={() => handleEdit(index)}
                >
                  <span className="truncate">{org.name}</span>
                  <CareIcon
                    icon="l-angle-down"
                    className="h-3.5 w-3.5 ml-2 flex-shrink-0 text-gray-400"
                  />
                </div>
              </div>
            </div>
          ))}
          {(!selectedLevels.length ||
            selectedLevels[selectedLevels.length - 1]?.has_children) && (
            <div className="flex items-center gap-1.5">
              {selectedLevels.length > 0 && (
                <CareIcon
                  icon="l-arrow-right"
                  className="h-3.5 w-3.5 text-gray-400 flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <Autocomplete
                  value=""
                  options={getOrganizationOptions(
                    selectedLevels.length === 0
                      ? getAllOrganizations?.results
                      : currentLevelOrganizations?.results,
                  )}
                  onChange={(value: string) =>
                    handleLevelChange(value, selectedLevels.length)
                  }
                  placeholder={`${t("select")} ${
                    selectedLevels.length
                      ? t("sub department")
                      : t("department")
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
