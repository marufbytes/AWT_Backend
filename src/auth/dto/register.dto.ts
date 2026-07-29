import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum, IsEmpty } from 'class-validator';
import { UserRole } from '../../user/entities/user.entity';

export class RegisterDto {

  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsEnum(UserRole, { message: 'Role must be a valid UserRole enum (e.g. STUDENT, ALUMNI, HR, ADMIN)' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;

  

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  profilePictureUrl?: string;
}