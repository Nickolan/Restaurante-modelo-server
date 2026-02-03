import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
    private readonly maxSize = 2 * 1024 * 1024; // 2MB
    private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    transform(file: Express.Multer.File): Express.Multer.File {
        if (!file) {
            return file; // Allow optional file uploads
        }

        // Validate file size
        if (file.size > this.maxSize) {
            throw new BadRequestException(
                `File size exceeds the maximum limit of ${this.maxSize / (1024 * 1024)}MB`,
            );
        }

        // Validate MIME type
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `Invalid file type. Only JPG, PNG, and WEBP images are allowed`,
            );
        }

        return file;
    }
}
