import { User } from "./user";
import { Transaction } from "./transaction";
import { Category } from "./category";
import { Token } from "./token";

// USER → TRANSACTIONS
User.hasMany(Transaction, {
  foreignKey: "user_id",
});
Transaction.belongsTo(User, {
  foreignKey: "user_id",
});

// USER → CATEGORIES
User.hasMany(Category, {
  foreignKey: "user_id",
});
Category.belongsTo(User, {
  foreignKey: "user_id",
});

// CATEGORY → TRANSACTIONS
Category.hasMany(Transaction, {
  foreignKey: "category_id",
});
Transaction.belongsTo(Category, {
  foreignKey: "category_id",
});

// USER → TOKENS
User.hasMany(Token, {
  foreignKey: "user_id",
});
Token.belongsTo(User, {
  foreignKey: "user_id",
});
