import { User, UserProfifle } from "@prisma/client";

export interface CreateUserProps
  extends Pick<
    User & UserProfifle,
    "username" | "password" | "email" | "firstName" | "lastName"
  > {}

export interface CreateUsersProps {
  data: Array<CreateUserProps>;
}

export interface DeleteUsersProps {
  ids: Array<User["id"]>;
}
export interface UpdateUsersProps {
  data: Array<User>;
}

export interface UpdateUserProps extends Partial<User> {}
