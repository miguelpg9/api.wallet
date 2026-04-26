import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

export class Token extends Model {
  public id!: string;
  public token!: string;
  public user_id!: string;
  public expires_at!: Date;
  public revoked_at!: Date | null;

  public readonly created_at!: Date;
}

Token.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "refresh_tokens",
    timestamps: false,
  },
);
