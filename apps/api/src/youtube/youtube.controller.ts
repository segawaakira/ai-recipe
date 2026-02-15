import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { YouTubeService } from './youtube.service';

@ApiTags('youtube')
@Controller('youtube')
export class YouTubeController {
  constructor(private readonly youtubeService: YouTubeService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search YouTube videos' })
  @ApiQuery({ name: 'q', type: String })
  @ApiResponse({ status: 200, description: 'List of YouTube videos' })
  async search(@Query('q') query: string) {
    const videos = await this.youtubeService.search(query);
    return { videos };
  }
}
