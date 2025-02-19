import BaseExceptions from "../exceptions/BaseException";
import { Context } from "Hono";
function handleError(c: Context, err: any) {
  if (err instanceof BaseExceptions) {
    return c.json(
      {
        message: err.message,
        error: err.errData,
        status: err.status,
      },
      422
    );
  }

  return c.json({ error: "Unable to Process Now" }, 500);
}

export default handleError;
