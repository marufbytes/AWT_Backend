import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Resume } from '../../resume/entities/resume.entity';


export enum UserRole {
  STUDENT = 'STUDENT',
  ALUMNI = 'ALUMNI',
  HR = 'HR',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Column({ nullable: true })
  hashedRefreshToken: string;

  // RELATIONS (Commented out for now until we build the other modules)
  // @ManyToOne(() => Company, company => company.users, { nullable: true })
  // company: Company;
  @OneToMany(() => Resume, resume => resume.student)
  resumes: Resume[];
  // @OneToMany(() => Application, app => app.student)
  // applications: Application[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}