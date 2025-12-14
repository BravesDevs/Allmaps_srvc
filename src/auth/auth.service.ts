import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import mjml2html from 'mjml';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private transporter;

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) {
        const mailHost = this.configService.get<string>('MAIL_HOST');
        const mailPort = this.configService.get<number>('MAIL_PORT') || 587;
        const mailUser = this.configService.get<string>('MAIL_USER');

        this.logger.log(`Initializing Nodemailer with Host: ${mailHost}, Port: ${mailPort}, User: ${mailUser}`);

        this.transporter = nodemailer.createTransport({
            host: mailHost,
            port: mailPort,
            secure: false, // true for 465, false for other ports
            auth: {
                user: mailUser,
                pass: this.configService.get<string>('MAIL_PASS')
            }
        });
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: { id: user.id, email: user.email, isEmailVerified: user.isEmailVerified }
        };
    }

    async register(email: string, pass: string) {
        const hashedPassword = await bcrypt.hash(pass, 10);
        const verificationTokenPlain = `${email}-${Date.now()}`;
        const hashedToken = await bcrypt.hash(verificationTokenPlain, 10);

        try {
            const newUser = await this.usersService.create({
                email,
                password: hashedPassword,
                verificationToken: hashedToken,
                isEmailVerified: false
            });



            // Send Email
            const host = this.configService.get<string>('APP_HOST');
            const port = this.configService.get<string>('PORT');
            const link = `http://${host}:${port}/auth/verify?token=${verificationTokenPlain}`;

            // Read and compile MJML
            const templatePath = path.join(process.cwd(), 'src/auth/templates/verification.mjml');
            let template = fs.readFileSync(templatePath, 'utf8');

            // Basic customized replacement (for robust templating use handlebars, but simple replace works here)
            // Note: MJML must be compiled AFTER replacement if structure depends on data, but usually data is just text.
            // Better: Compile first then replace in HTML to avoid breaking MJML syntax, OR replace in MJML then compile.
            // Replacing in MJML is safer for layout if variables are just text.
            template = template.replace('{{name}}', 'Explorer'); // We don't have name field yet, default to Explorer
            template = template.replace(/{{verificationLink}}/g, link);

            const mjmlOutput = mjml2html(template);

            try {
                await this.transporter.sendMail({
                    from: '"Allmaps" <noreply@allmaps.com>',
                    to: email,
                    subject: '🚀 Verify Your Allmaps Email – Start Mapping!',
                    text: `Please verify your email by clicking on the following link: ${link}`,
                    html: mjmlOutput.html
                });
                this.logger.log(`Verification email sent to ${email}`);
            } catch (emailError) {
                this.logger.error(`Failed to send verification email to ${email}`, emailError);
                // Do not block signup
            }

            return { message: "Account created! Please check your email to verify your account.", user: { id: newUser.id, email: newUser.email } };

        } catch (error) {
            if (error.code === 'P2002') {
                throw new BadRequestException('Email already exists');
            }
            this.logger.error('Registration failed', error);
            throw error;
        }
    }

    async verifyEmail(token: string) {
        if (!token) throw new BadRequestException('Token is required');

        // Extract email from token (simplistic approach: split by last hyphen)
        const lastHyphenIndex = token.lastIndexOf('-');
        if (lastHyphenIndex === -1) throw new BadRequestException('Invalid token format');

        const email = token.substring(0, lastHyphenIndex);

        const user = await this.usersService.findOne(email);
        if (!user) {
            // Return simplified error as per requirements, or generic
            return { success: false, message: "Invalid or expired verification link." };
        }

        if (user.isEmailVerified) {
            return { success: false, message: "Email already verified." }; // Or generic message
        }

        const isValid = await bcrypt.compare(token, user.verificationToken || '');
        if (!isValid) {
            return { success: false, message: "Invalid or expired verification link." };
        }

        await this.usersService.update(user.id, {
            isEmailVerified: true,
            verificationToken: null
        });

        return { success: true, message: "Email verified successfully! You can now save workflows." };
    }
}
