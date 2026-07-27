import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Internship } from "../../internship/entities/internship.entity";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Company {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 100,
        unique: true,
    })
    name: string;

    @Column({
        type: 'varchar',
        length: 50
    })
    industry: string;

    @Column({
        type: 'varchar',
        length: 500,
        nullable: true
    })
    description: string;

    @Column({
        type: Boolean,
        default: false,
    })
    isVerified: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt:Date;

    @OneToMany(() => User, user => user.company)
    users: User[];

    @OneToMany(() => Internship, (internship) => internship.company)
    internships: Internship[];
}

