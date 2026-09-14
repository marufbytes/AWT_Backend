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
