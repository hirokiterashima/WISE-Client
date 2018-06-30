import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "../modules/shared/shared.module";
import { TeacherRoutingModule } from './teacher-routing.module';
import { TeacherComponent } from './teacher.component';
import { TeacherHomeComponent } from "./teacher-home/teacher-home.component";
import { AuthGuard } from "./auth.guard";
import { TeacherProjectListComponent } from './teacher-project-list/teacher-project-list.component';
import { TeacherProjectListItemComponent } from './teacher-project-list-item/teacher-project-list-item.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MomentModule } from 'angular2-moment';
import {
  MatButtonModule,
  MatCardModule,
  MatIconModule } from '@angular/material';

const materialModules = [
  MatButtonModule,
  MatCardModule,
  MatIconModule
];
@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    materialModules,
    MomentModule,
    SharedModule,
    TeacherRoutingModule
  ],
  declarations: [
    TeacherComponent,
    TeacherHomeComponent,
    TeacherProjectListComponent,
    TeacherProjectListItemComponent
  ],
  providers: [
    AuthGuard
  ],
  exports: [
    TeacherComponent,
    materialModules
  ]
})
export class TeacherModule { }
