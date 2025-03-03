import careConfig from "@careConfig";
import { differenceInMinutes, format } from "date-fns";
import { toPng } from "html-to-image";

import dayjs from "@/Utils/dayjs";
import { Time } from "@/Utils/types";
import { Patient } from "@/types/emr/newPatient";
import { PatientModel } from "@/types/emr/patient";

const DATE_FORMAT = "DD/MM/YYYY";
const TIME_FORMAT = "hh:mm A";
const DATE_TIME_FORMAT = `${TIME_FORMAT}; ${DATE_FORMAT}`;

type DateLike = Parameters<typeof dayjs>[0];

export const formatDateTime = (date: DateLike, format?: string) => {
  const obj = dayjs(date);

  if (format) {
    return obj.format(format);
  }

  // If time is 00:00:00 of local timezone, format as date only
  if (obj.isSame(obj.startOf("day"))) {
    return obj.format(DATE_FORMAT);
  }

  return obj.format(DATE_TIME_FORMAT);
};

export const formatTimeShort = (time: Time) => {
  return format(new Date(`1970-01-01T${time}`), "h:mm a").replace(":00", "");
};

export const relativeDate = (date: DateLike, withoutSuffix = false) => {
  const obj = dayjs(date);
  return `${obj.fromNow(withoutSuffix)}${
    withoutSuffix ? " ago " : ""
  } at ${obj.format(TIME_FORMAT)}`;
};

export const formatName = (user: { first_name: string; last_name: string }) => {
  return `${user.first_name} ${user.last_name}`;
};

export const formatDisplayName = (user: {
  first_name: string;
  last_name: string;
  username: string;
}) => {
  return user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.first_name || user.username || "User";
};

export const relativeTime = (time?: DateLike) => {
  return `${dayjs(time).fromNow()}`;
};

export const dateQueryString = (date: DateLike) => {
  if (!date || !dayjs(date).isValid()) return "";
  return dayjs(date).format("YYYY-MM-DD");
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Referred from: https://stackoverflow.com/a/9039885/7887936
 * @returns `true` if device is iOS, else `false`
 */
function _isAppleDevice() {
  if (navigator.platform.includes("Mac")) return true;
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

/**
 * `true` if device is an Apple device, else `false`
 */
export const isAppleDevice = _isAppleDevice();

export const isUserOnline = (user: { last_login: DateLike }) => {
  return user.last_login
    ? dayjs().subtract(5, "minutes").isBefore(user.last_login)
    : false;
};

export const isAndroidDevice = /android/i.test(navigator.userAgent);

export const getMapUrl = (latitude: string, longitude: string) => {
  return isAndroidDevice
    ? `geo:${latitude},${longitude}`
    : careConfig.mapFallbackUrlTemplate
        .replace("{lat}", latitude)
        .replace("{long}", longitude);
};

const getRelativeDateSuffix = (abbreviated: boolean) => {
  return {
    day: abbreviated ? "d" : "days",
    month: abbreviated ? "mo" : "months",
    year: abbreviated ? "Y" : "years",
  };
};

export const formatPatientAge = (
  obj: PatientModel | Patient,
  abbreviated = false,
) => {
  const suffixes = getRelativeDateSuffix(abbreviated);
  const start = dayjs(
    obj.date_of_birth
      ? new Date(obj.date_of_birth)
      : new Date(obj.year_of_birth!, 0, 1),
  );

  const end = dayjs(
    obj.death_datetime ? new Date(obj.death_datetime) : new Date(),
  );

  const years = end.diff(start, "years");
  if (years) {
    return `${years} ${suffixes.year}`;
  }

  // Skip representing as no. of months/days if we don't know the date of birth
  // since it would anyways be inaccurate.
  if (!obj.date_of_birth) {
    return abbreviated
      ? `Born ${obj.year_of_birth}`
      : `Born on ${obj.year_of_birth}`;
  }

  const month = end.diff(start, "month");
  const day = end.diff(start.add(month, "month"), "day");
  if (month) {
    return `${month}${suffixes.month} ${day}${suffixes.day}`;
  }
  return `${day}${suffixes.day}`;
};

/**
 * A utility method to format an array of string to human readable format.
 *
 * @param values Array of strings to be made human readable.
 * @returns Human readable version of the list of strings
 */
export const humanizeStrings = (strings: readonly string[], empty = "") => {
  if (strings.length === 0) {
    return empty;
  }

  if (strings.length === 1) {
    return strings[0];
  }

  const [last, ...items] = [...strings].reverse();
  return `${items.reverse().join(", ")} and ${last}`;
};

/**
 * Although same as `Objects.keys(...)`, this provides better type-safety.
 */
export const keysOf = <T extends object>(obj: T) => {
  return Object.keys(obj) as (keyof T)[];
};

export const properCase = (str: string) => {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const getMonthStartAndEnd = (date: Date) => {
  return {
    start: new Date(date.getFullYear(), date.getMonth(), 1),
    end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
  };
};

/**
 * Returns hours and minutes between two dates.
 *
 * Eg.
 * 1 hour and 30 minutes
 * 2 hours
 * 30 minutes
 */
export const getReadableDuration = (
  start: string | Date,
  end: string | Date,
) => {
  const duration = differenceInMinutes(end, start);
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  if (hours === 0 && minutes === 0) return "0 minutes";
  if (hours === 0) return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  if (minutes === 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${hours} hour${hours > 1 ? "s" : ""} and ${minutes} minute${
    minutes > 1 ? "s" : ""
  }`;
};

export const saveElementAsImage = async (id: string, filename: string) => {
  const element = document.getElementById(id);
  if (!element) return;

  try {
    const dataUrl = await toPng(element, {
      quality: 1.0,
    });

    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Failed to save element as image:", error);
  }
};

export const conditionalAttribute = <T>(
  condition: boolean,
  attributes: Record<string, T>,
) => {
  return condition ? attributes : {};
};

export const conditionalArrayAttribute = <T>(
  condition: boolean,
  attributes: T[],
) => {
  return condition ? attributes : [];
};

export const stringifyNestedObject = <
  T extends { name: string; parent?: Partial<T> },
>(
  obj: T,
  separator = ", ",
) => {
  const levels: string[] = [];

  let current: Partial<T> | undefined = obj;
  while (current?.name) {
    levels.push(current.name);
    current = current.parent;
  }

  return levels.join(separator);
};

export const mergeAutocompleteOptions = (
  options: { label: string; value: string }[],
  value?: { label: string; value: string },
) => {
  if (!value) return options;
  if (options.find((o) => o.value === value.value)) return options;
  return [value, ...options];
};
