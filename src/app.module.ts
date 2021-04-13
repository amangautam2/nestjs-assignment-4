import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { User } from './user.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';


@Module({
  imports: [TypeOrmModule.forRoot(
    {
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'password',
        database: 'postgres',
        entities: [User],
        synchronize: true,
        logging: true  
    }), 
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
        secret: 'somesecret',
        signOptions: {expiresIn: '1d'}
    })
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
