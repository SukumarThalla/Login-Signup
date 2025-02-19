import { db } from "../db/dbConnection";
import { usersData } from "../db/schemes/usersData";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { Context } from "Hono";

export const seedFunction = async (c: Context) => {
  try {
    const dummyData = [];

    for (let i = 0; i < 500; i++) {
      const user = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phoneNumber: faker.phone.number().slice(0, 10),
        password: await bcrypt.hash("Password123", 5),
        city: faker.location.city(),
        address: faker.location.streetAddress(),
        gender: faker.person.sex(),
      };

      dummyData.push(user);
    }

    await db.insert(usersData).values(dummyData);
    return c.json({ success: "Successfully Inserted Dummy Data" }, 200);
  } catch (error) {
    console.log(error);
    return c.json({ error: "Seeding Function failed" }, 500);
  }
};
