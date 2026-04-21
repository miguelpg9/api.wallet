import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { User } from "./user";
import { Category } from "./category";

@Table({ tableName: "transactions", timestamps: false })
export class Transaction extends Model {
  @Column({ type: DataType.NUMBER, allowNull: false })
  amount!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  type!: string;

  @ForeignKey(() => Category)
  @Column({ type: DataType.UUID, allowNull: false })
  category_id!: string;

  @BelongsTo(() => Category)
  category!: Category;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  user_id!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column({ type: DataType.STRING })
  description!: string;

  @Column({ type: DataType.DATE, allowNull: false })
  date!: Date;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  created_at!: Date;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  is_active!: boolean;

  @Column({ type: DataType.DATE })
  deleted_at!: Date;
}
