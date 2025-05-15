
import { format } from "date-fns";
import type { MongoDate } from "@/types/mongo";

export const formatDate = (dateObj: MongoDate | string): string => {
  try {
    const dateString = typeof dateObj === 'object' && '$date' in dateObj ? dateObj.$date : dateObj;
    return format(new Date(dateString), "PPpp");
  } catch (e) {
    console.error('Date formatting error:', e);
    return 'Invalid date';
  }
};
