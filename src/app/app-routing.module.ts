import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'main',
    loadChildren: () => import('./main/main.module').then( m => m.MainPageModule)
  },
  {
    path: 'delete',
    loadChildren: () => import('./delete/delete.module').then( m => m.DeletePageModule)
  },
  {
    path: '',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'addPage',
    loadChildren: () => import('./add-car/add-car.module').then(m => m.AddCarPageModule)
  },
  {
    path: 'update',
    loadChildren: () => import('./update/update.module').then(m=>m.UpdatePageModule)
  },
  {
    path: 'delete',
    loadChildren: () => import('./delete/delete.module').then(m=> m.DeletePageModule)
  },
  {
    path: 'errorPage',
    loadChildren:() => import('./tab2/tab2.module').then(m=>m.Tab2PageModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./search/search.module').then( m => m.SearchPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
