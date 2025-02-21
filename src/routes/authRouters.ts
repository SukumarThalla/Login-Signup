import { Hono } from "Hono";
import { UserControllers } from "../controllers/UserController";
import { jwtValidation, RemoveCookie } from "../middleware/authMiddleware";
import { seedFunction } from "../scripts/seeds";
const routes = new Hono();

routes.post("/signup", (c) => UserControllers.signUp(c));
routes.get("/verify-email/", (c) => UserControllers.verifyEmail(c));

routes.get("/signin", (c: any) => UserControllers.signInEjs(c));
routes.post("/signin", (c: any) => UserControllers.signIn(c));

routes.get("/forgot-password", (c: any) => UserControllers.forgetEjs(c));
routes.post("/forgot-password", (c: any) => UserControllers.forgetPassword(c));

routes.get("/reset-password", (c) => UserControllers.resetPasswordEjs(c));
routes.post("/reset-password", (c) => UserControllers.resetPassword(c));

routes.get("/dashboard", jwtValidation, (c) => UserControllers.dashBoard(c));
routes.get("/user/profile", jwtValidation, (c) =>
  UserControllers.userProfile(c)
);
routes.get("/update-password", jwtValidation, (c) =>
  UserControllers.updatePasswordEjs(c)
);
routes.post("/update-password", jwtValidation, (c) =>
  UserControllers.updatePassword(c)
);

routes.get("/products", jwtValidation, (c) => UserControllers.products(c));

routes.post("/add-product", jwtValidation, (c) =>
  UserControllers.addProducts(c)
);

routes.get("getAllProducts", jwtValidation, (c) =>
  UserControllers.getAllProducts(c)
);

 routes.post("/get-preSignUrl", async (c) => UserControllers.getSignUrl(c));
routes.get("signOut", RemoveCookie, (c) => UserControllers.signOut(c));

routes.get("/seed", async (c) => {
  await seedFunction(c);
  return c.json({ message: "Seeding completed!" });
});
export { routes };

//  route_Handlers.get("/get-users-data", (c: any) =>
//   UserDataControllers.getAllUsers(c)
// );

// route_Handlers.delete("/delete-users-data", (c: any) =>
//   UserDataControllers.deleteAllUsers(c)
// );
