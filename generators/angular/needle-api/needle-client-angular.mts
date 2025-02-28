/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import chalk from 'chalk';
import _ from 'lodash';

import needleClientBase from '../../client/needle-api/needle-client.mjs';
import { LINE_LENGTH } from '../../generator-constants.mjs';
import { stripMargin } from '../../base/support/index.mjs';
import { clientFrameworkTypes } from '../../../jdl/jhipster/index.mjs';
import { createNeedleCallback } from '../../base/support/needles.mjs';

const { ANGULAR } = clientFrameworkTypes;
export default class extends needleClientBase {
  addGlobalSCSSStyle(style, comment) {
    const filePath = `${this.clientSrcDir}content/scss/global.scss`;
    this.addStyle(style, comment, filePath, 'jhipster-needle-scss-add-main');
  }

  addVendorSCSSStyle(style, comment) {
    const filePath = `${this.clientSrcDir}content/scss/vendor.scss`;
    super.addStyle(style, comment, filePath, 'jhipster-needle-scss-add-vendor');
  }

  addModule(appName, angularName, folderName, fileName, enableTranslation) {
    const modulePath = `${this.clientSrcDir}app/app.module.ts`;
    const importNeedle = 'jhipster-needle-angular-add-module-import';
    const moduleNeedle = 'jhipster-needle-angular-add-module';

    this._genericAddModule(appName, angularName, folderName, fileName, enableTranslation, ANGULAR, modulePath, importNeedle, moduleNeedle);
  }

  addToAdminModule(appName, adminAngularName, adminFolderName, adminFileName, enableTranslation) {
    const adminModulePath = `${this.clientSrcDir}app/admin/admin-routing.module.ts`;
    const importNeedle = 'jhipster-needle-add-admin-module-import';
    const moduleNeedle = 'jhipster-needle-add-admin-module';

    this._genericAddModule(
      appName,
      adminAngularName,
      adminFolderName,
      adminFileName,
      enableTranslation,
      ANGULAR,
      adminModulePath,
      importNeedle,
      moduleNeedle
    );
  }

  _genericAddModule(
    appName,
    angularName,
    folderName,
    fileName,
    enableTranslation,
    clientFramework,
    modulePath,
    importNeedle,
    moduleNeedle
  ) {
    const errorMessage = `${
      chalk.yellow('Reference to ') + angularName + folderName + fileName + enableTranslation + clientFramework
    } ${chalk.yellow(`not added to ${modulePath}.\n`)}`;

    const importRewriteFileModel = this._generateRewriteFileModelWithImportStatement(
      appName,
      angularName,
      folderName,
      fileName,
      modulePath,
      importNeedle
    );
    importRewriteFileModel.prettierAware = true;
    this.addBlockContentToFile(importRewriteFileModel, errorMessage);

    const moduleRewriteFileModel = this._generateRewriteFileModelAddModule(appName, angularName, modulePath, moduleNeedle);
    this.addBlockContentToFile(moduleRewriteFileModel, errorMessage);
  }

  _generateRewriteFileModelWithImportStatement(appName, angularName, folderName, fileName, modulePath, needle) {
    const importStatement = this._generateImportStatement(appName, angularName, folderName, fileName);

    return this.generateFileModel(modulePath, needle, stripMargin(importStatement));
  }

  _generateImportStatement(appName, angularName, folderName, fileName) {
    let importStatement = `|import { ${appName}${angularName}Module } from './${folderName}/${fileName}.module';`;
    if (importStatement.length > LINE_LENGTH) {
      // prettier-ignore
      importStatement = `|import {
                        |    ${appName}${angularName}Module
                        |} from './${folderName}/${fileName}.module';`;
    }

    return importStatement;
  }

  _generateRewriteFileModelAddModule(appName, angularName, modulePath, needle) {
    return this.generateFileModel(modulePath, needle, stripMargin(`|${appName}${angularName}Module,`));
  }

  addIcon(iconName) {
    const iconsPath = `${this.clientSrcDir}app/config/font-awesome-icons.ts`;
    const ignoreNonExisting = this.generator.sharedData.getControl().ignoreNeedlesError && 'Icon imports not updated with icon';
    const iconImport = `fa${this.generator.upperFirstCamelCase(iconName)}`;
    this.generator.editFile(
      iconsPath,
      { ignoreNonExisting },
      createNeedleCallback({
        needle: 'jhipster-needle-add-icon-import',
        contentToCheck: new RegExp(`\\b${iconImport}\\b`),
        contentToAdd: (content, { indentPrefix }) =>
          content.replace(
            /(\r?\n)(\s*)\/\/ jhipster-needle-add-icon-import/g,
            `\n${indentPrefix}${iconImport},\n${indentPrefix}// jhipster-needle-add-icon-import`
          ),
      })
    );
  }

  addEntityToMenu(
    routerName,
    enableTranslation,
    entityTranslationKeyMenu,
    entityTranslationValue = _.startCase(routerName),
    jhiPrefix = 'jhi'
  ) {
    const errorMessage = `${chalk.yellow('Reference to ') + routerName} ${chalk.yellow('not added to menu.\n')}`;
    const entityMenuPath = `${this.clientSrcDir}app/layouts/navbar/navbar.component.html`;
    const routerLink = `routerLink="${routerName}"`;
    const entityEntry =
      // prettier-ignore
      stripMargin(`|<li>
                             |                        <a class="dropdown-item" ${routerLink} routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="collapseNavbar()">
                             |                            <fa-icon icon="asterisk" [fixedWidth]="true"></fa-icon>
                             |                            <span${enableTranslation ? ` ${jhiPrefix}Translate="global.menu.entities.${entityTranslationKeyMenu}"` : ''}>${entityTranslationValue}</span>
                             |                        </a>
                             |                    </li>`);
    const rewriteFileModel = this.generateFileModel(entityMenuPath, 'jhipster-needle-add-entity-to-menu', entityEntry);
    rewriteFileModel.regexp = routerLink;

    this.addBlockContentToFile(rewriteFileModel, errorMessage);
  }

  addElementToMenu(routerName, iconName, enableTranslation, translationKeyMenu = routerName, jhiPrefix = 'jhi') {
    const errorMessage = `${chalk.yellow('Reference to ') + routerName} ${chalk.yellow('not added to menu.\n')}`;
    const entityMenuPath = `${this.clientSrcDir}app/layouts/navbar/navbar.component.html`;
    const routerLink = `routerLink="${routerName}"`;
    // prettier-ignore
    const entityEntry = `<li class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                                <a class="nav-link" ${routerLink} (click)="collapseNavbar()">
                                    <fa-icon icon="${iconName}" [fixedWidth]="true"></fa-icon>
                                    <span${enableTranslation ? ` ${jhiPrefix}Translate="global.menu.${translationKeyMenu}"` : ''}>${_.startCase(routerName)}</span>
                                </a>
                            </li>`;
    const rewriteFileModel = this.generateFileModel(entityMenuPath, 'jhipster-needle-add-element-to-menu', entityEntry);
    rewriteFileModel.regexp = routerLink;

    this.addBlockContentToFile(rewriteFileModel, errorMessage);
    this.addIcon(iconName);
  }

  addElementToAdminMenu(routerName, iconName, enableTranslation, translationKeyMenu = routerName, jhiPrefix = 'jhi') {
    const errorMessage = `${chalk.yellow('Reference to ') + routerName} ${chalk.yellow('not added to admin menu.\n')}`;
    const navbarAdminPath = `${this.clientSrcDir}app/layouts/navbar/navbar.component.html`;
    const routerLink = `routerLink="${routerName}"`;
    // prettier-ignore
    const entityEntry = `<li>
                        <a class="dropdown-item" ${routerLink} routerLinkActive="active" (click)="collapseNavbar()">
                            <fa-icon icon="${iconName}" [fixedWidth]="true"></fa-icon>
                            <span${enableTranslation ? ` ${jhiPrefix}Translate="global.menu.admin.${translationKeyMenu}"` : ''}>${_.startCase(routerName)}</span>
                        </a>
                    </li>`;
    const rewriteFileModel = this.generateFileModel(navbarAdminPath, 'jhipster-needle-add-element-to-admin-menu', entityEntry);
    rewriteFileModel.regexp = routerLink;

    this.addBlockContentToFile(rewriteFileModel, errorMessage);
    this.addIcon(iconName);
  }

  _addRoute(route, modulePath, moduleName, needleName, filePath, pageTitle, { contentToCheck }: { contentToCheck?: string } = {}) {
    const ignoreNonExisting = `${chalk.yellow('Route ') + route + chalk.yellow(` not added to ${filePath}.\n`)}`;
    let pageTitleTemplate = '';
    if (pageTitle) {
      pageTitleTemplate = `
            |        data: { pageTitle: '${pageTitle}' },`;
    }
    const routingEntry = stripMargin(
      `{
            |        path: '${route}',${pageTitleTemplate}
            |        loadChildren: () => import('${modulePath}')${moduleName ? `.then(m => m.${moduleName})` : ''},
            |      },`
    );
    this.generator.editFile(
      filePath,
      { ignoreNonExisting },
      createNeedleCallback({
        needle: needleName,
        contentToAdd: routingEntry,
        ignoreWhitespaces: true,
        contentToCheck: `path: '${route}'`,
        autoIndent: false,
      })
    );
  }

  addEntityToModule(entityAngularName, entityFolderName, entityFileName, entityUrl, microserviceName, pageTitle) {
    const entityModulePath = `${this.clientSrcDir}app/entities/entity-routing.module.ts`;
    const modulePath = `./${entityFolderName}/${entityFileName}.routes`;
    this._addRoute(entityUrl, modulePath, undefined, 'jhipster-needle-add-entity-route', entityModulePath, pageTitle, {
      contentToCheck: `path: '${entityUrl}'`,
    });
  }

  addAdminRoute(route, modulePath, moduleName, pageTitle) {
    const adminModulePath = `${this.clientSrcDir}app/admin/admin-routing.module.ts`;
    this._addRoute(route, modulePath, moduleName, 'jhipster-needle-add-admin-route', adminModulePath, pageTitle);
  }
}
