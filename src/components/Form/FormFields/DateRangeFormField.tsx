import DateRangeInputV2, {
  DateRange,
} from "@/components/Common/DateRangeInputV2";
import FormField from "@/components/Form/FormFields/FormField";
import {
  FormFieldBaseProps,
  useFormFieldPropsResolver,
} from "@/components/Form/FormFields/Utils";

import { classNames } from "@/Utils/utils";

type Props = FormFieldBaseProps<DateRange> & {
  max?: Date;
  min?: Date;
  disableFuture?: boolean;
  disablePast?: boolean;
  allowTime?: boolean;
};

/**
 * A FormField to pick a date range.
 *
 * Example usage:
 *
 * ```jsx
 * <DateRangeFormField
 *   {...field("user_date_of_birth_prediction")}
 *   label="Predicted date of birth"
 *   required
 *   disablePast // equivalent to min={new Date()}
 *   time={true} // allows picking time as well
 * />
 * ```
 */
const DateRangeFormField = (props: Props) => {
  const field = useFormFieldPropsResolver(props);

  const handleDateRangeChange = (newValue: DateRange) => {
    if (newValue.start && newValue.end) {
      if (newValue.end < newValue.start) {
        newValue.end = new Date(newValue.start);
      }
    }
    field.handleChange(newValue);
  };

  return (
    <FormField field={field}>
      <DateRangeInputV2
        name={field.name}
        className={classNames(field.error && "border-red-500")}
        value={field.value}
        onChange={handleDateRangeChange}
        disabled={field.disabled}
        min={props.min || (props.disableFuture ? new Date() : undefined)}
        max={props.max || (props.disablePast ? new Date() : undefined)}
        allowTime={props.allowTime}
      />
    </FormField>
  );
};

export default DateRangeFormField;
