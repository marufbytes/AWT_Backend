import {
  Column, Entity, ManyToOne, OneToMany,
  PrimaryGeneratedColumn, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';

@Entity()
export class Internship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  requirements: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Company, (company) => company.internships)
  @JoinColumn({ name: 'companyId' })
  company: Company;

//   @OneToMany(() => Application, (app) => app.internship)
//   applications: Application[];
// 

}

