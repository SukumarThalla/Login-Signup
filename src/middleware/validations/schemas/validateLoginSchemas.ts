import * as v from "valibot";

export const validateEmailSchema = v.pipe(
  v.nonNullable(v.string(), "email cannot be null or undefined"),
  v.string("Must be string"),
  v.nonEmpty("Email is required"),
  v.email("Invalid Email address")
);

export const validatePasswordSchema = v.pipe(
  v.nonNullable(v.string("password must be in String Format")),
  v.nonEmpty("Password is Required"),
  v.minLength(8, "Password must be at least 8 characters"),
  v.regex(/[A-Z]/, "Must contain at least one upper character"),
  v.regex(/[a-z]/, "Must contain at least one lower character"),
  v.regex(/[0-9]/, "Must contain at least one number"),
  v.regex(/[!@#$%^&*]/, "Must contain at least one special character"),
  v.maxLength(20, "Maximum length of character is 30")
);


export const validateSignInSchema = v.object({
  email: validateEmailSchema,
  password: validatePasswordSchema,
});

export const ValidateNewPassword = v.object({
  newPassword: validatePasswordSchema,
  confirmPassword: validatePasswordSchema,
});

export const validateEmailSchemas = v.object({
  email: validateEmailSchema,
});

export const validateSignUpSchema = v.object({
  email: validateEmailSchema,
  password: validatePasswordSchema,
  firstName: v.pipe(
    v.nonNullable(v.string(), "Password cannot be null or undefined"),
    v.nonEmpty("First Name is Required"),
    v.minLength(3, "First Name must have at least 3 characters"),
    v.maxLength(30, "First name must be less than 40 characters"),
    v.trim()
  ),
  lastName: v.pipe(
    v.nonNullable(v.string(), "Password cannot be null or undefined"),
    v.nonEmpty("First Name is Required"),
    v.minLength(3, "First Name must have at least 3 characters"),
    v.maxLength(30, "First name must be less than 40 characters"),
    v.trim()
  ),
  phoneNumber: v.pipe(
    v.nonNullable(v.string(), "Phone Number cannot be null or undefined"),
    v.nonEmpty("Phone Number is Required"),
    v.minLength(10, "Phone No must contain at least 10 characters"),
    v.maxLength(14, "Phone No must be less than 15 characters"),
    v.trim()
  ),
  gender: v.pipe(
    v.nonNullable(v.string(), "Gender cannot be null or undefined"),
    v.nonEmpty("Gender is Required"),
    v.minLength(3, "First Name must have at least 3 characters"),
    v.maxLength(10, "First name must be less than 40 characters"),
    v.trim()
  ),
  address: v.pipe(
    v.nonNullable(v.string(), "address cannot be null or undefined"),
    v.nonEmpty("address is Required"),
    v.minLength(3, "address must have at least 3 characters"),
    v.maxLength(30, "address must be less than 40 characters"),
    v.trim()
  ),
  city: v.pipe(
    v.nonNullable(v.string(), "City cannot be null or undefined"),
    v.nonEmpty("City is Required"),
    v.minLength(3, "city must have at least 3 characters"),
    v.maxLength(20, "city must be less than 40 characters"),
    v.trim()
  ),
});

export type loginDate = v.InferInput<typeof validateSignUpSchema>;
export type Email = v.InferInput<typeof validateEmailSchema>;
