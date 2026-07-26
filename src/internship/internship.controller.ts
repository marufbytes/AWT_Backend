import { Controller } from '@nestjs/common';
import { InternshipService } from './internship.service';

@Controller('internship')
export class InternshipController {
  constructor(private readonly internshipService: InternshipService) {}
}
