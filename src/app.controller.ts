import { BadRequestException, Body, Controller, Get, Post, Res, Req, UnauthorizedException } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { response, Response} from 'express';

import { AppService } from './app.service';
import { Repository } from 'typeorm';

@Controller('api')
export class AppController {
    constructor(
        private readonly appService: AppService, 
        private jwtService: JwtService,         
    ) {}

    @Post('register')
    async register(
        @Body('name') name: string,
        @Body('email') email: string,
        @Body('password') password: string
    ) {

        const hashedPassword = await hash(password, 12);

        let user = await this.appService.create({
            name, 
            email,
            password: hashedPassword
        })

        delete user.password;

        return user;
    }

    @Post('login')
    async login(
        @Body('email') email: string,
        @Body('password') password: string,
        @Res({passthrough: true}) res: Response
    ) {

        const user = await this.appService.findOne({email});
        
        if(!user) {
            throw new BadRequestException('invalid credentials');
        }

        if(!await compare(password, user.password)) {
            throw new BadRequestException('invalid credentials');
        }

        const jwt = await this.jwtService.signAsync({id: user.id});

        res.cookie('jwt', jwt, {httpOnly: true})

        return {message: 'success'};
    }

    @Get('user')
    async user(@Req() req: Request) {
        try {
            const cookie = req.cookie['jwt'];

            const data = await this.jwtService.verifyAsync(cookie);

            if(!data) {
                throw new UnauthorizedException();
            }

            const user = await this.appService.findOne({id: data['id']});

            const {password, ...result} = user;

            return user;
        } catch(err) {
            throw new UnauthorizedException();
        }    
    }

    @Post('logout')
    async logout(@Res({passthrough: true}) res: Response) {
        res.clearCookie('jwt');

        return {
            message: 'success'
        }
    }
}
