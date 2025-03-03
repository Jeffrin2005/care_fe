import { FilesTab } from "@/components/Files/FilesTab";

import { PatientProps } from ".";

export const PatientFilesTab = (props: PatientProps) => {
  return (
    <FilesTab
      type="patient"
      patientId={props.patientData.id}
      patient={props.patientData}
    />
  );
};
