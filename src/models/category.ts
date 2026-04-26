import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

export class Category extends Model {
  public id!: string;
  public name!: string;
  public user_id!: string;
  public is_active!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

Category.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "categories",

    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    paranoid: true,
    deletedAt: "deleted_at",
  },
);
