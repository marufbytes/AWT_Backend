import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ReferralPostStatus } from '../enums/referral-post-status.enum';
import { ReferralApplication } from './referral-application.entity';

// A referral an alumni has posted for a vacancy at their company. It is
// created as PENDING and only becomes visible to students once an admin
// approves it.
@Entity('referral_posts')
export class ReferralPost {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 150, nullable: false })
  title!: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  companyName!: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  location!: string;

  @Column({ type: 'text', nullable: false })
  description!: string;

  @Column({ type: 'varchar', array: true, default: [] })
  requiredSkills!: string[];

  @Column({ type: 'int', default: 1 })
  vacancies!: number;

  @Column({ type: 'date', nullable: false })
  deadline!: string;

  @Column({
    type: 'enum',
    enum: ReferralPostStatus,
    default: ReferralPostStatus.PENDING,
  })
  status!: ReferralPostStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // The alumni who created this post.
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'alumniId' })
  alumni!: User;

  // Students the alumni pointed the company towards, ahead of any applications.
  @ManyToMany(() => User)
  @JoinTable({
    name: 'referral_post_suggested_students',
    joinColumn: { name: 'referralPostId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'studentId', referencedColumnName: 'id' },
  })
  suggestedStudents!: User[];

  @OneToMany(
    () => ReferralApplication,
    (application) => application.referralPost,
  )
  applications!: ReferralApplication[];
}
