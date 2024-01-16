import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactom from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from 'src/user/dto/editUser.dto';
import { EditShiftByDateDto, ShiftDto } from '../src/shift/dto';
import { EditShiftDto,bulkShiftsToEditDto } from '../src/shift/dto/index';
import { shift } from '@prisma/client';
import { scheduleDto } from 'src/schedule/dto';
import { generateScheduleForDateDto } from 'src/schedule/dto/GenerateScheduleForDate.Dto';

describe('App e2e', () => {
 let app :INestApplication;
 let prisma: PrismaService;
 
 beforeAll(async () => {
  const moduleRef =
    await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

  app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.init();
  await app.listen(3333);

  prisma = app.get(PrismaService);
  await prisma.cleanDB();
  pactom.request.setBaseUrl(
    'http://localhost:3333',
  );
});

afterAll(() => {
  app.close();
})

  describe('create users and shifts for week',()=>{
    for(let i = 0 ; i < 6 ;i++){
   
        const dto:AuthDto = {
          email:'testOshri${i}@gmail.com',
          password:'1234',
        };
    
      describe('SignUp',()=>{

        it("shoud sign up",()=>{
          return pactom.spec().post('/Auth/Signup').
          withBody(dto).expectStatus(201).inspect();
        });
      
      describe('SignIn',()=>{

        it("should signin",()=>{
        return pactom.spec().post('/Auth/Signin').
          withBody(dto).expectStatus(200).stores('userAt','acsess_token');
      });
    }); 
      });
  describe('schedule',()=>{
    describe('CreateNewScheduleForUser',()=>{


      it('should create new schedule for user',()=>{
       
        const scedualStart:Date = new Date(2023,6,20,6,0,0);
        const  scedualEnd:Date = new Date(2023,5,27);
        const dto:scheduleDto = {
          scedualStart:scedualStart,
          scedualEnd:scedualEnd,
          userId :1 , 
        }
        console.log(typeof 
          dto.scedualStart)
        return pactom.spec().post('/schedule/cnScheduleFU/').
        withHeaders({
          Authorization: 'Bearer $S{userAt}',
        }).withBody(dto).expectStatus(200).inspect();
      });

      it('should bulk edit user shift preference for futer schedule ',
        ()=>{
          const scheduleId = 1;  
          const shiftsToEdit: EditShiftByDateDto[] = []
           const start = new Date(2023,6,20,6,0,0);
           for (let i = 0; i < 7; i++) {
            let startDate = new Date(start);
      
            startDate.setDate(startDate.getDate() + i);
      
            const timeZoneCorrection = startDate.getHours() + 3;
            startDate.setHours(timeZoneCorrection);
      
            const shiftsADay: number = 3; // number of shifts per day, 24 must by divde by it.
            const shiftInterval: number = 24 / shiftsADay; //this will determain time of each shift
            const shiftType: number = 1; //the shift type
            for (let j = 0 ; j < shiftsADay; j++) {
              startDate.setHours((startDate.getHours() + (j < 1 ? 0 : shiftInterval)));
      
              console.log(startDate.getHours());
             
              const endDate = new Date(startDate);
          
              console.log({ j }, { startDate }, { endDate });
                const randomNum:string = (Math.floor(Math.random() * 3) + 1).toString() ;
              const editShift:EditShiftByDateDto = 
                {
                  shiftDate:endDate,
                   userPreference:randomNum,
                  }
                
                shiftsToEdit.push(editShift);
                // console.log({shiftsToEdit});
              }
            }
            
            const bulkShiftsToEdit:bulkShiftsToEditDto={
              scheduleId:scheduleId,
              shiftsEdit:shiftsToEdit,
            }; 
            console.log({bulkShiftsToEdit});
            console.log({shiftsToEdit});
            return pactom.spec().post('/schedule/editeFuterSceduleForUser/').
            withHeaders({
              Authorization: 'Bearer $S{userAt}',
            }).withBody(bulkShiftsToEdit).expectStatus(200).inspect();



          });
         
  
  });
  });
}
})










  /////////////////
    describe('Fill Empty schedule',()=>{
      it('should create new schedule ',()=>{

        const scheduleStart:Date = new Date(2023,7,1);
        const dto:generateScheduleForDateDto={
         
          scedualStart:scheduleStart,
        }
         return pactom.spec().post('/schedule/createSchedule/').
        withHeaders({
          Authorization: 'Bearer $S{userAt}',
        }).withBody(dto).expectStatus(200).inspect();
      })
    })





  })