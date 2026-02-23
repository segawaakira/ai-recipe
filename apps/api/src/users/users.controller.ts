import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Delete,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { Public } from '../auth/public.decorator';
import { EmailVerificationService } from '../email/email-verification.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserResponseDto] })
  getUsers() {
    return this.usersService.listUsers();
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async createUser(@Body() user: CreateUserDto) {
    this.logger.log(`Creating user with email: ${user.email}`);

    try {
      const createdUser = await this.usersService.createUser(
        user.email,
        user.password,
      );
      this.logger.log(`User created successfully: ${createdUser.id}`);

      // メール認証メールを送信（失敗してもユーザー作成は成功させる）
      try {
        await this.emailVerificationService.createAndSendVerification(
          createdUser.id,
          createdUser.email,
        );
      } catch (emailError) {
        this.logger.error(
          `Failed to send verification email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`,
        );
      }

      // パスワードを除外してレスポンスを返す
      const { password, ...userWithoutPassword } = createdUser;
      return userWithoutPassword;
    } catch (error) {
      this.logger.error(
        `Error creating user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      if (
        error instanceof Error &&
        error.message === 'User with this email already exists'
      ) {
        throw new HttpException(
          'User with this email already exists',
          HttpStatus.CONFLICT,
        );
      }
      console.error('Create user error:', error);
      throw new HttpException(
        'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deleteUser(@Body() body: DeleteUserDto) {
    return this.usersService.deleteUser(body.id);
  }
}
