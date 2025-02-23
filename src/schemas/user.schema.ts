import { passwordRegex } from "@/types/regex";
import { CreateUserProps, UpdateUserProfileProps } from "@/types/user";
import Joi from "joi";

export const UpdateUserProfileSchema = Joi.object<UpdateUserProfileProps>()
  .keys({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
    address: Joi.string().optional(),
    birth: Joi.date().optional(),
    avatar: Joi.string().optional(),
    gender: Joi.string().optional(),
  })
  .min(1);

export const CreateUserSchema = Joi.object<CreateUserProps>().keys({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().regex(passwordRegex).required(),
  role: Joi.string().optional(),
});
