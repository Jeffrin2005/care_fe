import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { format, parseISO } from "date-fns";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import ColoredIndicator from "@/CAREUI/display/ColoredIndicator";
import CareIcon from "@/CAREUI/icons/CareIcon";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Loading from "@/components/Common/Loading";
import { ScheduleAPIs } from "@/components/Schedule/api";
import {
  getDaysOfWeekFromAvailabilities,
  getSlotsPerSession,
} from "@/components/Schedule/helpers";
import {
  ScheduleSlotTypes,
  ScheduleTemplate,
} from "@/components/Schedule/types";
import { formatAvailabilityTime } from "@/components/Users/UserAvailabilityTab";

import useSlug from "@/hooks/useSlug";
import { useToast } from "@/hooks/useToast";

import request from "@/Utils/request/request";

interface Props {
  items?: ScheduleTemplate[];
}

export default function ScheduleTemplatesList({ items }: Props) {
  const [scheduleTemplates, setScheduleTemplates] = useState<
    ScheduleTemplate[] | null
  >(items || null);
  const [isLoading, setIsLoading] = useState<boolean>(!items);
  const { toast } = useToast();
  const facilityId = useSlug("facility");
  const { t } = useTranslation();

  useEffect(() => {
    if (items !== undefined) {
      setScheduleTemplates(items);
      setIsLoading(false);
      return;
    }

    const fetchScheduleTemplates = async () => {
      if (!facilityId) {
        toast({
          title: t("error"),
          description: t("facility_id_is_missing"),
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      try {
        const { data } = await request(ScheduleAPIs.templates.list, {
          pathParams: { facility_id: facilityId },
        });

        if (data && "results" in data) {
          setScheduleTemplates(data.results);
        } else {
          throw new Error(t("invalid_response_format"));
        }
      } catch (error) {
        console.error(t("failed_to_fetch_schedule_templates"), error);
        toast({
          title: t("error"),
          description: t("failed_to_load_schedule_templates"),
          variant: "destructive",
        });
        setScheduleTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduleTemplates();
  }, [facilityId, items, toast, t]);

  const handleDelete = async (id: string) => {
    if (!scheduleTemplates || !facilityId) return;

    try {
      const { error } = await request(ScheduleAPIs.templates.delete, {
        pathParams: { facility_id: facilityId, id },
      });

      if (error) {
        throw new Error(t("failed_to_delete_template"));
      }

      setScheduleTemplates((prevTemplates) =>
        prevTemplates
          ? prevTemplates.filter((template) => template.id !== id)
          : [],
      );

      toast({
        title: t("success"),
        description: t("schedule_template_deleted_successfully"),
        variant: "default",
      });
    } catch (error) {
      console.error(t("failed_to_delete_schedule_template"), error);
      toast({
        title: t("error"),
        description: t(
          "an_error_occurred_while_deleting_the_schedule_template",
        ),
        variant: "destructive",
      });
    }
  };

  if (isLoading || scheduleTemplates === null) {
    return <Loading />;
  }

  if (scheduleTemplates.length === 0) {
    return (
      <div className="flex flex-col items-center text-center text-gray-500 py-64">
        <CareIcon icon="l-calendar-slash" className="size-10 mb-3" />
        <p>{t("No schedule templates found for this month.")}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {scheduleTemplates.map((template) => (
        <li key={template.id}>
          <ScheduleTemplateItem {...template} onDelete={handleDelete} />
        </li>
      ))}
    </ul>
  );
}

interface ScheduleTemplateItemProps extends ScheduleTemplate {
  onDelete: (id: string) => void;
}

const ScheduleTemplateItem: React.FC<ScheduleTemplateItemProps> = (props) => {
  const { onDelete } = props;
  const { t } = useTranslation();

  return (
    <div className="rounded-lg bg-white py-2 shadow">
      <div className="flex items-center justify-between py-2 pr-4">
        <div className="flex">
          <ColoredIndicator
            className="my-1 mr-2.5 h-5 w-1.5 rounded-r"
            id={props.id}
          />
          <div className="flex flex-col">
            <span className="text-lg font-semibold">{props.name}</span>
            <span className="text-sm text-gray-700">
              {t("scheduled_for")}{" "}
              <strong className="font-medium">
                {getDaysOfWeekFromAvailabilities(props.availabilities)
                  .map((day) => t(`days_of_week_short__${day}`))
                  .join(", ")}
              </strong>
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t("options")}>
              <DotsHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onDelete(props.id)}
            >
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-col gap-2 px-4 py-2">
        <ul className="flex flex-col gap-2">
          {props.availabilities.map((slot) => (
            <li key={slot.id} className="w-full">
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col">
                    <span>{slot.name}</span>
                    <p className="text-gray-600">
                      <span className="text-sm">
                        {
                          ScheduleSlotTypes[
                            (slot.slot_type as unknown as number) - 1
                          ]
                        }
                      </span>
                      <span className="px-2 text-gray-300">|</span>
                      <span className="text-sm">
                        {Math.floor(
                          getSlotsPerSession(
                            slot.availability[0].start_time,
                            slot.availability[0].end_time,
                            slot.slot_size_in_minutes,
                          ) ?? 0,
                        )}{" "}
                        {t("slots_of")} {slot.slot_size_in_minutes} {t("mins")}
                      </span>
                    </p>
                  </div>
                  <span className="text-sm">
                    {formatAvailabilityTime(slot.availability)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <span className="text-sm text-gray-500">
          {t("valid_from_till", {
            fromDate: format(parseISO(props.valid_from), "EEE, dd MMM yyyy"),
            toDate: format(parseISO(props.valid_to), "EEE, dd MMM yyyy"),
          })}
        </span>
      </div>
    </div>
  );
};
