import { Course } from "@prisma/client";
import { OmitAndPartial } from "./object";

/* --------------------------------- Course --------------------------------- */
export interface CreateCourseProps
  extends Pick<
    Course,
    "name" | "description" | "teacherId" | "level" | "thumbnailUrl"
  > {
  categories?: Array<string>;
}

export type UpdateCourseProps = OmitAndPartial<
  Course,
  "createdAt" | "id" | "teacherId" | "updatedAt" | "deletedAt"
>;

export interface GetCoursesProps {
  skip?: string;
  limit?: string;
  teacherId?: string;
  category?: string;
}

export interface SearchQueryProp {
  query?: string;
  limit?: number;
  skip?: number;
}

/* ------------------------------- Enrollment ------------------------------- */
