import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ApplicationStatus } from "../../common/enums/application-status.enum";
import { ApplicationType } from "../../common/enums/application-type.enum";
import { User } from "../../user/entities/user.entity";
import { Internship } from "../../internship/entities/internship.entity";
import { Resume } from "../../resume/entities/resume.entity";
import { Interview } from "../../interview/interview.entity";

@Entity()
export class Application {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: ApplicationStatus,
        default: ApplicationStatus.PENDING,
    })
    status: ApplicationStatus;

    @Column({
        type: 'enum',
        enum: ApplicationType
    })
    type: ApplicationType;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.applications)
    @JoinColumn({ name: 'studentId' })
    student: User;


    @ManyToOne(() => User, (user) => user.referrals, {
        nullable: true
    })
    @JoinColumn({ name: 'referredById' })
    referredBy: User | null;



    @ManyToOne(() => Internship, (internship) => internship.applications)
    @JoinColumn({ name: 'internshipId' })
    internship: Internship;


    @ManyToOne(() => Resume, (resume) => resume.applications)
    @JoinColumn({ name: 'resumeId' })
    resume: Resume;

    @OneToMany(() => Interview, (interview) => interview.application)
    interviews: Interview[];


}

