import { db } from "../db/dbConnection";
import { eq } from "drizzle-orm";
import { usersData } from "../db/schemes/usersData";
import { ProductTable } from "../db/schemes/products";
// import { PasswordRejectToken } from "../db/schemes/resetPasswordToken";
import { refreshToken } from "../db/schemes/refreshToken";
class DbServices {
  //MULTI SERVICE
  async existedUserCheck(email: string) {
    const result = await db
      .select()
      .from(usersData)
      .where(eq(usersData.email, email))
      .execute();
    return result[0];
  }
  async getUserById(userId: number) {
    const result = await db
      .select({
        Id: usersData.Id,
        email: usersData.email,
        firstName: usersData.firstName,
        lastName: usersData.firstName,
        phoneNumber: usersData.phoneNumber,
        gender: usersData.gender,
        city: usersData.city,
        address: usersData.address,
        password: usersData.password,
        isVerified: usersData.is_verified,
      })
      .from(usersData)
      .where(eq(usersData.Id, userId))
      .execute();
    return result[0];
  }
  //SIGNUP SERVICE
  async addUser(userData: any, hashPassword: string) {
    return await db
      .insert(usersData)
      .values({
        email: userData.email,
        password: hashPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        gender: userData.gender,
        address: userData.address,
        phoneNumber: userData.phoneNumber,
        city: userData.city,
      })
      .execute();
  }
  //VERIFY SERVICE
  async updateVerifyStatus(email: string) {
    return await db
      .update(usersData)
      .set({ is_verified: true })
      .where(eq(usersData.email, email));
  }
  //SIGNIN SERVICE
  async storeToken(userId: number, token: any) {
    return await db
      .insert(refreshToken)
      .values({ user_id: userId, token: token })
      .execute();
  }
  //FORGET SERVICE
  // async storeResetToken(user_id: number, token: string) {
  //   return await db
  //     .insert(PasswordRejectToken)
  //     .values({
  //       user_id: user_id,
  //       token: token,
  //     })
  //     .execute();
  // }
  //RESET PASSWORD AND UPDATE PASSWORD
  async updatePassword(user_id: number, newHashPassword: string) {
    return await db
      .update(usersData)
      .set({ password: newHashPassword })
      .where(eq(usersData.Id, user_id));
  }

  //ADD PRODUCT
  async addProduct(productData: any) {
    return await db
      .insert(ProductTable)
      .values({
        name: productData.name,
        description: productData.description,
        price: productData.price.toString(),
        stockQuantity: parseInt(productData.stockQuantity),
        category: productData.category,
        imageUrl: productData.imageUrl,
      })
      .execute();
  }

  //GET PRODUCTS

  async getAllProducts() {
    return await db.select().from(ProductTable);
  }

  // async deleteToken(token: any) {
  //   return await db
  //     .delete(PasswordRejectToken)
  //     .where(eq(PasswordRejectToken.token, token));
  // }
  // async getUserByToken(token: string) {
  //   const user = await db
  //     .select()
  //     .from(PasswordRejectToken)
  //     .where(eq(PasswordRejectToken.token, token));
  //   return user[0];
  // }

  // async getAllUsers(limit: number, offset: number, search?: string) {
  //   const query = db
  //     .select()
  //     .from(usersData)
  //     .orderBy(asc(usersData.Id))
  //     .limit(limit)
  //     .offset(offset);

  //   return search !== undefined
  //     ? await query.where(like(usersData.firstName, search))
  //     : await query;
  // }

  // async deleteAllUsers() {
  //   return await db.delete(usersData);
  // }
}

export const dbServices = new DbServices();
