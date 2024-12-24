import React, { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Form as FormContainer } from "@/components/ui/form";

import { FieldValidator } from "@/components/Form/FieldValidators";
import {
  FormContextValue,
  createFormContext,
} from "@/components/Form/FormContext";
import { FieldChangeEvent } from "@/components/Form/FormFields/Utils";
import {
  FormDetails,
  FormErrors,
  FormState,
  formReducer,
} from "@/components/Form/Utils";

import { DraftSection, useAutoSaveReducer } from "@/Utils/AutoSave";
import * as Notification from "@/Utils/Notifications";
import { classNames, isEmpty, omitBy } from "@/Utils/utils";

type Props<T extends FormDetails> = {
  className?: string;
  defaults: T;
  asyncGetDefaults?: (() => Promise<T>) | false;
  validate?: (form: T) => FormErrors<T>;
  onSubmit: (form: T) => Promise<FormErrors<T> | void>;
  onCancel?: () => void;
  noPadding?: true;
  disabled?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onDraftRestore?: (newState: FormState<T>) => void;
  children: (props: FormContextValue<T>) => React.ReactNode;
  hideRestoreDraft?: boolean;
  resetFormValsOnCancel?: boolean;
  resetFormValsOnSubmit?: boolean;
  hideCancelButton?: boolean;
};

const Form = <T extends FormDetails>({
  asyncGetDefaults,
  validate,
  hideCancelButton = false,
  ...props
}: Props<T>) => {
  const { t } = useTranslation();
  const initial = { form: props.defaults, errors: {} };
  const [isLoading, setIsLoading] = useState(!!asyncGetDefaults);
  const [state, dispatch] = useAutoSaveReducer<T>(formReducer, initial);
  const [isEdited, setIsEdited] = useState(false);
  const formVals = useRef(props.defaults);

  interface FormData extends FormDetails {
    [key: string]: unknown;
  }

  const methods = useForm<FormData>({
    defaultValues: props.defaults,
    mode: "onChange",
  });

  useEffect(() => {
    if (!asyncGetDefaults) return;

    asyncGetDefaults().then((form) => {
      dispatch({ type: "set_form", form });
      methods.reset(form);
      setIsLoading(false);
    });
  }, [asyncGetDefaults, methods, dispatch]);

  const handleSubmit = async (data: T) => {
    try {
      if (validate) {
        const errors = omitBy(validate(data), isEmpty) as FormErrors<T>;

        if (Object.keys(errors).length) {
          dispatch({ type: "set_errors", errors });

          if (errors.$all) {
            Notification.Error({ msg: errors.$all });
          }
          return;
        }
      }

      const errors = await props.onSubmit(data);
      if (errors) {
        dispatch({
          type: "set_errors",
          errors: { ...state.errors, ...errors },
        });
      } else if (props.resetFormValsOnSubmit) {
        dispatch({ type: "set_form", form: formVals.current });
        methods.reset(formVals.current);
        setIsEdited(false);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      Notification.Error({ msg: t("errors.form.submission") });
    }
  };

  const handleCancel = () => {
    if (props.resetFormValsOnCancel) {
      dispatch({ type: "set_form", form: formVals.current });
    }
    props.onCancel?.();
    setIsEdited(false);
  };

  const { Provider, Consumer } = useMemo(() => createFormContext<T>(), []);
  const disabled = isLoading || props.disabled;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit((data) => handleSubmit(data as T))}
        onKeyDown={(e: React.KeyboardEvent<HTMLFormElement>) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            methods.handleSubmit((data) => handleSubmit(data as T))();
          }
        }}
        className={classNames(
          "mx-auto w-full",
          !props.noPadding && "px-8 py-5 md:px-16 md:py-11",
          props.className,
        )}
        noValidate
      >
        <FormContainer {...methods}>
          <DraftSection
            handleDraftSelect={(newState: FormState<T>) => {
              dispatch({ type: "set_state", state: newState });
              methods.reset(newState.form);
              props.onDraftRestore?.(newState);
              setIsEdited(true);
            }}
            formData={state.form}
            hidden={props.hideRestoreDraft}
          >
            <Provider
              value={(name: keyof T, validate?: FieldValidator<T[keyof T]>) => {
                return {
                  name,
                  id: name,
                  onChange: ({ name, value }: FieldChangeEvent<T[keyof T]>) => {
                    dispatch({
                      type: "set_field",
                      name,
                      value,
                      error: validate?.(value),
                    });
                    setIsEdited(true);
                  },
                  value: state.form[name],
                  error: state.errors[name],
                  disabled,
                };
              }}
            >
              <div className="my-6">
                <Consumer>{props.children}</Consumer>
              </div>
              <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                {!hideCancelButton && (
                  <Button
                    onClick={handleCancel}
                    variant="secondary"
                    disabled={disabled}
                  >
                    {props.cancelLabel ?? t("Cancel")}
                  </Button>
                )}
                <Button
                  data-testid="submit-button"
                  type="submit"
                  disabled={disabled || !isEdited}
                  variant="primary"
                >
                  {props.submitLabel ?? t("Submit")}
                </Button>
              </div>
            </Provider>
          </DraftSection>
        </FormContainer>
      </form>
    </FormProvider>
  );
};

export default Form;
