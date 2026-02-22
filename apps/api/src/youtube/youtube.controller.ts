import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { YouTubeService } from './youtube.service';
import { YouTubeSearchResponseDto } from './dto/youtube-search-response.dto';

@ApiTags('youtube')
@ApiBearerAuth()
@Controller('youtube')
export class YouTubeController {
  constructor(private readonly youtubeService: YouTubeService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search YouTube videos' })
  @ApiQuery({ name: 'q', type: String })
  @ApiResponse({ status: 200, description: 'List of YouTube videos', type: YouTubeSearchResponseDto })
  async search(@Query('q') query: string) {
    const videos = await this.youtubeService.search(query);
    return { videos };
  }
}
