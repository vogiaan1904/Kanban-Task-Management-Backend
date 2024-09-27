import { CustomError } from "@/configs";
import { prisma } from "@/database/connect.db";
import userRepo from "@/repositories/user.repo";
import { CreateUserProps } from "@/types/user";
import { generateCustomAvatarUrl } from "@/utils/avatar";
import { hashData } from "@/utils/bcrypt";
import { Prisma, Role, User, UserVerification } from "@prisma/client";
import { addMinutes } from "date-fns";
import { StatusCodes } from "http-status-codes";
interface UserFields extends Omit<User, "id"> {}
interface UserOptions {
  type?: "email" | "username" | "id";
  includeProfile?: boolean;
  deleteAction?: "soft" | "hard";
}

class UserService {
  private readonly prismaClient;

  constructor() {
    this.prismaClient = prisma;
  }

  /**
   * Model User
   */

  createAUser = async (userData: CreateUserProps) => {
    const { username, password, email, firstName, lastName, role } = userData;
    const existedUser = await userRepo.getOne({
      OR: [
        {
          email: email,
        },
        {
          username: username,
        },
      ],
    });
    if (existedUser) {
      throw new CustomError(
        "User is already existed. Please use another information",
        StatusCodes.CONFLICT,
      );
    }

    const userRoleData = {};
    if (role === Role.teacher.toString()) {
      Object.assign(userRoleData, {
        teacher: {
          create: {},
        },
      });
    } else if (role === Role.admin.toString()) {
      Object.assign(userRoleData, {
        admin: {
          create: {},
        },
      });
    } else {
      Object.assign(userRoleData, {
        student: {
          create: {},
        },
      });
    }
    const user = await userRepo.create({
      // nested creattion all sub tables, (userProfile, Student or Teacher)
      username: username,
      email: email,
      password: hashData(password),
      isVerified: true,
      userProfile: {
        create: {
          firstName,
          lastName,
          avatar: generateCustomAvatarUrl(firstName, lastName),
        },
      },
      ...userRoleData, // khi model student và teacher có thêm field thì phải làm giống userProfile
    });
    return { user };
  };

  getAUser = async (fields: Prisma.UserWhereInput, options?: UserOptions) => {
    const { id, email, username } = fields;
    const { includeProfile } = options || {};
    const user = await userRepo.getOne(
      {
        OR: [
          {
            id: id,
          },
          {
            email: email,
          },
          {
            username: username,
          },
        ],
      },
      {
        include: {
          userProfile: includeProfile,
        },
      },
    );
    if (!user) {
      throw new CustomError(
        "User not found. Please sign up",
        StatusCodes.NOT_FOUND,
      );
    }
    return user;
  };

  updateAUser = async (fields: Pick<User, "id">, user: Partial<UserFields>) => {
    return await userRepo.update(fields, user);
  };

  /**
   * Model UserProfile
   */

  createAUserProfile = async (data: Prisma.UserProfifleCreateInput) => {
    return await userRepo.createProfile(data);
  };

  /**
   * Model UserVerification
   */

  getAUserVerification = async (fields: Pick<UserVerification, "id">) => {
    return await userRepo.getVerification(fields);
  };

  createAUserVerification = async (
    data: Pick<UserVerification, "code" | "userId">,
    options?: {
      customExpriredDate: Date;
    },
  ) => {
    const now = new Date();
    const { userId, code } = data;
    const expiredAt = options?.customExpriredDate || addMinutes(now, 5);
    return await userRepo.createVerification({
      userId: userId,
      code: hashData(code),
      expiredAt: expiredAt,
      updatedAt: now,
    });
  };

  updateAUserVerification = async (
    data: Pick<UserVerification, "code" | "id">,
    options?: {
      customExpriredDate: Date;
    },
  ) => {
    const now = new Date();
    const { id, code } = data;
    const expiredAt = options?.customExpriredDate || addMinutes(now, 5);
    return await userRepo.updateVerification(
      { id },
      {
        code: hashData(code),
        expiredAt: expiredAt,
        updatedAt: now,
      },
    );
  };

  deleteAUserVerification = async (fields: Pick<UserVerification, "id">) => {
    return await userRepo.deleteVerification(fields);
  };

  deleteUserVerifications = async (
    fields: Prisma.UserVerificationWhereInput,
  ) => {
    return await userRepo.deleteVerifications(fields);
  };
}

export default new UserService();
