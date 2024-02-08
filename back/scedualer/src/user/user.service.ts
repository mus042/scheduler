import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto/editUser.dto';
import { user } from '@prisma/client';
import { EditUserAsAdminDto } from './dto/EditUserAdmin.dto';
import { userDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async editUser(userId: number, dto: EditUserDto) {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...dto,
        },
      });
      delete user.hash;
      return user;
    } catch (eror) {
      throw new ForbiddenException('user not fond ');
    }
  }
  async getAllUsers(facilityId) {
    try {
      console.log({facilityId})
      const users: user[] = await this.prisma.user.findMany(
        {
          where:{
          facilityId: facilityId,
        },
          include:{
          userProfile:true,
          role:true,
        }}
      );

      users?.forEach((element) => {
        delete element.hash;
      });

      return users;
    } catch (eror) {
      console.log('eror');
    }
  }

  async editUserAsAdmin( dto) {
    console.log(dto.userId, { dto });
    const id = dto.userId;
    try {
      const user = await this.prisma.user.update({
        where: {
          id: id,
     
        },
        data: {
          roleId:dto.roleId,
         
        },
      });
      delete user.hash;
console.log({dto});
      if(dto.userProfile){
        //try update the userprofile 
        const profile = await this.prisma.userProfile.update({where:{
          userId:user.id,
        },data:{
          ...dto.userProfile
        }

      });      console.log({profile})
      }
      return user;
    } catch (error) {
      console.log(error);
      throw new ForbiddenException('User not found');
    }
  }
}
