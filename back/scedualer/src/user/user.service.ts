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
  async getAllUsers() {
    try {
      const users: user[] = await this.prisma.user.findMany();

      users?.forEach((element) => {
        delete element.hash;
      });

      return users;
    } catch (eror) {
      console.log('eror');
    }
  }

  async editUserAsAdmin(userId, dto) {
    console.log(userId, { dto });
    const id = userId;
    try {
      const user = await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          ...dto,
        },
      });
      delete user.hash;
      return user;
    } catch (error) {
      console.log(error);
      throw new ForbiddenException('User not found');
    }
  }
}
