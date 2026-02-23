import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { YouTubeService } from './youtube.service';
import { YouTubeSearchQueryDto } from './dto/youtube-search-query.dto';
import { YouTubeSearchResponseDto } from './dto/youtube-search-response.dto';

@ApiTags('youtube')
@ApiBearerAuth()
@Controller('youtube')
export class YouTubeController {
  constructor(private readonly youtubeService: YouTubeService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search YouTube videos' })
  @ApiResponse({ status: 200, description: 'List of YouTube videos', type: YouTubeSearchResponseDto })
  async search(@Query() query: YouTubeSearchQueryDto) {
    const videos = await this.youtubeService.search(query.q);
    return { videos };
  }
}
