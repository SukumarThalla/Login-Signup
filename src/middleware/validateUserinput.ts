import { flatten, safeParse } from "valibot";
import BaseExceptions from "../exceptions/BaseException";
function validateUserInput(
  schema: any,
  data: any,
  abortEarly?: any,
  showErrors = false
) {
  const validationResult = safeParse(schema, data, {
    abortPipeEarly: true,
    abortEarly: abortEarly ? true : false,
  });
  if (!validationResult.success) {
    const errData = flatten(validationResult.issues).nested || {};
    const errorsArray = Object.values(errData).flat();

    if (showErrors) {
      return {
        success: false,
        error: errorsArray,
      };
    }
    throw new BaseExceptions(errData, 422, "Validation failed");
  }

  return showErrors
    ? {
        success: true,
        error: validationResult.output,
      }
    : validationResult.output;
}

export default validateUserInput;
