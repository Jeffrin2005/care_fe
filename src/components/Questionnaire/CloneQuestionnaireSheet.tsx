import { useMutation, useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import { Building, ChevronDown, Loader2, X } from "lucide-react";
import { useNavigate } from "raviger";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import mutate from "@/Utils/request/mutate";
import query from "@/Utils/request/query";
import organizationApi from "@/types/organization/organizationApi";
import type { QuestionnaireDetail } from "@/types/questionnaire/questionnaire";
import questionnaireApi from "@/types/questionnaire/questionnaireApi";

interface Props {
  questionnaire: QuestionnaireDetail;
  trigger?: React.ReactNode;
}

export default function CloneQuestionnaireSheet({
  questionnaire,
  trigger,
}: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [newSlug, setNewSlug] = useState(questionnaire.slug + "-copy");
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: availableOrganizations, isLoading: isLoadingOrganizations } =
    useQuery({
      queryKey: ["organizations"],
      queryFn: query(organizationApi.list, {
        queryParams: {
          org_type: "role",
        },
      }),
      enabled: open,
    });

  const { mutate: cloneQuestionnaire, isPending: isCloning } = useMutation({
    mutationFn: mutate(questionnaireApi.create, {
      silent: true,
    }),
    onSuccess: async (data: QuestionnaireDetail) => {
      navigate(`/admin/questionnaire/${data.slug}`);
      setOpen(false);
    },
    onError: (error) => {
      const errorData = error.cause as { errors: { msg: string }[] };
      errorData.errors.forEach((er) => {
        toast.error(er.msg);
      });
    },
  });

  const handleClone = () => {
    if (!newSlug.trim()) {
      setError("Slug is required");
      return;
    }

    const clonedQuestionnaire = {
      ...questionnaire,
      slug: newSlug.trim(),
      id: undefined,
      status: "draft" as const,
      title: `${questionnaire.title} (Clone)`,
      organizations: selectedIds,
    };

    cloneQuestionnaire(clonedQuestionnaire);
  };

  const handleToggleOrganization = (orgId: string) => {
    setSelectedIds((current) =>
      current.includes(orgId)
        ? current.filter((id) => id !== orgId)
        : [...current, orgId],
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Clone Questionnaire</SheetTitle>
          <SheetDescription>
            Create a copy of this questionnaire with a new slug and select
            organizations.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Slug Input */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={newSlug}
              onChange={(e) => {
                setNewSlug(e.target.value);
                setError(null);
              }}
              placeholder="Enter a unique slug"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {/* Selected Organizations */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Selected Organizations</h3>
            <div className="flex flex-wrap gap-2">
              {selectedIds.length > 0 ? (
                availableOrganizations?.results
                  .filter((org) => selectedIds.includes(org.id))
                  .map((org) => (
                    <Badge
                      key={org.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {org.name}
                    </Badge>
                  ))
              ) : (
                <p className="text-sm text-gray-500">
                  {t("No organizations selected")}
                </p>
              )}
            </div>
          </div>

          {/* Organization Selector */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Add Organizations</h3>
            <div className="space-y-4">
              {/* Selected Organizations Display */}
              <div className="flex flex-wrap gap-2">
                {selectedIds.length > 0 ? (
                  availableOrganizations?.results
                    .filter((org) => selectedIds.includes(org.id))
                    .map((org) => (
                      <Badge
                        key={org.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {org.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => handleToggleOrganization(org.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))
                ) : (
                  <p className="text-sm text-gray-500">
                    {t("No organizations selected")}
                  </p>
                )}
              </div>

              {/* Organization Dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span>{t("Select Organizations")}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command className="rounded-lg border-none">
                    <CommandInput
                      placeholder={t("Search organizations...")}
                      className="h-9 px-3 border-none focus:ring-0"
                    />
                    <CommandEmpty className="py-2 px-3">
                      {t("No organizations found")}
                    </CommandEmpty>
                    <CommandGroup className="py-2">
                      {isLoadingOrganizations ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        availableOrganizations?.results
                          .filter((org) => !selectedIds.includes(org.id))
                          .map((org) => (
                            <CommandItem
                              key={org.id}
                              onSelect={() => handleToggleOrganization(org.id)}
                              className="px-2 py-1.5 text-sm"
                            >
                              <Building className="h-4 w-4 shrink-0 mr-2" />
                              <span className="truncate">{org.name}</span>
                            </CommandItem>
                          ))
                      )}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex w-full justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setNewSlug(questionnaire.slug + "-copy");
                setSelectedIds([]);
                setError(null);
                setOpen(false);
              }}
            >
              {t("Cancel")}
            </Button>
            <Button
              onClick={handleClone}
              disabled={
                isCloning || !newSlug.trim() || selectedIds.length === 0
              }
            >
              {isCloning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Cloning...")}
                </>
              ) : (
                t("Clone")
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
