import { Column, CreateDateColumn, Entity, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity'; 
import { Application } from '../../application/entities/application.entity';

@Entity()
export class Resume {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: false,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 1000,
    unique: false,
    nullable: false,
  })
  fileUrl: string;

  @Column({
    type: 'varchar',
    array: true,
    nullable: true,
  })
  skills: string[];

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @ManyToOne(() => User, user => user.resumes)
  @JoinColumn()
  student: User; 

  @OneToMany(()=>Application,(app)=>app.resume)
  applications:Application[];
  
}
