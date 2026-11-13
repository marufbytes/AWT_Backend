import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Internship } from '../../internship/entities/internship.entity';

export enum ReferralStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'referrerId' })
  referrer: User;

  @ManyToOne(() => Internship, { nullable: true })
  @JoinColumn({ name: 'internshipId' })
  internship: Internship | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  targetRole: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  company: string | null;

  @Column({ type: 'text', nullable: true })
  resumeUrl: string | null;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'enum', enum: ReferralStatus, default: ReferralStatus.PENDING })
  status: ReferralStatus;

  @CreateDateColumn()
  createdAt: Date;
}
