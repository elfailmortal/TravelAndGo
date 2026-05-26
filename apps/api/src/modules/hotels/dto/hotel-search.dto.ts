import { IsString, IsNotEmpty, IsDateString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class HotelSearchDto {
  @IsString()
  @IsNotEmpty()
  cityCode: string;

  @IsDateString()
  checkin: string;

  @IsDateString()
  checkout: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9)
  adults: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9)
  rooms: number = 1;
}
