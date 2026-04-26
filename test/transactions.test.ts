import request from "supertest";
import app from "../src/app";
import sequelize from "../src/config/database";
import { Category } from "../src/models/category";
import { Transaction } from "../src/models/transaction";

describe("Transactions endpoints", () => {
  let token: string;
  let userId: string;
  let categoryId: string;
  let categoryIdUser2: string;
  let transactionIdUser2: string;

  const userData = {
    firstName: "test",
    lastName: "user",
    email: "test@mail.com",
    password: "password123",
  };

  const userData2 = {
    firstName: "test2",
    lastName: "user2",
    email: "test2@mail.com",
    password: "anotherpassword123",
  };

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await sequelize.truncate({ cascade: true });

    await request(app).post("/api/auth/register").send(userData);
    await request(app).post("/api/auth/register").send(userData2);

    const loginRes = await request(app).post("/api/auth/login").send({
      email: userData.email,
      password: userData.password,
    });

    const loginResUser2 = await request(app).post("/api/auth/login").send({
      email: userData2.email,
      password: userData2.password,
    });

    token = loginRes.body.data.accessToken;
    userId = loginRes.body.data.user.id;

    const category = await Category.create({
      name: "Food",
      user_id: userId,
    });

    categoryId = category.id;

    const categoryUser2 = await Category.create({
      name: "Entertainment",
      user_id: loginResUser2.body.data.user.id,
    });

    categoryIdUser2 = categoryUser2.id;

    const transactionUser2 = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${loginResUser2.body.data.accessToken}`)
      .send({
        amount: 50,
        type: "expense",
        categoryId: categoryIdUser2,
        description: "Test transaction user 2",
        date: new Date(),
      });

    transactionIdUser2 = transactionUser2.body.data.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("POST /api/transactions", () => {
    it("should create a transaction", async () => {
      const res = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 100,
          type: "expense",
          categoryId,
          description: "Test transaction",
          date: new Date(),
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("id");
    });

    it("should fail with invalid data", async () => {
      const res = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: -100,
          type: "invalid_type",
          categoryId: "invalid",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should fail without auth", async () => {
      const res = await request(app).post("/api/transactions").send({
        amount: 100,
        type: "expense",
        categoryId,
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should fail if category belongs to another user", async () => {
      const res = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 100,
          type: "expense",
          categoryId: categoryIdUser2,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE /api/transactions/:id (SOFT DELETE)", () => {
    it("should soft delete transaction and not return it in API", async () => {
      const createRes = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 100,
          type: "expense",
          categoryId,
        });

      const id = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/transactions/${id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const getRes = await request(app)
        .get(`/api/transactions/${id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(getRes.statusCode).toBe(404);
      expect(getRes.body.success).toBe(false);
    });

    it("should keep record in DB (soft delete)", async () => {
      const createRes = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 100,
          type: "expense",
          categoryId,
        });

      const id = createRes.body.data.id;

      await request(app)
        .delete(`/api/transactions/${id}`)
        .set("Authorization", `Bearer ${token}`);

      const transaction = await Transaction.findOne({
        where: { id },
        paranoid: false,
      });

      expect(transaction).not.toBeNull();
      expect(transaction!.deleted_at).not.toBeNull();
    });

    it("should not delete transaction of another user", async () => {
      const res = await request(app)
        .delete(`/api/transactions/${transactionIdUser2}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/transactions filters", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 100,
          type: "expense",
          categoryId,
          date: "2024-01-01",
        });

      await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 200,
          type: "income",
          categoryId,
          date: "2024-02-01",
        });
    });

    it("should filter by type", async () => {
      const res = await request(app)
        .get("/api/transactions?type=expense")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.every((t: any) => t.type === "expense")).toBe(
        true,
      );
    });

    it("should filter by date range", async () => {
      const res = await request(app)
        .get("/api/transactions?from=2024-01-01&to=2024-01-31")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items.length).toBe(1);
    });
  });

  describe("GET /api/transactions includeDeleted", () => {
    it("should return deleted transactions when includeDeleted=true", async () => {
      const createRes = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 100,
          type: "expense",
          categoryId,
        });

      const id = createRes.body.data.id;

      await request(app)
        .delete(`/api/transactions/${id}`)
        .set("Authorization", `Bearer ${token}`);

      const res = await request(app)
        .get("/api/transactions?includeDeleted=true")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items.some((t: any) => t.id === id)).toBe(true);
    });
  });
});
