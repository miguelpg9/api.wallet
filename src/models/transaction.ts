import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

export class Transaction extends Model {
  public id!: string;
  public amount!: number;
  public type!: "income" | "expense";
  public category_id!: string;
  public description!: string | null;
  public date!: Date;
  public user_id!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("income", "expense"),
      allowNull: false,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "transactions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    paranoid: true,
    deletedAt: "deleted_at",
  }
);