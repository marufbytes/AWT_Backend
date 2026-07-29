import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Application } from '../application/entities/application.entity';

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  applicationId: number;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column()
  meetingLink: string;

  @Column({ default: 'SCHEDULED' })
  status: string;

  @ManyToOne(() => Application, (application) => application.interviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicationId' })
  application: Application;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
