// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication, ValidationPipe } from '@nestjs/common';
// import * as request from 'supertest';
// import { AppModule } from './../src/app.module';
// import { PrismaService } from '../src/prisma/prisma.service';
// import * as pactom from 'pactum';
// import { AuthDto } from '../src/auth/dto';
// import { EditUserDto } from 'src/user/dto/editUser.dto';
// import { EditShiftByDateDto, ShiftDto } from '../src/shift/dto';
// import { EditShiftDto,bulkShiftsToEditDto } from '../src/shift/dto/index';
// import { shift } from '@prisma/client';
// import { scheduleDto } from 'src/schedule/dto';
// import { generateScheduleForDateDto } from 'src/schedule/dto/GenerateScheduleForDate.Dto';

// describe('App e2e', () => {
//  let app :INestApplication;
//  let prisma: PrismaService;
 
//  beforeAll(async () => {
//   const moduleRef =
//     await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();

//   app = moduleRef.createNestApplication();
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//     }),
//   );
//   await app.init();
//   await app.listen(3333);

//   prisma = app.get(PrismaService);
//   await prisma.cleanDB();
//   pactom.request.setBaseUrl(
//     'http://localhost:3333',
//   );
// });

// afterAll(() => {
//   app.close();
// })

//   describe('Auth',()=>{
//     const dto:AuthDto = {
//       email:'testOshri@gmail.com',
//       password:'1234',
//     };
//       describe('SignUp',()=>{
//         it("should throw eror if one of the requierd fields are empty or wrong",()=>{
//           const emailResponse =  pactom.spec().post('/Auth/Signup').
//           withBody({email:'',password:dto.password}).expectStatus(400).inspect();
      
//         const passwordResponse =  pactom.spec().post('/Auth/Signup').
//         withBody({email:dto.email,password:''}).expectStatus(400).inspect();
//       return emailResponse && passwordResponse; 
//       });
      
//         });
//         it("shoud sign up",()=>{
//           return pactom.spec().post('/Auth/Signup').
//           withBody(dto).expectStatus(201).inspect();
//         });
      
//       describe('SignIn',()=>{
//         it("should throw eror if email or password fields are empty or wrong",()=>{
//           const emailResponse =  pactom.spec().post('/Auth/Signin').
//           withBody({email:'',password:dto.password}).expectStatus(400).inspect();
      
//         const passwordResponse =  pactom.spec().post('/Auth/Signin').
//         withBody({email:dto.email,password:''}).expectStatus(400).inspect();
//       return emailResponse && passwordResponse; 
//       });
//         it("should signin",()=>{
//         return pactom.spec().post('/Auth/Signin').
//           withBody(dto).expectStatus(200).stores('userAt','acsess_token');
//       });
// })

// });
//   describe('User',()=>{
//     describe('Get Me',()=>{
      
//       it('should get current user',()=>{
//         return pactom.spec().get('/Users/me').
//         withHeaders({
//           Authorization: 'Bearer $S{userAt}',
//         }).expectStatus(200).inspect();
//       })           
//     });
//   })})
//     describe('Edit Me',()=>{
//       it('should edit user ',()=>{
//         const dto:EditUserDto = {
//           firstName:'Oshri',
//           email:'test2@gmail.com'
//         }
//         return pactom.spec().patch('/Users/editUser').
//         withHeaders({
//           Authorization: 'Bearer $S{userAt}',
//         }).withBody(dto).expectBodyContains(dto.firstName).expectBodyContains(dto.email)
//       })
//     });
//   });

//   describe('shift',()=>{
    
//     describe("Create a new shift for user",()=>{
      
//       it('should create new shift ',()=>{
//         const startTime = new Date(2023, 6, 6, 8, 0 );
//         const endTime = new Date(2023,6,6,14,0);
//         const dto:ShiftDto = {
//           userPreference: '0',
//           shiftDate :startTime,
//           shiftType :2,
//           shifttStartHour :startTime,
//           shiftEndHour:endTime,
//         };
//         return pactom.spec().post('/shifts/createShift/').withBody(dto).withHeaders({Authorization: 'Bearer $S{userAt}',
//       }).expectStatus(200).inspect();
//       });
      
//       it('should create new shift ',()=>{
//         const startTime = new Date(2023, 6, 6, 14, 0 );
//         const endTime = new Date(2023,6,6,22,0);
//         const dto:ShiftDto = {
//           userPreference: '0',
//           shiftDate :startTime,
//           shiftType :2,
//           shifttStartHour :startTime,
//           shiftEndHour:endTime,
          
//         };
//         return pactom.spec().post('/shifts/createShift/').withBody(dto).withHeaders({Authorization: 'Bearer $S{userAt}',
//       }).expectStatus(200).inspect();
//     });

//     });

//     //get all shifts of user 
//     describe("Get Shifts",()=>{
    
//         it('should return all shifts for userId',()=>{
//           const userId = {userId:1};
//           const shifts =  pactom.spec().get('/shifts/getAllShifts/').
//           withHeaders({
//             Authorization: 'Bearer $S{userAt}',
//           }).withBody(userId).expectStatus(200).inspect();
          
//           return shifts;
//         });
        
//       });


//     describe("Edit Shift",()=>{
     
//       describe("edit shift woth correct info",()=>{
// // try edit shift with valid info
//       it('should edit shift ',()=>{
//         const shiftId = 1;
//         const dto:EditShiftDto = {
//           shiftId: shiftId,
//           userPreference: '2',
//         };
       
//         return pactom.spec().post('/shifts/editShift/').withBody(dto).withHeaders({Authorization: 'Bearer $S{userAt}',
//       }).expectStatus(200).inspect();

//       });
//     });
//   });
// //     describe("edit shift woth wrong info",()=>{
// //       // try edit shift with valid info
// //             it('should return eror, invalid userPref. ',()=>{
// //               const dto:EditShiftDto = {
// //                 shiftId: 1,
// //                 userPreference: '5', //invalid userPreffernce 
// //               };
// //               return pactom.spec().post('/shifts/editShift/').withBody(dto).withHeaders({Authorization: 'Bearer $S{userAt}',
// //             }).expectStatus(403).inspect();
      
// //             });
// //           });
// //     });
  
//     describe("get shift by id",()=>{
    
//       //This will delete a shift by id
//       it('should get shift by id ',()=>{
//         const shiftId = {id:1};
//          return pactom.spec().get('/shifts/getShiftById/').withBody(shiftId).withHeaders({Authorization: 'Bearer $S{userAt}',
//        }).expectStatus(200).inspect();
 
//        });



//     });
//     describe("delete shift by id",()=>{
    
//       //This will delete a shift by id
//       it('should delte shift ',()=>{
//         const shiftId = {id:1};
       
//          return pactom.spec().post('/shifts/deleteShiftById/').withBody(shiftId).withHeaders({Authorization: 'Bearer $S{userAt}',
//        }).expectStatus(200).inspect();
 
//        });



//     });

//   });
//   describe('schedule',()=>{
//     describe('CreateNewScheduleForUser',()=>{


//       it('should create new schedule for user',()=>{
       
//         const scedualStart:Date = new Date(2023,6,20,6,0,0);
//         const  scedualEnd:Date = new Date(2023,5,24);
//         const dto:scheduleDto = {
//           scedualStart:scedualStart,
//           scedualEnd:scedualEnd,
//           userId :1 , 
//         }
//         console.log(typeof 
//           dto.scedualStart)
//         return pactom.spec().post('/schedule/cnScheduleFU/').
//         withHeaders({
//           Authorization: 'Bearer $S{userAt}',
//         }).withBody(dto).expectStatus(200).inspect();
//       });
//       //get all shifts of schedule,returns shiftId & userPref 
//       it('should get all shifts of schedule',()=>{

//       });

//       it('should bulk edit user shift preference for futer schedule ',
//         ()=>{
//           const scheduleId = 1;  
//           const shiftsToEdit: EditShiftByDateDto[] = []
//            const start = new Date(2023,6,20,6,0,0);
//            for (let i = 0; i < 7; i++) {
//             let startDate = new Date(start);
      
//             startDate.setDate(startDate.getDate() + i);
      
//             const timeZoneCorrection = startDate.getHours() + 3;
//             startDate.setHours(timeZoneCorrection);
      
//             const shiftsADay: number = 3; // number of shifts per day, 24 must by divde by it.
//             const shiftInterval: number = 24 / shiftsADay; //this will determain time of each shift
//             const shiftType: number = 1; //the shift type
//             for (let j = 0 ; j < shiftsADay; j++) {
//               startDate.setHours((startDate.getHours() + (j < 1 ? 0 : shiftInterval)));
      
//               console.log(startDate.getHours());
             
//               const endDate = new Date(startDate);
          
//               console.log({ j }, { startDate }, { endDate });
            
//               const editShift:EditShiftByDateDto = 
//                 {
//                   shiftDate:endDate,
//                    userPreference:'3'
//                   }
                
//                 shiftsToEdit.push(editShift);
//                 // console.log({shiftsToEdit});
//               }
//             }
            
//             const bulkShiftsToEdit:bulkShiftsToEditDto={
//               scheduleId:scheduleId,
//               shiftsEdit:shiftsToEdit,
//             }; 
//             console.log({bulkShiftsToEdit});
//             console.log({shiftsToEdit});
//             return pactom.spec().post('/schedule/editeFuterSceduleForUser/').
//             withHeaders({
//               Authorization: 'Bearer $S{userAt}',
//             }).withBody(bulkShiftsToEdit).expectStatus(200).inspect();



//           });
         
  
//   });
//     describe('Fill Empty schedule',()=>{
//       it('should create new schedule ',()=>{

//         const scheduleStart:Date = new Date(2023,7,1);
//         const dto:generateScheduleForDateDto={
         
//           scedualStart:scheduleStart,
//         }
//          return pactom.spec().post('/schedule/createSchedule/').
//         withHeaders({
//           Authorization: 'Bearer $S{userAt}',
//         }).withBody(dto).expectStatus(200).inspect();
//       })
//     })

// })



//   })

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactom from 'pactum';
import { AuthDto, devAuthDto } from '../src/auth/dto';
import { EditUserDto } from 'src/user/dto/editUser.dto';
import { EditShiftByDateDto, ShiftDto } from '../src/shift/dto';
import { EditShiftDto,bulkShiftsToEditDto } from '../src/shift/dto/index';
import { Role, shift } from '@prisma/client';
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




const { e2e } = require('pactum');
  describe('generate user and schedule',()=>{
    for(let i=1;i<5;i++){
    let case_user_one = e2e('signup');
    

    const dto:AuthDto = {
      email:'testOshri'+i+'@gmail.com',
      password:'1234',
      userRole: i === 4 ? Role.admin: Role.user
    };

      describe('SignUp',()=>{
      console.log({dto})
        it("shoud sign up",async ()=>{
          await case_user_one.step().spec().post('/Auth/Signup').
          withBody(dto).expectStatus(201).inspect();
        });
      });
      describe('SignIn', ()=>{
        
        it("should signin",async ()=>{
        await case_user_one.step().spec().post('/Auth/Signin').
          withBody(dto).expectStatus(200).stores('userAt','acsess_token');
      });

});
  describe('User',()=>{
    describe('Get Me',()=>{
      
      it('should get current user',()=>{
        case_user_one.step().spec().get('/Users/me').
        withHeaders({
          Authorization: 'Bearer $S{userAt}',
        }).expectStatus(200).inspect().stores('userId','id');
      })           
    });
  });
  describe('schedule',()=>{
        describe('CreateNewScheduleForUser',()=>{
          console.log('userAt',`$S{userAt}`);
        // const scedualStart:Date = new Date(2023,6,20,6,0,0);
        //     const  scedualEnd:Date = new Date(scedualStart.getDate()+7);
        //     const dto:scheduleDto = {
        //       scedualStart:scedualStart,
        //       scedualEnd:scedualEnd,
        //       userId :i, 
        //     }
        //     // console.log({dto});

        //   it('should create new schedule for user',async ()=>{
           
        //     await case_user_one.step().spec().post('/schedule/cnScheduleFU/').
        //     withHeaders({
        //       Authorization: 'Bearer $S{userAt}',
        //     }).withBody(dto).expectStatus(200).inspect();
        //   });

        it('should get user next schedule',async ()=>{
          console.log(`$S{userAt}`);
          const result = await case_user_one.step().spec().get('/schedule/getNextSchedule/').
          withHeaders({
            Authorization: 'Bearer $S{userAt}',
          }).withBody({userId:i}).expectStatus(200).inspect();
          console.log({result})
        });
  })
      it('should bulk edit user shift preference for futer schedule ',
       async ()=>{
          const scheduleId = i;  
          const shiftsToEdit: EditShiftByDateDto[] = [] ;
          const currentDate = new Date();
           const start = new Date(
            currentDate.getTime() +
              (7 - currentDate.getDay()) * 24 * 60 * 60 * 1000,
          );
          start.setHours(9,0,0,0);
           for (let i = 0; i < 7; i++) {
            let startDate = new Date(start);
      
            startDate.setDate(startDate.getDate() + i);
      
            const timeZoneCorrection = startDate.getHours() ;
            startDate.setHours(timeZoneCorrection);
      
            const shiftsADay: number = 3; // number of shifts per day, 24 must by divde by it.
            const shiftInterval: number = 24 / shiftsADay; //this will determain time of each shift
            const shiftType: number = 1; //the shift type
            for (let j = 0 ; j < shiftsADay; j++) {
              startDate.setHours((startDate.getHours() + (j < 1 ? 0 : shiftInterval)));
      
              // console.log(startDate.getHours());
             
              const endDate = new Date(startDate);
          
              // console.log({ j }, { startDate }, { endDate });
                let randomNum:number = (Math.floor(Math.random() *3) + 1) ;
                randomNum = (randomNum >3)?3:randomNum;         
              const editShift:EditShiftByDateDto = 
                {
                  shiftDate:endDate,
                   userPreference:randomNum.toString(),
                  }
                
                shiftsToEdit.push(editShift);
                // console.log({shiftsToEdit});
              }
            }
            
            const bulkShiftsToEdit:bulkShiftsToEditDto={
              scheduleId:scheduleId,
              shiftsEdit:shiftsToEdit,
            }; 
            // console.log({bulkShiftsToEdit});
            // console.log({shiftsToEdit});
            await  case_user_one.step().spec().post('/schedule/editeFuterSceduleForUser/').
            withHeaders({
              Authorization: 'Bearer $S{userAt}',
            }).withBody(bulkShiftsToEdit).expectStatus(200).inspect();

            
          });
         
    })
//   // });
//   // });
 }


        }) 
  // /////////////////
    describe('Fill Empty schedule', ()=>{
      it('should create new schedule ',async ()=>{
        const currentDate = new Date();
        const startDate = new Date(
          currentDate.getTime() +
            (7 - currentDate.getDay()) * 24 * 60 * 60 * 1000,
        );
        startDate.setHours(9, 0, 0, 0);
        const endDate = new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000));
        endDate.setHours(9, 0, 0, 0);
        // console.log({ userId });
        const scedualDue:Date = new Date(startDate.getTime() - 4 );
        const dto:generateScheduleForDateDto={
         
          scedualStart:startDate,

        }
         return await pactom.spec().post('/schedule/createSchedule/').
        withHeaders({
          Authorization: 'Bearer $S{userAt}',
        }).withBody(dto).expectStatus(200).inspect().withRequestTimeout(200000);
      },2000000)
    })

    
  

        })









