import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneCheckbox,
  PropertyPaneDropdown,
  PropertyPaneToggle,
  PropertyPaneSlider,
  PropertyPaneChoiceGroup
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'ShowDocsWebPartStrings';
import ShowDocs from './components/ShowDocs';
import { IShowDocsProps } from './props/IShowDocsProps';

import { PropertyPaneAsyncDropdown } from '../../controls/PropertyPaneAsyncDropdown/PropertyPaneAsyncDropdow';
import { IDropdownOption } from 'office-ui-fabric-react/lib/components/Dropdown';
import { update, get } from '@microsoft/sp-lodash-subset';
import { SPHttpClient } from '@microsoft/sp-http';
import { property } from 'lodash';

import { sp } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items/list';
import "@pnp/sp/folders/web";
import { IItem, Items, PagedItemCollection } from '@pnp/sp/items';
import { qry_dets, qry_LargeDocLib, qry_getDocLib, qry_getFile } from './query/camlQuery';
import "@pnp/sp/webs";
import coreui from './style/showDocs.module.scss'
import * as caml from './business/GetItems'
import { format } from 'date-fns';
import * as rendering from './rendering/render'



const docLib: string = 'Documentos';
var documentsLibrary = [];
let header: string = '';
let body: string = '';


export interface IShowDocsWebPartProps {
  description: string;
  listName: string;
  color: string;
  quantItems: string;
  title: string;
  showIcon: boolean;
  fontColor: string;
  year: string;
  icon: string;
  height: string;
  quantCharacter: number;
}

export interface ISPDocs {
  value: ISPDocs[];
}

export interface ISPDocs {
  Name: string;
  TimeLastModified: string;
  TimeCreated: Date;
  ServerRelativeUrl: String;
}

const _body = async (date: string, numberFolder: string, subject: string) => {
  let html = rendering._getHTML(rendering.body(date), { numberFolder: numberFolder, subject: subject });
  return html;
}

const replaceJSX = (str, find, replace): string => {
  let parts = str.split(find);
  let result;
  for (let i = 0, result = []; i < parts.length; i++) {
    result.push(parts[i]);
    result.push(replace);
  }
  return result;
}

export default class ShowDocsWebPart extends BaseClientSideWebPart<IShowDocsWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private _docCollection;
  private _webInfoProvider: any;

  protected onInit(): Promise<void> {
    sp.setup({
      spfxContext: this.context
    });
    this._environmentMessage = this._getEnvironmentMessage();
    this.arrayDocs();
    this.htmlMain();
    return super.onInit();

  }


  private loadLists(): Promise<IDropdownOption[]> {
    return new Promise<IDropdownOption[]>((resolve: (options: IDropdownOption[]) => void, reject: (error: any) => void) => {
      setTimeout(() => {
        resolve(documentsLibrary);
      }, 2000);
    });
  }

  private onListChange(propertyPath: string, newValue: any): void {
    const oldValue: any = get(this.properties, propertyPath);
    // store new value in web part properties
    update(this.properties, propertyPath, (): any => { return newValue; });
    // refresh web part
    this.render();
  }


  private _getFolder(docLib: string): Promise<ISPDocs> {
    return this.context.spHttpClient.get(this.context.pageContext.web.absoluteUrl +
      `/_api/Web/GetFolderByServerRelativePath(decodedurl='/sites/cedoc-hom/${docLib}')/Folders?$top=10`, SPHttpClient.configurations.v1)
      .then((response) => {
        return response.json();
      });
  }

  private htmlMain(): void {
    rendering._header(this.properties.color, this.properties.fontColor, this.properties.title)
      .then((response) => {
        header = response;
      })
  }

  public htmlBody(date: string, numberFolder: string, subject: string): string {
    rendering._body(date, numberFolder, subject).then((response) => { body = response });
    return body;
  }

  private arrayDocs(): void {
    this._getFolder(docLib)
      .then((response) => {
        this._renderList(response.value);
      });
  }

  private _renderFolders(): void {
    caml._normCamlQuery(qry_getFile, this.properties.listName.replace('s', ''), this.properties.year, this.properties.quantItems)
      .then((response) => {
        this._renderDocLib(response);
      });
  }

  private _renderDocLib(items: IItem[]): void {
    let html: string = `<div class="${coreui.divTable}">`;
    let numResult: number = 0;
    console.log(items);
    items.forEach((item: IItem) => {
      if (numResult < parseInt(this.properties.quantItems)) {
        let subject: string = this.properties.listName.toUpperCase() == 'CONTRATOS' ? item["ItObjeto"] : item["ItAssunto"];

        let title: string = '';
        if (!subject && this.properties.listName.toUpperCase() != 'CONTRATOS')
          subject = 'Sem comentários.';
        if (!subject && this.properties.listName.toUpperCase() == 'CONTRATOS')
          subject = 'Objetivo não definido.';

        if (subject.length > this.properties.quantCharacter) {
          title = subject;
          subject = subject.substring(0, this.properties.quantCharacter) + '...';
        }

        let name = item["Title"];//this.properties.listName.toUpperCase() == 'CONTRATOS' ? item["ItNumeroContrato"] : item["ItNumero"];
        name = name.split('.').slice(0, -1).join('.');
        let linkNorma: string = this.properties.listName.toUpperCase() == 'NORMAS' ? item["ServerRedirectedEmbedUri"] : '';
        let link: string = linkNorma ? linkNorma : `${this.context.pageContext.web.absoluteUrl}/Documentos/Forms/AllItems.aspx?id=/sites/cedoc%2Dhom/Documentos/${this.properties.listName}/${name}&env=Embedded`;

        let toolTip: string = this.properties.listName.toUpperCase() == 'CONTRATOS' ? `<span class=${coreui.tooltiptext}>${item["ItContratado"]}</span>` : '';

        html += `
    <div class="${coreui.divTableRow}" style="height:${this.properties.height}px">
	   <div class="${coreui.divTableCell} ${coreui.divBorderLeft}" style="display:${this.properties.showIcon ? '' : 'none'};width: 30px;">
			 <img style="display:${this.properties.showIcon ? '' : 'none'};width: 25px;padding-right: 10px;vertical-align: middle;" src="${this.properties.icon ? this.properties.icon : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}" alt="Pasta">
	   </div>
	   <div class="${coreui.divTableCell} ${coreui.divBorderRight} ${this.properties.showIcon ? '' : `${coreui.divBorderLeft}`}">
		  <div style="height: 1em;">
			  <div style="display: inline-block;width: 50%;">
        <a href=${link} data-interception="off" target="_blank"   rel="noopener noreferrer" style='text-decoration:none;color:#3A3A3A;'>
          <span style="text-transform: uppercase;font-size:1.1em;font-weight: bold;">${item["ItNumero"]}</span>
        </a>
			  </div>
			  <div style="display: inline-block;width: 44%;text-align: right;">
				 ${format(new Date(item["ItData"]), 'dd/MM/yyy')}
			  </div>
			</div>
		<div>
			<div title='${title}'>
      <h5>${toolTip}</h5>
			  ${subject} 
		   </div>
		</div>
	</div>
</div>`;
numResult++;      
}
    })

    // });
    html += "</div>";
    const listContainer: Element = this.domElement.querySelector('#body');
    listContainer.innerHTML = html;
  }

  private _renderList(items: ISPDocs[]): void {
    let keyDdl = 'key';
    let textDdl = 'text';
    let foo: any = '';

    if (documentsLibrary.length == 0) {
      items.forEach((item: ISPDocs) => {
        foo = {
          [keyDdl]: item.Name
        };
        foo[textDdl] = item.Name.toUpperCase();
        documentsLibrary.push(foo);
      }
      )
    }
  }

  public render(): void {
    this.domElement.innerHTML = `<div class="${coreui.divTable}">
    <div class="${coreui.divTableBody}">
        <div class="${coreui.divTableRow}">
          <div class="${coreui.divTableCell}" style="${{ width: "30%" }}; border-bottom:0px;">
          <div class=${coreui.card}>
              <div></div>
              <div class="${coreui.cardBody}" style="background-color: ${this.properties.color}">
                <h5 class="${coreui.cardTitle}" style="color: ${this.properties.fontColor}">${this.properties.title}</h5>
              </div>
              <div id='body'>
              <img src="https://miro.medium.com/max/1072/1*BWyo947yOsigc8SYe0XGgQ.gif" width="100%" height="300" role="presentation">
              </div>
              <div id='loading'>
              </div>
          </div>
        </div>
    </div>
  </div>
</div>`;
    this._renderFolders();
  }

  private _getEnvironmentMessage(): string {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams
      return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
    }

    return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment;
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;
    this.domElement.style.setProperty('--bodyText', semanticColors.bodyText);
    this.domElement.style.setProperty('--link', semanticColors.link);
    this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered);

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const blue: string = require('./assets/blue.png');
    const green: string = require('./assets/green.png');
    const green2: string = require('./assets/green2.png');
    const folderYellow: string = 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20220127.003/assets/item-types/20/folder.svg';
    const folderWhite: string = 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20220127.003/assets/item-types/20/docset.svg';
    const folderFile: string = require('./assets/folderFile.svg');
    const folderPDF: string = 'https://res-1.cdn.office.net/files/fabric-cdn-prod_20220127.003/assets/item-types/20/pdf.svg';
    const quant = [
      { key: "5", text: '5' },
      { key: "10", text: '10' },
      { key: "15", text: '15' }
    ];
    const year = [
      { key: "2022", text: '2022' },
      { key: "2021", text: '2021' },
      { key: "2020", text: '2020' },
      { key: "2019", text: '2019' },
      { key: "2018", text: '2018' },
      { key: "2017", text: '2017' },
      { key: "2016", text: '2016' },
      { key: "2015", text: '2015' },

    ];
    const fontColor = [
      { key: "white", text: 'Branco' },
      { key: "black", text: 'Preto' }
    ];
    const colors = [
      {
        key: '#03787C',
        text: 'Verde Escuro',
        selectedImageSrc: green2,
        imageSrc: green2
      },
      {
        key: '#0078D4',
        text: 'Azul',
        selectedImageSrc: blue,
        imageSrc: blue
      },
      {
        key: '#ABD0BC',
        text: 'Verde Claro',
        selectedImageSrc: green,
        imageSrc: green
      }
    ];

    const icon = [
      {
        key: folderYellow,
        text: '',
        selectedImageSrc: folderYellow,
        imageSrc: folderYellow
      },
      {
        key: folderWhite,
        text: '',
        selectedImageSrc: folderWhite,
        imageSrc: folderWhite
      },
      {
        key: folderFile,
        text: '',
        selectedImageSrc: folderFile,
        imageSrc: folderFile
      },
      {
        key: folderPDF,
        text: '',
        selectedImageSrc: folderPDF,
        imageSrc: folderPDF
      }
    ];

    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,

              groupFields: [
                PropertyPaneTextField('title', {
                  label: 'Título'
                }),
                PropertyPaneDropdown('fontColor', {
                  label: 'Cor do Título',
                  options: fontColor
                }),
                PropertyPaneChoiceGroup('color', {
                  label: "Cor de Fundo do Título",
                  options: colors
                }),
                // new PropertyPaneAsyncDropdown('listName', {
                //   label: strings.ListFieldLabel,
                //   loadOptions: this.loadLists.bind(this),
                //   onPropertyChange: this.onListChange.bind(this),
                //   selectedKey: this.properties.description
                // }),
                // PropertyPaneTextField('test', {
                //   label: 'Descrição',
                //   multiline: true
                // }),
                PropertyPaneDropdown('listName', {
                  label: 'Biblioteca de Documentos',
                  options: documentsLibrary
                }),
                // PropertyPaneDropdown('year', {
                //   label: 'Ano',
                //   options: year
                // }),
                PropertyPaneDropdown('quantItems', {
                  label: 'Quantidade de Items',

                  options: quant
                }),
                PropertyPaneToggle('showIcon', {
                  label: 'Mostrar Ícone',
                  onText: 'Sim',
                  offText: 'Não'
                }),
                PropertyPaneChoiceGroup('icon', {
                  label: "Tipo de Pasta",
                  options: icon
                }),
                PropertyPaneSlider('quantCharacter', {
                  label: 'Quantidade de Caracteres', min: 150, max: 500
                }),
                PropertyPaneSlider('height', {
                  label: 'Altura em Pixels', min: 50, max: 500
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
