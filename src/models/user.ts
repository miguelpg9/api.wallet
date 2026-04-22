import { Table, Model, Column, DataType, HasMany } from "sequelize-typescript";
import { Transaction } from "./transaction";
import { Category } from "./category";

@Table({ tableName: "users", timestamps: false })
export class User extends Model {
  @Column({ type: DataType.STRING })
  firstname!: string;

  @Column({ type: DataType.STRING })
  lastname!: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  password_hash!: string;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  created_at!: Date;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  is_active!: boolean;

  @Column({ type: DataType.DATE })
  deleted_at!: Date;

  @HasMany(() => Transaction)
  transactions!: Transaction[];

  @HasMany(() => Category)
  categories!: Category[];
}
