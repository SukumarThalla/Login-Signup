import { Hono } from "Hono";
import { UserControllers } from "../controllers/UserController";
import { jwtValidation } from "../middleware/authMiddleware";
const route_Handlers = new Hono();

route_Handlers.post("/signup", (c) => UserControllers.signUp(c));
route_Handlers.get("/verify-email/", (c) => UserControllers.verifyEmail(c));

route_Handlers.get("/signin", (c: any) => UserControllers.signInEjs(c));
route_Handlers.post("/signin", (c: any) => UserControllers.signIn(c));

route_Handlers.get("/forgot-password", (c: any) =>
  UserControllers.forgetEjs(c)
);
route_Handlers.post("/forgot-password", (c: any) =>
  UserControllers.forgetPassword(c)
);

route_Handlers.get("/reset-password", (c) =>
  UserControllers.resetPasswordEjs(c)
);
route_Handlers.post("/reset-password", (c) => UserControllers.resetPassword(c));

route_Handlers.get("/user/profile", jwtValidation, (c) =>
  UserControllers.userProfile(c)
);
route_Handlers.get("/dashboard", jwtValidation, (c) =>
  UserControllers.dashBoard(c)
);

export { route_Handlers };

// route_Handlers.get("/get-users-data", (c: any) =>
//   UserDataControllers.getAllUsers(c)
// );

// route_Handlers.delete("/delete-users-data", (c: any) =>
//   UserDataControllers.deleteAllUsers(c)
// );
