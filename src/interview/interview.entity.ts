import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Application } from '../application/entities/application.entity';
import { InterviewStatus } from '../common/enums/InterviewStatus.enum';

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  applicationId: number;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({
    nullable:true
  })
  meetingLink: string;

  
  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.SCHEDULED,
  })
  status: InterviewStatus;

  @ManyToOne(() => Application, (application) => application.interviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicationId' })
  application: Application;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
