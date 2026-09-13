import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ReferralApplicationStatus } from '../enums/referral-application-status.enum';
import { ReferralPost } from './referral-post.entity';

// A student's application to one of an alumni's APPROVED referral posts.
// A student may only apply once per post.
@Entity('referral_applications')
@Unique(['student', 'referralPost'])
export class ReferralApplication {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: ReferralApplicationStatus,
    default: ReferralApplicationStatus.PENDING,
  })
  status!: ReferralApplicationStatus;

  // Note sent back to the student, e.g. once the vacancy is filled.
  @Column({ type: 'text', nullable: true })
  responseMessage!: string | null;

  @CreateDateColumn()
  appliedAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  respondedAt!: Date | null;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'studentId' })
  student!: User;

  @ManyToOne(() => ReferralPost, (post) => post.applications, {
    nullable: false,
  })
  @JoinColumn({ name: 'referralPostId' })
  referralPost!: ReferralPost;
}
