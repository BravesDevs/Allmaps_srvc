import { Controller, Post, Body, UnauthorizedException, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Login a user' })
    @ApiResponse({ status: 200, description: 'Return the JWT access token.' })
    @ApiResponse({ status: 401, description: 'Invalid credentials.' })
    async login(@Body() body: LoginDto) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Post('signup')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
    async signup(@Body() body: SignupDto) {
        // Check if user exists (handled by database unique constraint usually, or check here)
        // For now rely on service/prisma error or simple flow
        return this.authService.register(body.email, body.password);
    }


    @Get('verify')
    @ApiOperation({ summary: 'Verify user email' })
    async verify(@Query('token') token: string, @Res() res: Response) {
        const result = await this.authService.verifyEmail(token);
        if (result.success) {
            // Redirect to frontend success page
            // Assuming frontend runs on same host/port if served statically, or different if dev.
            // For now assuming typical setup where we redirect to the frontend URL.
            // Ideally configService should provide FRONTEND_URL.
            // Detailed instruction said "redirect to a new frontend route", which implies 302.
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'; // Vite default
            return res.redirect(`${frontendUrl}/verify-success`);
        } else {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return res.redirect(`${frontendUrl}/verify-error`);
        }
    }
}
