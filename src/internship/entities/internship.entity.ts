import { Column, CreateDateColumn, Entity, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Internship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 150,
    unique: false,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'text',
    unique: false,
    nullable: false,
  })
  description: string;

  @Column({
    type: 'text',
    unique: false,
    nullable: false,
  })
  requirements: string;

  @Column({
    type: 'boolean',
    unique: false,
    nullable: false,
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;
}