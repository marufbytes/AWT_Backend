import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { Resume } from '../../resume/entities/resume.entity';
import { Company } from '../../company/entities/company.entity';
import { Application } from '../../application/entities/application.entity';

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

  @ManyToOne(() => Company, (company) => company.users, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @OneToMany(() => Resume, (resume) => resume.student)
  resumes: Resume[];

  @OneToMany(() => Application, (app) => app.student)
  applications: Application[];

  @OneToMany(() => Application, (app) => app.referredBy)
  referrals: Application[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
