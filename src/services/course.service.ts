import { CustomError } from "@/configs";
import { prisma } from "@/database/connect.db";
import courseRepo from "@/repositories/course.repo";
import { CreateCourseProps, UpdateCourseProps } from "@/types/course";
import { Course, Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

class CourseService {
  private readonly prismaClient;

  constructor() {
    this.prismaClient = prisma;
  }

  createACourse = async (courseData: CreateCourseProps) => {
    const { name } = courseData;

    const existedCourse = await courseRepo.getOne({ name });
    if (existedCourse) {
      throw new CustomError(
        "Course is already existed. Please use another information",
        StatusCodes.CONFLICT,
      );
    }

    const course = await courseRepo.create(courseData);
    return course;
  };

  getACourse = async (filter: Prisma.CourseWhereInput) => {
    const { name, id } = filter;

    const course = await courseRepo.getOne({
      OR: [
        {
          id: id,
        },
        {
          name: name,
        },
      ],
    });
    if (!course) {
      throw new CustomError("Course not found.", StatusCodes.NOT_FOUND);
    }
    return course;
  };

  getCoursesByTeacherId = async (filter: Pick<Course, "teacherId">) => {
    const course = await courseRepo.getMany(filter);
    return course;
  };

  updateACourse = async (
    filter: Pick<Course, "id">,
    courseData: UpdateCourseProps,
  ) => {
    const course = await courseRepo.getOne(filter);
    if (!course) {
      throw new CustomError("Course not found.", StatusCodes.NOT_FOUND);
    }
    return await courseRepo.update(filter, courseData);
  };
}
export default new CourseService();
