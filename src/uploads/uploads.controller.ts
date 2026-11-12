import { Controller, Get, Param, Res, NotFoundException, UseGuards } from '@nestjs/common';
import type { Response } from 'express'; // 'import type' ব্যবহার করতে হবে
import { join } from 'path';
import { existsSync } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('uploads')
export class UploadsController {
  @UseGuards(JwtAuthGuard)
  @Get(':filename')
  seeUploadedFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('File does not exist');
    }

    return res.sendFile(filePath);
  }
}
