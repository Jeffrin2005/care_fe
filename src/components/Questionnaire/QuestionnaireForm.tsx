import { useState } from "react";

import CareIcon from "@/CAREUI/icons/CareIcon";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { BadRequest, Error, Success } from "@/Utils/Notifications";
import routes from "@/Utils/request/api";
import request from "@/Utils/request/request";
import useQuery from "@/Utils/request/useQuery";
import {
  BatchRequestBody,
  BatchSubmissionResult,
  DetailedValidationError,
  QuestionValidationError,
  ValidationErrorResponse,
} from "@/types/questionnaire/batch";
import type { QuestionnaireResponse } from "@/types/questionnaire/form";
import type { Question } from "@/types/questionnaire/question";
import { QuestionnaireDetail } from "@/types/questionnaire/questionnaire";

import { QuestionGroup } from "./QuestionTypes/QuestionGroup";

interface QuestionnaireFormState {
  questionnaire: QuestionnaireDetail;
  responses: QuestionnaireResponse[];
  errors: QuestionValidationError[];
}

export interface QuestionnaireFormProps {
  questionnaires: QuestionnaireDetail[];
  resourceId: string;
  encounterId: string;
}

export function QuestionnaireForm({
  questionnaires,
  resourceId,
  encounterId,
}: QuestionnaireFormProps) {
  const [questionnaireForms, setQuestionnaireForms] = useState<
    QuestionnaireFormState[]
  >(
    questionnaires.map((q) => ({
      questionnaire: q,
      responses: [],
      errors: [],
    })),
  );

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: questionnaireList,
    loading,
    error,
  } = useQuery(routes.questionnaire.list);

  const clearErrors = (questionnaireId: string) => {
    setQuestionnaireForms((prev) =>
      prev.map((form) =>
        form.questionnaire.id === questionnaireId
          ? { ...form, errors: [] }
          : form,
      ),
    );
  };

  const updateQuestionnaireResponse = (
    questionnaireId: string,
    response: QuestionnaireResponse,
  ) => {
    setQuestionnaireForms((prev) =>
      prev.map((form) =>
        form.questionnaire.id === questionnaireId
          ? {
              ...form,
              responses: form.responses
                .filter((r) => r.question_id !== response.question_id)
                .concat(response),
              errors: form.errors.filter(
                (e) => e.question_id !== response.question_id,
              ),
            }
          : form,
      ),
    );
  };

  const handleSubmissionError = (results: ValidationErrorResponse[]) => {
    const updatedForms = [...questionnaireForms];
    const errorMessages: string[] = [];

    results.forEach((result, index) => {
      const form = updatedForms[index];

      result.data.errors.forEach(
        (error: QuestionValidationError | DetailedValidationError) => {
          // Handle question-specific errors
          if ("question_id" in error) {
            form.errors.push({
              question_id: error.question_id,
              error: `${error.error}`,
            } as QuestionValidationError);
          }
          // Handle form-level errors
          else if ("loc" in error) {
            const fieldName = error.loc[0];
            errorMessages.push(
              `Error in ${form.questionnaire.title}: ${fieldName} - ${error.msg}`,
            );
          }
          // Handle generic errors
          else {
            errorMessages.push(`Error in ${form.questionnaire.title}`);
          }
        },
      );
    });

    setQuestionnaireForms(updatedForms);

    if (errorMessages.length > 0) {
      BadRequest({ errs: errorMessages });
    }
  };

  const prepareSubmissionData = () =>
    questionnaireForms.map((form) => ({
      url: `/api/v1/questionnaire/${form.questionnaire.slug}/submit/`,
      method: "POST",
      body: {
        resource_id: resourceId,
        encounter: encounterId,
        results: form.responses.map((response) => ({
          question_id: response.question_id,
          values: response.values.map((value) => ({
            ...(value.code
              ? { code: value.code }
              : { value: String(value.value || "") }),
          })),
          note: response.note,
          taken_at: response.taken_at,
          body_site: response.body_site,
          method: response.method,
        })),
      },
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const batchRequests = prepareSubmissionData();

      const response = await request<
        { results: BatchSubmissionResult[] },
        BatchRequestBody
      >(routes.batchRequest, {
        body: {
          requests: batchRequests,
        },
      });

      if (!response.data) {
        if (response.error) {
          handleSubmissionError(
            response.error.results as ValidationErrorResponse[],
          );
        } else {
          Error({ msg: "No response data received" });
        }
      } else {
        Success({ msg: "All forms submitted successfully" });
      }
    } catch (error) {
      Error({ msg: "Failed to submit forms. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuestionnaire = (selected: QuestionnaireDetail) => {
    setQuestionnaireForms((prev) => {
      if (prev.some((form) => form.questionnaire.id === selected.id))
        return prev;
      return [...prev, { questionnaire: selected, responses: [], errors: [] }];
    });
    setIsOpen(false);
  };

  const removeQuestionnaire = (id: string) => {
    setQuestionnaireForms((prev) =>
      prev.filter((form) => form.questionnaire.id !== id),
    );
  };

  const availableQuestionnaires =
    questionnaireList?.results?.filter(
      (item) =>
        !questionnaireForms.some((form) => form.questionnaire.id === item.id),
    ) || [];

  const filteredQuestionnaires = availableQuestionnaires.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );

  const hasResponses = questionnaireForms.some(
    (form) => form.responses.length > 0,
  );

  console.log("errors", questionnaireForms[0].errors);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start">
              {loading ? (
                <>
                  <CareIcon
                    icon="l-spinner"
                    className="mr-2 h-4 w-4 animate-spin"
                  />
                  Loading...
                </>
              ) : (
                <span>Add Form</span>
              )}
            </Button>
          </PopoverTrigger>
          {!loading && !error && (
            <PopoverContent className="w-[200px] p-0" align="start">
              <div className="border-b p-2">
                <input
                  className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                  placeholder="Search forms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {filteredQuestionnaires.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    No forms found
                  </div>
                ) : (
                  filteredQuestionnaires.map((item) => (
                    <button
                      key={item.id}
                      className="w-full p-2 text-left hover:bg-accent hover:text-accent-foreground"
                      onClick={() => addQuestionnaire(item)}
                    >
                      {item.title}
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          )}
        </Popover>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {questionnaireForms.map((form) => (
          <div key={form.questionnaire.id} className="rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {form.questionnaire.title}
              </h3>
              {!questionnaires.some((q) => q.id === form.questionnaire.id) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestionnaire(form.questionnaire.id)}
                >
                  Remove
                </Button>
              )}
            </div>
            {form.questionnaire.questions.map((question: Question) => (
              <QuestionGroup
                key={question.id}
                question={question}
                questionnaireResponses={form.responses}
                updateQuestionnaireResponseCB={(response) =>
                  updateQuestionnaireResponse(form.questionnaire.id, response)
                }
                errors={form.errors}
                clearError={() => clearErrors(form.questionnaire.id)}
              />
            ))}
          </div>
        ))}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !hasResponses}>
            {isSubmitting ? (
              <>
                <CareIcon
                  icon="l-spinner"
                  className="mr-2 h-4 w-4 animate-spin"
                />
                Submitting...
              </>
            ) : (
              "Submit Forms"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
