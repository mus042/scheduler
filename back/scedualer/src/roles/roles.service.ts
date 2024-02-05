import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesService {


    constructor(
        private prisma: PrismaService,
      ) {}



      async getAllRoles(){
        try {
            const allRoles = this.prisma.role.findMany();
            return allRoles;
        } catch (error) {
            console.log({error})
        }
      }
      async addOrUpdateRole(roleToUpdate){
        try {
            const allRoles = this.prisma.role.update({where:{
                id:roleToUpdate.id,
            },data:{
                ...roleToUpdate
            }
        });
            return allRoles;
        } catch (error) {
            console.log({error})
        }
      }
}
