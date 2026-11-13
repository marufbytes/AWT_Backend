import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Resume } from '../../resume/entities/resume.entity';
import { Company } from '../../company/entities/company.entity';
import { Application } from '../../application/entities/application.entity';
import { Internship } from '../../internship/entities/internship.entity';

export enum UserRole {
  STUDENT = 'STUDENT',
  ALUMNI = 'ALUMNI',
  HR = 'HR',
  ADMIN = 'ADMIN',
}

export enum HrApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
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

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: HrApprovalStatus,
    default: HrApprovalStatus.APPROVED,
  })
  hrApprovalStatus: HrApprovalStatus;

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

  @OneToMany(() => Internship, (internship) => internship.creator)
  createdInternships: Internship[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  designation: string;

  @Column({ nullable: true })
  linkedin: string;

  @Column({ type: 'int', nullable: true })
  gradYear: number;

  @Column({ type: 'text', nullable: true })
  bio: string;
}
