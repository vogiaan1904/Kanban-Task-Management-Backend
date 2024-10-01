import { createWinstonLogger } from "@/configs";
import CourseService from "@/services/course.service";
import { CreateCourseProps, UpdateCourseProps } from "@/types/course";
import { CustomRequest } from "@/types/request";
import catchAsync from "@/utils/catchAsync";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
class CourseController {
  private readonly logger = createWinstonLogger(CourseController.name);

  constructor() {}

  createCourse = catchAsync(
    async (req: CustomRequest<CreateCourseProps>, res: Response) => {
      const course = await CourseService.createACourse(req.body);
      res.status(StatusCodes.CREATED).json({
        message: "Course created successfully",
        course: course,
      });
    },
  );

  updateCourse = catchAsync(
    async (req: CustomRequest<UpdateCourseProps>, res: Response) => {
      const courseId = req.params.id;
      const course = await CourseService.updateACourse(
        { id: courseId },
        req.body,
      );
      return res.status(StatusCodes.OK).json({
        message: "Update course successfully",
        status: "success",
        course: course,
      });
    },
  );

  getCourseById = catchAsync(async (req: Request, res: Response) => {
    const courseId = req.params.id;
    const course = await CourseService.getACourse({ id: courseId });
    return res.status(StatusCodes.OK).json({
      message: "Get course successfully",
      status: "success",
      course: course,
    });
  });
}

export default new CourseController();
