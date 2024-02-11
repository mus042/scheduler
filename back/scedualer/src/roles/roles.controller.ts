import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/Guard';
import { RoleGuard } from 'src/auth/role/role.guard';
import { Roles } from 'src/auth/roles/roles.decorator';
import { RolesService } from './roles.service';
import { GetUser } from 'src/Decorator';



@UseGuards(JwtGuard, RoleGuard)
@Controller('roles')
export class RolesController {
    constructor(
        private rolesService:RolesService ,
        
      ) {}


    @Roles('admin',)
  @Get('allRoles')
  getAllRoles(@GetUser('facilityId') facilityId: number) {
    //All Roles for spacific facility 
    return this.rolesService.getAllRoles(facilityId);
  }

  @Roles('admin', 'user')
  @Get('addEditRole')
  addOrEditRole(roleToUpdate:any) {
    return this.rolesService.addOrUpdateRole(roleToUpdate);
  }


}
