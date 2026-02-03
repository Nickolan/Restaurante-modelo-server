import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    async uploadImage(
        file: Express.Multer.File,
        folder: string = 'restaurant_menu',
    ): Promise<string> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'image',
                },
                (error: UploadApiErrorResponse, result: UploadApiResponse) => {
                    if (error) {
                        reject(new BadRequestException(`Image upload failed: ${error.message}`));
                    } else {
                        resolve(result.secure_url);
                    }
                },
            );

            uploadStream.end(file.buffer);
        });
    }
}
