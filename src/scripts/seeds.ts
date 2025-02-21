import { db } from "../db/dbConnection";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { Context } from "Hono";
import { ProductTable } from "../db/schemes/products";

export const seedFunction = async (c: Context) => {
  try {
    const dummyData = Array.from({ length: 50 }, () => ({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.commerce.price({ min: 100, max: 5000, dec: 2 }).toString(),
      stockQuantity: faker.number.int({ min: 1, max: 100 }),
      category: faker.commerce.department(),
      imageUrl: faker.image.url(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.insert(ProductTable).values(dummyData);
    return c.json({ success: "Successfully Inserted Dummy Data" }, 200);
  } catch (error) {
    console.log(error);
    return c.json({ error: "Seeding Function failed" }, 500);
  }
};
