import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, devAuthDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { orgAuth } from './dto/orgAuth';

@Injectable()
export class AuthService {
  constructor(
    private Prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

    //signUp as organiation , and facility 
    async signUpOrg(dto:orgAuth){
      try {
        //Add new Org and  facility 
        
          const org = await this.Prisma.organization.create({
            data:{
              name:dto.name,
            }
          });
          console.log({org})
          const user : devAuthDto={ email:dto.email,password:dto.password,orgId:org.id,userRole:'admin'}
        //Add new User to DB
          const token = await this.signup(user);
          // return org.id;
           console.log({token});
          return token;
      }
      catch (eror) {
        console.log(eror);
        if (eror.code === 'P2002') {
          throw new ForbiddenException('Email adress already in use ');
        }
    }
  }

  //sign as new user to user db, with known facility and orgId
  async signup(dto: AuthDto | devAuthDto) {
    //Generate pass hash
    const hash = await argon.hash(dto.password); // create hash for password
    delete dto.password;
    const userDto =
         { ...dto, hash }
          console.log({ dto });
    try {
      //Add new User to DB
      const user = await this.Prisma.user.create({
        data: userDto,
      });
      delete user.hash;
      //Return saved user
      return this.signToken(user.id, user.email);
    } catch (eror) {
      console.log(eror);
      if (eror.code === 'P2002') {
        throw new ForbiddenException('Email adress already in use ');
      }
     
    }
  }
 //sign in to existing user 
  async signin(dto: AuthDto) {
    const user = await this.Prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    //if user dont exist throw eror
    if (!user) throw new ForbiddenException('email not fond ');
    //comper the password and throw exeption
    const pwMatch = await argon.verify(user.hash, dto.password);
    //reurn the user
    if (!pwMatch) {
      throw new ForbiddenException('pasnot not fond ');
    }

    //check if user isAdmin

    //consider not deletig
    delete user.hash;
    console.log({ dto }, 'signin');
    return this.signToken(user.id, user.email);
  }

  //sign the token
  async signToken(
    userId: number,
    email: String,
  ): Promise<{ acsess_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('Jwt_secret');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '45m',
      secret: secret,
    });
    return { acsess_token: token };
  }
}
