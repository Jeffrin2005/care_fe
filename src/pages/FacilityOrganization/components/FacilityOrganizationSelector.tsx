import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import CareIcon from "@/CAREUI/icons/CareIcon";

import Autocomplete from "@/components/ui/autocomplete";
import { Label } from "@/components/ui/label";

import routes from "@/Utils/request/api";
import query from "@/Utils/request/query";
import { FacilityOrganization } from "@/types/facilityOrganization/facilityOrganization";

interface FacilityOrganizationSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  facilityId: string;
}

interface AutoCompleteOption {
  label: string;
  value: string;
}

export default function FacilityOrganizationSelector(
  props: FacilityOrganizationSelectorProps,
) {
  const { t } = useTranslation();
  const { onChange, required, facilityId } = props;
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [selectedOrgData, setSelectedOrgData] =
    useState<FacilityOrganization | null>(null);

  const { data: organizations } = useQuery<{
    results: FacilityOrganization[];
  }>({
    queryKey: ["organizations", facilityId],
    queryFn: query(routes.facilityOrganization.list, {
      pathParams: { facilityId },
      queryParams: {
        parent: "",
      },
    }),
  });

  const getOrganizationOptions = (
    orgs?: FacilityOrganization[],
  ): AutoCompleteOption[] => {
    if (!orgs) return [];
    return orgs.map((org) => ({
      label: org.name,
      value: org.id,
    }));
  };

  const handleOrgChange = (value: string) => {
    setSelectedOrg(value);
    onChange(value);
    const selected = organizations?.results.find((org) => org.id === value);
    setSelectedOrgData(selected || null);
  };

  return (
    <>
      <Label className="mb-2">
        {t("select_department")}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="space-y-4">
        <Autocomplete
          value={selectedOrg}
          options={getOrganizationOptions(organizations?.results)}
          onChange={handleOrgChange}
          placeholder={t("select_department")}
        />

        {selectedOrgData && (
          <div className="rounded-md border p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CareIcon icon="l-building" className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium">{selectedOrgData.name}</p>
                  {selectedOrgData.description && (
                    <p className="text-sm text-gray-500">
                      {selectedOrgData.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
