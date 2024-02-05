import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/Guard';
import { RoleGuard } from 'src/auth/role/role.guard';
import { Roles } from 'src/auth/roles/roles.decorator';
import { RolesService } from './roles.service';



@UseGuards(JwtGuard, RoleGuard)
@Controller('roles')
export class RolesController {
    constructor(
        private rolesService:RolesService ,
        
      ) {}


    @Roles('admin',)
  @Get('allRoles')
  getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Roles('admin', 'user')
  @Get('addEditRole')
  addOrEditRole(roleToUpdate:any) {
    return this.rolesService.addOrUpdateRole(roleToUpdate);
  }


}
