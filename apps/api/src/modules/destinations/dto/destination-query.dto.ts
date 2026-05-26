import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class DestinationQueryDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsOptional()
  @Length(2, 2)
  country?: string;
}
